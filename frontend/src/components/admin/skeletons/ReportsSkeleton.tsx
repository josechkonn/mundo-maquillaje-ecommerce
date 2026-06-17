import Skeleton from "../../ui/Skeleton";

const ReportsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton className="w-48 h-12 rounded-xl" />
    </div>
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-40 h-6 rounded" />
        <Skeleton className="w-32 h-9 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[130px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="w-full h-[300px] rounded-2xl" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-32 h-4 rounded" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export default ReportsSkeleton;
