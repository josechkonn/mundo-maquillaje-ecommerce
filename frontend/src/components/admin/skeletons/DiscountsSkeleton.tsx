import Skeleton from "../../ui/Skeleton";

const DiscountsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <Skeleton className="w-40 h-8 rounded" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-72 h-[58px] rounded-xl" />
        <Skeleton className="w-[140px] h-[58px] rounded-xl" />
        <Skeleton className="w-[58px] h-[58px] rounded-xl" />
      </div>
    </div>
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="hidden sm:grid grid-cols-[40px_1fr_100px_120px_160px_80px_48px] gap-3 px-6 py-4 bg-brand-50 border-b border-neutral-100">
        <Skeleton className="w-4 h-4 rounded mx-auto" />
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-12 h-3" />
        <Skeleton className="w-14 h-3" />
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-14 h-3" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[40px_1fr_100px_120px_160px_80px_48px] gap-3 px-6 py-4 items-center">
            <Skeleton className="w-4 h-4 rounded mx-auto" />
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-16 h-4" />
            <div className="space-y-1">
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-28 h-3" />
            </div>
            <Skeleton className="w-10 h-5 rounded-full mx-auto" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DiscountsSkeleton;
