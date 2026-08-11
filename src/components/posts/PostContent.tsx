import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { rewriteLegacySupabaseUrls } from '@/lib/storage';

interface PostContentProps {
  content: string;
  contentHtml?: string | null;
}

const hasMarkdownSyntax = (text: string) => {
  // Detect if plain text contains markdown formatting
  return /^#{1,3}\s/m.test(text) || /^\s*[-*]\s/m.test(text) || /\*\*\w/.test(text);
};

const PostContent = ({ content, contentHtml }: PostContentProps) => {
  // If content has markdown syntax, always render via ReactMarkdown for proper formatting
  const useMarkdown = content && hasMarkdownSyntax(content);

  // If we have pre-rendered HTML from TipTap and content isn't markdown, use HTML
  if (contentHtml && !useMarkdown) {
    return (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: rewriteLegacySupabaseUrls(contentHtml) }}
      />
    );
  }

  // Fallback to markdown rendering for legacy posts
  return (
    <div className="prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default PostContent;
