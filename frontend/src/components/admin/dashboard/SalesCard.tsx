import { useState } from "react";
import { useCurrencyStore } from "../../../store/currencyStore";
import { useDashboardData } from "../../../pages/admin/DashboardPage";
import { formatPrice } from "../../../lib/formatters";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import StatCard from "./StatCard";
import SalesByCurrencyModal from "./SalesByCurrencyModal";

const SalesCard = () => {
  const { selectedCurrency } = useCurrencyStore();
  const overview = useDashboardData();
  const sales = overview?.sales;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <StatCard
        title="Ventas Totales"
        value={sales !== undefined && selectedCurrency ? formatPrice(sales.current, selectedCurrency) : "..."}
        change={sales?.change}
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
        onClick={() => setModalOpen(true)}
      />
      <SalesByCurrencyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default SalesCard;
