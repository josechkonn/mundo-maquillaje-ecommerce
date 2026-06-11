import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  children?: ReactNode;
}

const StatsCard = ({ title, value, change, icon, children }: StatsCardProps) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-p-s md:text-p-b font-medium text-text-base">{title}</h3>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <span className="text-h3-b text-text-base">{value}</span>

        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
            {isPositive ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>{Math.abs(change)}%</span>
            <span className="text-text-muted font-normal">vs semana pasada</span>
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

export default StatsCard;
