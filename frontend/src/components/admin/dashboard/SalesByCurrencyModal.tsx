import { useEffect, useState } from "react";
import { dashboardService } from "../../../services/dashboardService";
import Modal from "../../ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface CurrencySale {
  currencyCode: string;
  symbol: string;
  amount: number;
  percentage: number;
}

const SalesByCurrencyModal = ({ isOpen, onClose }: Props) => {
  const [data, setData] = useState<CurrencySale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    dashboardService.getSalesByCurrency()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const formatAmount = (amount: number, symbol: string) => {
    const formatted = new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${symbol} ${formatted}`;
  };

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ventas por Moneda" maxWidth="lg">
      {loading ? (
        <div className="py-8 text-center text-text-muted text-p-sm">Cargando...</div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-text-muted text-p-sm">No hay ventas en este período</div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.currencyCode} className="flex items-center gap-3">
              <span className="w-10 text-xs font-semibold text-neutral-700">{item.currencyCode}</span>
              <div className="flex-1 bg-brand-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-brand-400 rounded-full transition-all duration-500"
                  style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                />
              </div>
              <span className="w-28 text-right text-xs font-semibold text-brand-400">
                {formatAmount(item.amount, item.symbol)}
              </span>
              <span className="w-12 text-right text-xs text-text-muted">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default SalesByCurrencyModal;
