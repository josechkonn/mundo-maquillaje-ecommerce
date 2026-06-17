import Skeleton from "../../ui/Skeleton";

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-[20px] p-6 shadow-sm border border-neutral-100 min-h-[190px] space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-5 rounded" />
            <Skeleton className="w-9 h-9 rounded-lg" />
          </div>
          <Skeleton className="w-28 h-8 rounded" />
          <Skeleton className="w-36 h-4 rounded" />
        </div>
      ))}
      <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100 row-span-2 space-y-4">
        <Skeleton className="w-36 h-5 rounded" />
        <div className="mx-auto w-48 h-48">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-11/12 h-4 rounded" />
          ))}
        </div>
      </div>
      <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-40 h-5 rounded" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-7 rounded-md" />
            <Skeleton className="w-16 h-7 rounded-md" />
            <Skeleton className="w-16 h-7 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-full h-[200px] rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100 space-y-4 col-span-1">
        <Skeleton className="w-28 h-5 rounded" />
        <Skeleton className="w-20 h-7 rounded" />
      </div>
      <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100 space-y-4 col-span-1">
        <Skeleton className="w-28 h-5 rounded" />
        <div className="space-y-2">
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-full h-3 rounded" />
        </div>
      </div>
      <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100 space-y-4 col-span-1 md:col-span-2">
        <Skeleton className="w-28 h-5 rounded" />
        <Skeleton className="w-full h-[120px] rounded-xl" />
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
