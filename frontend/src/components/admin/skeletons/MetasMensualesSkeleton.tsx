import Skeleton from "../../ui/Skeleton";

const MetasMensualesSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <Skeleton className="w-48 h-8 rounded" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-32 h-6 rounded" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[30px] border border-neutral-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="w-16 h-5 rounded" />
              <Skeleton className="w-24 h-3 rounded" />
            </div>
            <Skeleton className="w-10 h-5 rounded-full" />
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-36 h-36">
              <Skeleton className="w-full h-full rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="w-16 h-4 rounded" />
              <Skeleton className="w-20 h-4 rounded" />
            </div>
            <Skeleton className="w-full h-2 rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="w-20 h-3 rounded" />
              <Skeleton className="w-24 h-3 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MetasMensualesSkeleton;
