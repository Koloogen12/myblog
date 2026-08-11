// Generate SEO/GEO metadata for a post.
//
// Runs server-side for one reason: the LLM API key must never reach the
// browser bundle. The admin UI calls this with the editor's own JWT, we verify
// the caller is an admin, then talk to the model with a key held in Supabase
// secrets (COMET_API_KEY).
//
// Deploy:  supabase functions deploy generate-seo
// Secrets: supabase secrets set COMET_API_KEY=...

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const COMET_ENDPOINT = 'https://api.cometapi.com/v1/chat/completions';
// Haiku is plenty for metadata extraction and keeps this fast/cheap: a full
// article runs ~1.5k tokens and returns in a few seconds.
const MODEL = Deno.env.get('SEO_MODEL') ?? 'claude-haiku-4-5-20251001';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

/**
 * The prompt encodes what actually drives AI citation (Princeton GEO study,
 * KDD 2024): self-contained answers, concrete numbers, natural-language
 * questions — and explicitly NOT keyword stuffing, which measurably lowers
 * visibility.
 */
function buildPrompt(title: string, content: string, category: string) {
  return `Ты SEO-редактор русскоязычного блога о продуктах, стартапах и AI.
Автор — Данил Кочнев, серийный IT-предприниматель (THE MONO, NEURIN AI, MakeMeLook).

Статья (рубрика: ${category || 'не указана'})
Заголовок: ${title}

${content.slice(0, 12000)}

Составь метаданные. Правила:
- seo_title: до 60 символов, суть статьи, без кликбейта. Имя автора НЕ добавляй.
- seo_description: до 160 символов, конкретика вместо общих слов, повод открыть.
- focus_keyword: один запрос, которым эту статью реально будут искать.
- keywords: 5-8 запросов по теме. Это карта тем, а не набивка текста.
- tldr: 40-60 слов. Законченный ответ, понятный БЕЗ статьи — именно его цитируют
  нейросети. Конкретные факты и цифры из текста, а не пересказ оглавления.
- faq: 3-5 пар. Вопросы — как их задают живым языком в поиске и чат-ботах.
  Ответы — 2-3 предложения, самодостаточные, по фактам статьи.

Ничего не выдумывай: бери только то, что есть в тексте.
Верни ТОЛЬКО JSON, без markdown-обёртки и пояснений:
{"seo_title":"","seo_description":"","focus_keyword":"","keywords":[],"tldr":"","faq":[{"question":"","answer":""}]}`;
}

/** Models like wrapping JSON in ```json fences despite instructions. */
function parseModelJson(raw: string) {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start > 0 || end < text.length - 1) text = text.slice(start, end + 1);
  return JSON.parse(text);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const apiKey = Deno.env.get('COMET_API_KEY');
    if (!apiKey) return json({ error: 'COMET_API_KEY is not configured' }, 500);

    // ── Auth: admins only ────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'Not authenticated' }, 401);
    if ((userData.user.app_metadata as { role?: string })?.role !== 'admin') {
      return json({ error: 'Admin role required' }, 403);
    }

    // ── Input: either a saved post id, or raw text for an unsaved draft ──
    const payload = await req.json().catch(() => ({}));
    let { title, content, category } = payload as {
      title?: string;
      content?: string;
      category?: string;
    };

    if (payload.postId) {
      const { data: post, error } = await supabase
        .from('posts')
        .select('title, content, category')
        .eq('id', payload.postId)
        .single();
      if (error || !post) return json({ error: 'Post not found' }, 404);
      title = post.title;
      content = post.content;
      category = post.category;
    }

    if (!title?.trim() || !content?.trim()) {
      return json({ error: 'Нужны заголовок и текст статьи' }, 400);
    }

    // ── Generate ─────────────────────────────────────────────────────────
    const aiRes = await fetch(COMET_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        temperature: 0.4,
        messages: [{ role: 'user', content: buildPrompt(title, content, category ?? '') }],
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      console.error('CometAPI error', aiRes.status, detail.slice(0, 500));
      return json({ error: `Модель вернула ${aiRes.status}` }, 502);
    }

    const completion = await aiRes.json();
    const raw = completion?.choices?.[0]?.message?.content ?? '';

    let parsed;
    try {
      parsed = parseModelJson(raw);
    } catch (_e) {
      console.error('Unparseable model output:', raw.slice(0, 500));
      return json({ error: 'Модель вернула неразбираемый ответ, попробуй ещё раз' }, 502);
    }

    // Normalise so the client always gets the same shape.
    return json({
      seo_title: String(parsed.seo_title ?? '').trim(),
      seo_description: String(parsed.seo_description ?? '').trim(),
      focus_keyword: String(parsed.focus_keyword ?? '').trim(),
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.map((k: unknown) => String(k).trim()).filter(Boolean)
        : [],
      tldr: String(parsed.tldr ?? '').trim(),
      faq: Array.isArray(parsed.faq)
        ? parsed.faq
            .map((f: { question?: unknown; answer?: unknown }) => ({
              question: String(f?.question ?? '').trim(),
              answer: String(f?.answer ?? '').trim(),
            }))
            .filter((f: { question: string; answer: string }) => f.question && f.answer)
        : [],
      usage: completion?.usage ?? null,
      model: MODEL,
    });
  } catch (err) {
    console.error('generate-seo failed', err);
    return json({ error: String(err) }, 500);
  }
});
