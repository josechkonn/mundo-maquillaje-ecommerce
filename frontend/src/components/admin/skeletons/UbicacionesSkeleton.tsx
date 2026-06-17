import Skeleton from "../../ui/Skeleton";

const UbicacionesSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Skeleton className="w-40 h-8 rounded" />
        <Skeleton className="w-52 h-4 rounded mt-1" />
      </div>
      <Skeleton className="w-36 h-12 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, colIdx) => (
        <div key={colIdx} className="bg-white rounded-[30px] border border-neutral-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <Skeleton className="w-24 h-5 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="w-9 h-9 rounded-xl" />
            </div>
          </div>
          <div className="px-4 py-3">
            <Skeleton className="w-full h-[46px] rounded-xl" />
          </div>
          <div className="divide-y divide-neutral-100 max-h-[400px] overflow-y-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-6 h-4 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default UbicacionesSkeleton;
