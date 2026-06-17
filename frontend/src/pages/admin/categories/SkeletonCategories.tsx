import Skeleton from "../../../components/ui/Skeleton";

const SkeletonCategories = () => (
  <div className="animate-fade-in space-y-6">
    {/* Header + Filters */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-36 h-7" />
        <Skeleton className="w-48 h-4" />
      </div>
      <div className="flex items-stretch sm:items-center gap-3">
        <Skeleton className="w-full sm:w-60 h-[46px] rounded-xl" />
        <Skeleton className="w-[200px] h-[46px] rounded-xl" />
        <Skeleton className="w-[46px] h-[46px] rounded-xl" />
        <Skeleton className="w-[108px] h-[46px] rounded-xl" />
      </div>
    </div>

    {/* Table skeleton */}
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
      {/* Column headers */}
      <div className="hidden sm:grid grid-cols-[40px_48px_1fr_120px_100px_72px_48px] gap-3 px-6 py-4 bg-brand-50 border-b border-neutral-100">
        <Skeleton className="w-4 h-4 rounded mx-auto" />
        <div />
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-16 h-3 ml-auto" />
        <Skeleton className="w-20 h-3 mx-auto" />
        <Skeleton className="w-12 h-3 mx-auto" />
        <div />
      </div>

      {/* Rows */}
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[40px_48px_1fr_120px_100px_72px_48px] gap-3 px-6 py-4 items-center"
          >
            <Skeleton className="w-4 h-4 rounded mx-auto" />
            <div className="flex items-center justify-center">
              <Skeleton className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-20 h-3" />
              </div>
            </div>
            <Skeleton className="w-8 h-4 ml-auto" />
            <Skeleton className="w-6 h-4 mx-auto" />
            <div className="flex items-center justify-center">
              <Skeleton className="w-10 h-5 rounded-full" />
            </div>
            <div className="flex items-center justify-center">
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SkeletonCategories;
