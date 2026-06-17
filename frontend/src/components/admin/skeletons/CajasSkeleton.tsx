import Skeleton from "../../ui/Skeleton";

const CajasSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Skeleton className="w-28 h-8 rounded" />
        <Skeleton className="w-48 h-4 rounded mt-1" />
      </div>
      <Skeleton className="w-40 h-12 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[30px] border border-neutral-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Skeleton className="w-24 h-5 rounded" />
                <Skeleton className="w-14 h-3 rounded" />
              </div>
              <Skeleton className="w-3 h-3 rounded-full" />
            </div>
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <div className="space-y-1">
            <Skeleton className="w-20 h-3 rounded" />
            <Skeleton className="w-32 h-8 rounded" />
          </div>
          <Skeleton className="w-full h-px" />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-2xl p-3 space-y-1">
              <Skeleton className="w-10 h-3 rounded" />
              <Skeleton className="w-20 h-5 rounded" />
            </div>
            <div className="bg-red-50 rounded-2xl p-3 space-y-1">
              <Skeleton className="w-10 h-3 rounded" />
              <Skeleton className="w-16 h-5 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CajasSkeleton;
