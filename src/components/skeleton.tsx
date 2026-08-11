/**
 * Skeletons are sized to the real content they replace, so the page does not jump
 * when data arrives. A spinner on a full page tells someone nothing; a shape tells
 * them what is coming.
 */
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`block animate-pulse rounded-[10px] bg-primary-muted ${className}`}
  />
);

export const ScreenSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div
    role="status"
    aria-label="Loading"
    className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-5 py-10"
  >
    <div className="flex flex-col gap-3">
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
    </div>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton key={index} className={index === 0 ? 'h-40' : 'h-28'} />
    ))}
  </div>
);
