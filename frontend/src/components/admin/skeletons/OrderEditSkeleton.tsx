import Skeleton from "../../ui/Skeleton";

const OrderEditSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="w-48 h-8 rounded" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-4">
          <Skeleton className="w-32 h-6 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-full h-[46px] rounded-xl" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="w-28 h-4 rounded" />
            <Skeleton className="w-full h-24 rounded-xl" />
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-4">
          <Skeleton className="w-32 h-6 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-2xl">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="w-32 h-4 rounded" />
                  <Skeleton className="w-20 h-3 rounded" />
                </div>
                <Skeleton className="w-20 h-4 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-4">
          <Skeleton className="w-28 h-6 rounded" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="w-16 h-4 rounded" />
              <Skeleton className="w-20 h-4 rounded" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-12 h-4 rounded" />
              <Skeleton className="w-16 h-4 rounded" />
            </div>
            <div className="border-t border-neutral-100 pt-2 flex justify-between">
              <Skeleton className="w-16 h-5 rounded" />
              <Skeleton className="w-24 h-5 rounded" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-4">
          <Skeleton className="w-32 h-6 rounded" />
          <Skeleton className="w-full h-24 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export default OrderEditSkeleton;
