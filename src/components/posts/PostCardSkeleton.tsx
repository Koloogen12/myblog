const PostCardSkeleton = () => (
  <div className="py-5 animate-pulse">
    <div className="flex gap-4">
      <div className="flex-1 space-y-2.5">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
        <div className="flex gap-3 pt-1">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
      <div className="w-24 h-24 bg-muted rounded-lg shrink-0 hidden sm:block" />
    </div>
  </div>
);

export const PostFeedSkeleton = () => (
  <div className="divide-y divide-border">
    {Array.from({ length: 5 }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

export default PostCardSkeleton;
