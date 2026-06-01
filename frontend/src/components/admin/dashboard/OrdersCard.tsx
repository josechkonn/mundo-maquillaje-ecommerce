import { useState } from "react";
import { useDashboardData } from "../../../pages/admin/DashboardPage";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import StatCard from "./StatCard";
import OrdersByCurrencyModal from "./OrdersByCurrencyModal";

const OrdersCard = () => {
  const overview = useDashboardData();
  const orders = overview?.orders;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <StatCard
        title="Pedidos Totales"
        value={orders !== undefined ? orders.current.toLocaleString() : "..."}
        change={orders?.change}
        icon={<ShoppingCartIcon className="w-5 h-5" />}
        onClick={() => setModalOpen(true)}
      />
      <OrdersByCurrencyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default OrdersCard;
