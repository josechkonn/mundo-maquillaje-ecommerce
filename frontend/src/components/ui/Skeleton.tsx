interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse bg-neutral-200 rounded-xl ${className}`} />
);

export default Skeleton;
