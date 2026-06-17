import Skeleton from "../../ui/Skeleton";

const MonedasSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Skeleton className="w-40 h-8 rounded" />
        <Skeleton className="w-56 h-4 rounded mt-1" />
      </div>
      <Skeleton className="w-36 h-12 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[30px] border border-neutral-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="w-20 h-5 rounded" />
                <Skeleton className="w-14 h-3 rounded" />
              </div>
            </div>
            <Skeleton className="w-10 h-5 rounded-full" />
          </div>
          <Skeleton className="w-full h-[46px] rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="w-12 h-3 rounded" />
              <Skeleton className="w-full h-[42px] rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="w-12 h-3 rounded" />
              <Skeleton className="w-full h-[42px] rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-neutral-100">
            <Skeleton className="flex-1 h-10 rounded-xl" />
            <Skeleton className="flex-1 h-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MonedasSkeleton;
