import Skeleton from "../../ui/Skeleton";

const MarcasSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Skeleton className="w-36 h-8 rounded" />
        <Skeleton className="w-44 h-4 rounded mt-1" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="w-72 h-[58px] rounded-xl" />
        <Skeleton className="w-[58px] h-[58px] rounded-xl" />
      </div>
    </div>
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="hidden sm:grid grid-cols-[40px_60px_1fr_72px_48px] gap-3 px-6 py-4 bg-brand-50 border-b border-neutral-100">
        <Skeleton className="w-4 h-4 rounded mx-auto" />
        <Skeleton className="w-10 h-3" />
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-12 h-3" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[40px_60px_1fr_72px_48px] gap-3 px-6 py-4 items-center">
            <Skeleton className="w-4 h-4 rounded mx-auto" />
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="w-28 h-4" />
              <Skeleton className="w-36 h-3" />
            </div>
            <Skeleton className="w-10 h-5 rounded-full mx-auto" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default MarcasSkeleton;
