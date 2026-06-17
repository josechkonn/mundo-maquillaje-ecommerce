import Skeleton from "react-loading-skeleton";

const AdminSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[20px] p-6 shadow-sm border border-neutral-100 min-h-[190px] space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton width={100} height={20} borderRadius={4} />
              <Skeleton width={35} height={35} borderRadius={8} />
            </div>
            <Skeleton width={120} height={28} borderRadius={4} />
          </div>
        ))}
        <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100 row-span-2 space-y-4">
          <Skeleton width={140} height={20} borderRadius={4} />
          <div className="mx-auto w-48 h-48">
            <Skeleton width="100%" height="100%" borderRadius="50%" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={16} width="90%" borderRadius={4} />
            ))}
          </div>
        </div>
        <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <Skeleton width={160} height={20} borderRadius={4} />
            <div className="flex gap-2">
              <Skeleton width={60} height={28} borderRadius={6} />
              <Skeleton width={60} height={28} borderRadius={6} />
              <Skeleton width={60} height={28} borderRadius={6} />
            </div>
          </div>
          <Skeleton height={200} borderRadius={12} />
        </div>
      </div>
    </div>
  );
};

export default AdminSkeleton;
