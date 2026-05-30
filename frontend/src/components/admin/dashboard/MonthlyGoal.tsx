import { useCurrencyStore } from "../../../store/currencyStore";
import { useDashboardData } from "../../../pages/admin/DashboardPage";
import { formatPrice } from "../../../lib/formatters";

const MonthlyGoal = () => {
  const { selectedCurrency } = useCurrencyStore();
  const overview = useDashboardData();
  const goalData = overview?.monthlyGoal;

  if (!goalData || !selectedCurrency) {
    return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100">
        <h5 className="font-bold text-text-base mb-4">Objetivo Mensual</h5>
        <p className="text-text-muted text-sm">Cargando...</p>
      </div>
    );
  }

  const percentage = goalData.goal > 0 ? Math.min((goalData.current / goalData.goal) * 100, 100) : 0;
  const prev = goalData.previous || 0;
  const monthChange = prev > 0 ? ((goalData.current - prev) / prev) * 100 : 0;
  const increase = goalData.current - prev;

  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke;
  const circumference = Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100">
      <h5 className="font-bold text-text-base mb-4">Objetivo Mensual</h5>

      <div className="flex flex-col items-center">
        <div className="relative w-36 h-20 mb-2">
          <svg width="140" height="80" viewBox="0 0 140 80">
            <path
              d={`M ${stroke} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke} ${radius}`}
              fill="none"
              stroke="#f0f0f0"
              strokeWidth={stroke}
              strokeLinecap="round"
            />
            <path
              d={`M ${stroke} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke} ${radius}`}
              fill="none"
              stroke="#E6426E"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className="font-bold text-brand-400 text-lg">{percentage.toFixed(0)}%</span>
          </div>
        </div>

        <p className="text-xs text-neutral-700 mb-1">
          {monthChange >= 0 ? "+" : ""}{monthChange.toFixed(0)}% respecto al mes pasado
        </p>

        <p className="text-sm sm:text-base font-bold text-text-base mb-1">
          {monthChange >= 20 ? "¡Gran progreso!" : monthChange >= 0 ? "Buen progreso" : "Sigamos adelante"}
        </p>

        <p className="text-xs text-text-muted text-center mb-4">
          Tu logro aumentó en {formatPrice(Math.abs(increase), selectedCurrency)}. {percentage >= 100 ? "¡Meta alcanzada!" : "¡Alcanza el 100% el próximo mes!"}
        </p>

        <div className="flex w-full pt-3 gap-0">
          <div className="flex-1 text-center pr-3 bg-brand-100 rounded-l-xl py-2">
            <p className="text-xs text-neutral-700">Objetivo</p>
            <p className="font-bold text-brand-400 text-lg">{formatPrice(goalData.goal, selectedCurrency)}</p>
          </div>
          <div className="w-px bg-white" />
          <div className="flex-1 text-center pl-3 bg-brand-100 rounded-r-xl py-2">
            <p className="text-xs text-neutral-700">Ingreso</p>
            <p className="font-bold text-brand-400 text-lg">{formatPrice(goalData.current, selectedCurrency)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyGoal;
