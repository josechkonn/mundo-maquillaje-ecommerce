import Skeleton from "../../ui/Skeleton";

const SettingsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div>
      <Skeleton className="w-36 h-8 rounded" />
      <Skeleton className="w-48 h-4 rounded mt-1" />
    </div>
    <div className="flex gap-2 border-b border-neutral-200 pb-px">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="w-28 h-10 rounded-t-lg" />
      ))}
    </div>
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-24 h-4 rounded" />
            <Skeleton className="w-full h-[46px] rounded-xl" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-4 rounded" />
        <Skeleton className="w-full h-[120px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-20 h-4 rounded" />
            <Skeleton className="w-full h-[46px] rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SettingsSkeleton;
