import { useDashboardData } from "../../../pages/admin/DashboardPage";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import StatCard from "./StatCard";

const VisitorsCard = () => {
  const overview = useDashboardData();
  const visitors = overview?.visitors;

  return (
    <StatCard
      title="Visitantes Totales"
      value={visitors !== undefined ? visitors.current.toLocaleString() : "..."}
      change={visitors?.change}
      icon={<UserGroupIcon className="w-5 h-5" />}
    />
  );
};

export default VisitorsCard;
