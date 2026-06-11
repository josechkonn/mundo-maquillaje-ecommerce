import { useEffect, useState } from "react";
import { dashboardService } from "../../../services/dashboardService";
import { useDashboardDateStore } from "../../../store/dashboardDateStore";
import Modal from "../../ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface CurrencyOrder {
  currencyCode: string;
  symbol: string;
  count: number;
  percentage: number;
}

const OrdersByCurrencyModal = ({ isOpen, onClose }: Props) => {
  const [data, setData] = useState<CurrencyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { startDate, endDate } = useDashboardDateStore();

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const sDate = startDate || undefined;
    const eDate = endDate || undefined;
    dashboardService.getOrdersByCurrency(sDate, eDate)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [isOpen, startDate, endDate]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pedidos por Moneda" maxWidth="lg">
      {loading ? (
        <div className="text-center text-text-muted text-p-sm">Cargando...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-text-muted text-p-sm">No hay pedidos en este período</div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.currencyCode} className="flex items-center gap-3">
              <span className="w-10 text-xs font-semibold text-neutral-700">{item.currencyCode}</span>
              <div className="flex-1 bg-brand-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-brand-300 rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right text-xs font-semibold text-brand-400">
                {item.count}
              </span>
              <span className="w-12 text-right text-xs text-text-muted">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default OrdersByCurrencyModal;
