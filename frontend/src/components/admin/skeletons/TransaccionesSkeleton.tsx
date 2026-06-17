import Skeleton from "../../ui/Skeleton";

const TransaccionesSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <Skeleton className="w-44 h-8 rounded" />
        <Skeleton className="w-64 h-4 rounded mt-1" />
      </div>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="w-24 h-10 rounded-xl shrink-0" />
      ))}
    </div>
    <div className="flex gap-3 overflow-x-auto pb-2">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="min-w-[160px] h-[88px] rounded-2xl shrink-0" />
      ))}
    </div>
    <div className="bg-white rounded-[30px] border border-neutral-100 shadow-sm p-6 md:p-8">
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, groupIdx) => (
          <div key={groupIdx}>
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-20 h-4 rounded" />
              <div className="flex-1 h-px bg-neutral-100" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, itemIdx) => (
                <div key={itemIdx} className="flex items-center gap-4 p-4">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-36 h-4 rounded" />
                      <Skeleton className="w-20 h-5 rounded-full" />
                    </div>
                    <Skeleton className="w-24 h-3 rounded" />
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <Skeleton className="w-20 h-4 rounded" />
                    <Skeleton className="w-14 h-3 rounded ml-auto" />
                  </div>
                  <Skeleton className="w-4 h-4 rounded shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TransaccionesSkeleton;
