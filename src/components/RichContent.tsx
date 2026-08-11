import { rewriteLegacySupabaseUrls } from '@/lib/storage';

interface RichContentProps {
  value: string | undefined | null;
  /** Tailwind classes applied to the wrapper (typically prose variants). */
  className?: string;
}

const HTML_DETECT = /<\/?(p|h[1-6]|ul|ol|li|blockquote|hr|br|strong|em|u|a|img|figure|table)\b/i;

/**
 * Render a string that may be either:
 *   - new-format HTML (from RichTextField / TipTap), or
 *   - legacy plain text with `\n\n` paragraph separators.
 *
 * Source is always our admin (single trusted author); TipTap only serialises
 * a safe whitelist of nodes/marks, so we render via dangerouslySetInnerHTML
 * without an extra sanitiser. Returns null for empty values.
 */
export const RichContent = ({ value, className }: RichContentProps) => {
  if (!value) return null;

  if (HTML_DETECT.test(value)) {
    return (
      <div
        className={className}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: rewriteLegacySupabaseUrls(value) }}
      />
    );
  }

  // Plain-text fallback (legacy data)
  const paragraphs = value.split(/\n\n+/).filter(Boolean);
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
};

export default RichContent;
