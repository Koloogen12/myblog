/**
 * RSS feed generator — run after build or on schedule
 * Usage: npx tsx scripts/generate-rss.ts
 */

const SUPABASE_URL = 'https://mxttoiqtviaobotoekxw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dHRvaXF0dmlhb2JvdG9la3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNDQ0MjIsImV4cCI6MjA5MDkyMDQyMn0.bOmVtAGkUR6wY1ADfR3FtgP0f3CiFjcQs5WIp1LrKeI';
const SITE_URL = 'https://dkochnev.com';

interface Post {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  published_at: string;
  category: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateRSS() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?is_published=eq.true&order=published_at.desc&limit=50&select=title,slug,excerpt,content,published_at,category`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to fetch posts:', response.statusText);
    process.exit(1);
  }

  const posts: Post[] = await response.json();

  const items = posts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/post/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/post/${post.slug}</guid>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
      ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ''}
    </item>`).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Данил Кочнев</title>
    <link>${SITE_URL}</link>
    <description>Serial founder из Москвы. Пишу о продуктах, стартапах и реальности фаундера.</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  const fs = await import('fs');
  const path = await import('path');

  // Write to both public and dist
  const publicPath = path.join(process.cwd(), 'public', 'rss.xml');
  fs.writeFileSync(publicPath, rss, 'utf-8');
  console.log(`RSS feed written to ${publicPath} (${posts.length} posts)`);

  const distPath = path.join(process.cwd(), 'dist', 'rss.xml');
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    fs.writeFileSync(distPath, rss, 'utf-8');
    console.log(`RSS feed written to ${distPath}`);
  }
}

generateRSS().catch(console.error);
