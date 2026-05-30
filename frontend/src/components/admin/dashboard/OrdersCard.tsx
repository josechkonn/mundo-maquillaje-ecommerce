import { useDashboardData } from "../../../pages/admin/DashboardPage";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import StatCard from "./StatCard";

const OrdersCard = () => {
  const overview = useDashboardData();
  const orders = overview?.orders;

  return (
    <StatCard
      title="Pedidos Totales"
      value={orders !== undefined ? orders.current.toLocaleString() : "..."}
      change={orders?.change}
      icon={<ShoppingCartIcon className="w-5 h-5" />}
    />
  );
};

export default OrdersCard;
