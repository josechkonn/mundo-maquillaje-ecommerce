import type { ReactNode } from "react";
import Tooltip from "../../ui/Tooltip";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change?: number;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon, change, onClick }: StatCardProps) => {
  const hasChange = change !== undefined;
  const isClickable = !!onClick;

  return (
    <div
      className={`flex flex-col justify-between bg-white rounded-[20px] p-6 shadow-sm border border-neutral-100 min-h-[190px] ${isClickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h5 className="font-bold">{title}</h5>
        <div className="w-[35px] h-[35px] bg-brand-300 rounded-lg flex items-center justify-center text-white" style={{ boxShadow: "0 0 6px rgba(34,34,34,0.35)" }}>
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 min-w-0">
        {value !== "..." ? (
          <Tooltip text={value}>
            <h4 className="text-brand-400 font-bold truncate min-w-0">{value}</h4>
          </Tooltip>
        ) : (
          <h4 className="text-brand-400 font-bold truncate min-w-0">...</h4>
        )}

        {hasChange && (
          <div className="flex flex-col items-end flex-shrink-0">
            <span
              className="text-p-s md:text-p-b font-bold whitespace-nowrap"
              style={{ color: change >= 0 ? "#54D027" : "#FF3C3C" }}
            >
              {change >= 0 ? "+" : ""}{change}%
            </span>
            <span className="text-p-sm font-normal text-neutral-800">vs semana pasada</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
