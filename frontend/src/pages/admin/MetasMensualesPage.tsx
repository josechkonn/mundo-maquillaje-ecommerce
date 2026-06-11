import { useState, useEffect } from "react";
import {
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Drawer from "../../components/ui/Drawer";
import { monthlyGoalService, type MonthlyGoal } from "../../services/monthlyGoalService";
import MetasMensualesSkeleton from "../../components/admin/skeletons/MetasMensualesSkeleton";
import { currencyService } from "../../services/currencyService";
import { type Currency } from "../../services/productService";
import toast from "react-hot-toast";

/* ─── Helpers ─── */
const formatMoney = (amount: number, symbol: string, position: "LEFT" | "RIGHT", decimals: number) => {
  const str = (amount || 0).toLocaleString("es-VE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return position === "LEFT" ? `${symbol}${str}` : `${str} ${symbol}`;
};

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/* ─── Radial Ring Component ─── */
const RadialRing = ({ percentage, color, size = 160, stroke = 8 }: { percentage: number; color: string; size?: number; stroke?: number }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
};

/* ─── Smart Input Component ─── */
const SmartInput = ({
  value,
  onChange,
  symbol,
  symbolPosition,
}: {
  value: string;
  onChange: (val: string) => void;
  symbol: string;
  symbolPosition: "LEFT" | "RIGHT";
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.]/g, "");
    onChange(raw);
  };

  return (
    <div className="flex items-center rounded-xl border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden flex-1">
      {symbolPosition === "LEFT" && (
        <span className="shrink-0 px-3 py-2.5 text-sm font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200">
          {symbol}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        placeholder="0.00"
        className="flex-1 py-2.5 px-3 text-sm font-bold text-text-base outline-none bg-transparent min-w-0"
      />
      {symbolPosition === "RIGHT" && (
        <span className="shrink-0 px-3 py-2.5 text-sm font-bold text-neutral-500 bg-neutral-50 border-l border-neutral-200">
          {symbol}
        </span>
      )}
    </div>
  );
};

const MetasMensualesPage = () => {
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [saving, setSaving] = useState(false);

  // Drawer state: map currencyCode -> goalAmount string
  const [draftGoals, setDraftGoals] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      monthlyGoalService.getGoalsForMonth(selectedMonth + 1, selectedYear),
      currencyService.getAllCurrencies(),
    ])
      .then(([goalsData, currenciesData]) => {
        console.log("Goals loaded:", goalsData);
        console.log("Currencies loaded:", currenciesData);
        setGoals(goalsData || []);
        setCurrencies((currenciesData || []).filter((c) => c.isActive !== false));
      })
      .catch((err) => {
        console.error("Error loading goals:", err);
        toast.error("Error al cargar metas");
      })
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear]);

  const openDrawer = () => {
    const drafts: Record<string, string> = {};
    goals.forEach((g) => {
      drafts[g.currency.code] = g.goalAmount > 0 ? String(g.goalAmount) : "";
    });
    currencies.forEach((c) => {
      if (!(c.code in drafts)) drafts[c.code] = "";
    });
    setDraftGoals(drafts);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payloads = Object.entries(draftGoals)
      .filter(([, amount]) => amount && parseFloat(amount) > 0)
      .map(([code, amount]) => ({
        currencyCode: code,
        month: selectedMonth + 1,
        year: selectedYear,
        goalAmount: parseFloat(amount),
      }));

    try {
      if (payloads.length === 1) {
        await monthlyGoalService.setGoal(payloads[0]);
      } else if (payloads.length > 1) {
        await monthlyGoalService.setGoalsBatch(payloads);
      }
      toast.success("Metas aplicadas correctamente");
      setDrawerOpen(false);
      const refreshed = await monthlyGoalService.getGoalsForMonth(selectedMonth + 1, selectedYear);
      setGoals(refreshed);
    } catch (err) {
      console.error("Error saving goals:", err);
      toast.error("Error al guardar metas");
    }
    setSaving(false);
  };

  const getTrendIcon = (g: MonthlyGoal) => {
    if (g.projectedPercentage > g.percentage + 5) return <ArrowTrendingUpIcon className="w-4 h-4 text-success-500" />;
    if (g.projectedPercentage < g.percentage - 5) return <ArrowTrendingDownIcon className="w-4 h-4 text-danger-500" />;
    return <MinusIcon className="w-4 h-4 text-neutral-400" />;
  };

  const getRingColor = (percentage: number) => {
    if (percentage >= 100) return "#54D027";
    if (percentage >= 75) return "#E11546";
    if (percentage >= 50) return "#F59E0B";
    return "#9CA3AF";
  };

  const handleMagicPill = (code: string, type: "+5%" | "+10%" | "same") => {
    const goal = goals.find((g) => g.currency.code === code);
    const base = goal?.previousMonthAverage || 0;
    if (base <= 0) {
      toast.error("No hay datos del mes anterior");
      return;
    }
    let val = base;
    if (type === "+5%") val = base * 1.05;
    if (type === "+10%") val = base * 1.10;
    setDraftGoals((prev) => ({ ...prev, [code]: val.toFixed(2) }));
  };

  // Si no hay monedas activas
  if (!loading && currencies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">Metas Mensuales</h2>
            <p className="text-p-s md:text-p-b text-text-muted mt-1">Seguimiento de objetivos de venta por moneda.</p>
          </div>
        </div>
        <div className="bg-white rounded-[30px] border border-neutral-100 p-12 text-center">
          <ChartBarIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-sm font-bold text-text-base mb-1">No hay monedas activas</p>
          <p className="text-p-xs text-text-muted">Activa al menos una moneda en la sección de Monedas para configurar metas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">Metas Mensuales</h2>
          <p className="text-p-s md:text-p-b text-text-muted mt-1">Seguimiento de objetivos de venta por moneda.</p>
        </div>
        <button
          onClick={openDrawer}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Cog6ToothIcon className="w-5 h-5" />
          Configurar Metas del Mes
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y) => y - 1); }
            else setSelectedMonth((m) => m - 1);
          }}
          className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 text-neutral-600" />
        </button>
        <span className="text-p-s md:text-p-b font-bold text-text-base min-w-[180px] text-center">
          {MONTHS[selectedMonth]} {selectedYear}
        </span>
        <button
          onClick={() => {
            if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y) => y + 1); }
            else setSelectedMonth((m) => m + 1);
          }}
          className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Grid */}
      {loading ? <MetasMensualesSkeleton /> : goals.length === 0 ? (
        <div className="bg-white rounded-[30px] border border-neutral-100 p-12 text-center">
          <ChartBarIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-sm font-bold text-text-base mb-1">No hay datos de metas</p>
          <p className="text-p-xs text-text-muted mb-4">No se pudieron cargar las metas para este mes.</p>
          <button
            onClick={openDrawer}
            className="px-4 py-2 rounded-xl bg-brand-50 text-brand-500 text-sm font-bold hover:bg-brand-100 transition-colors"
          >
            Configurar metas ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const c = g.currency;
            const hasGoal = g.goalAmount > 0;
            const ringColor = getRingColor(g.percentage);

            if (!hasGoal) {
              return (
                <div
                  key={c.code}
                  className="bg-white rounded-[30px] border-2 border-dashed border-neutral-200 p-6 flex flex-col items-center justify-center text-center h-[360px] hover:border-brand-300 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center mb-4">
                    <ChartBarIcon className="w-7 h-7 text-neutral-400" />
                  </div>
                  <p className="text-sm font-bold text-text-base mb-1">{c.code} — Sin meta definida</p>
                  <p className="text-p-xs text-text-muted mb-4 max-w-[200px]">
                    Configura un objetivo de venta para visualizar el progreso.
                  </p>
                  <button
                    onClick={() => { openDrawer(); }}
                    className="px-4 py-2 rounded-xl bg-brand-50 text-brand-500 text-sm font-bold hover:bg-brand-100 transition-colors"
                  >
                    Definir meta para {c.code}
                  </button>
                </div>
              );
            }

            return (
              <div key={c.code} className="bg-white rounded-[30px] border border-neutral-100 p-6 shadow-sm flex flex-col">
                {/* Top row */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-text-base">{c.code}</span>
                      <span className="text-p-xs text-text-muted">{c.symbol}</span>
                    </div>
                    <p className="text-p-xs text-neutral-500">{g.daysRemaining} días restantes</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-lg font-bold text-text-base">{Math.round(g.percentage)}%</span>
                      {getTrendIcon(g)}
                    </div>
                    <p className="text-p-xs text-neutral-400">de logro</p>
                  </div>
                </div>

                {/* Center ring */}
                <div className="flex-1 flex flex-col items-center justify-center mb-6">
                  <div className="relative">
                    <RadialRing percentage={g.percentage} color={ringColor} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-text-base">
                        {formatMoney(g.currentAmount, c.symbol, c.symbolPosition, c.decimalPlaces)}
                      </span>
                      <span className="text-p-xs text-text-muted mt-0.5">
                        de {formatMoney(g.goalAmount, c.symbol, c.symbolPosition, c.decimalPlaces)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom projection */}
                <div className="mt-auto">
                  <p className="text-p-xs text-text-muted text-center">
                    Al ritmo actual, alcanzarás el <span className="font-bold text-text-base">{Math.round(g.projectedPercentage)}%</span> de la meta
                  </p>
                  {g.exceeded && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <CheckCircleIcon className="w-4 h-4 text-success-500" />
                      <span className="text-p-xs font-bold text-success-600">
                        Meta Superada (+{Math.round(g.percentage - 100)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Configurar Metas"
        subtitle={`${MONTHS[selectedMonth]} ${selectedYear}`}
        footer={
          <>
            <button
              onClick={() => setDrawerOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-base hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Aplicar Metas"}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {currencies.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <p>No hay monedas activas para configurar.</p>
            </div>
          ) : (
            currencies.map((c) => {
              const goal = goals.find((g) => g.currency.code === c.code);
              const prevAvg = goal?.previousMonthAverage || 0;

              return (
                <div key={c.code} className="bg-neutral-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-text-base">{c.code}</p>
                      {prevAvg > 0 && (
                        <p className="text-p-xs text-text-muted">
                          Promedio mes anterior: {formatMoney(prevAvg, c.symbol, c.symbolPosition, c.decimalPlaces)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SmartInput
                      value={draftGoals[c.code] || ""}
                      onChange={(val) => setDraftGoals((prev) => ({ ...prev, [c.code]: val }))}
                      symbol={c.symbol}
                      symbolPosition={c.symbolPosition}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMagicPill(c.code, "+5%")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-p-xs font-medium text-text-base hover:border-brand-300 transition-colors"
                    >
                      +5%
                    </button>
                    <button
                      onClick={() => handleMagicPill(c.code, "+10%")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-p-xs font-medium text-text-base hover:border-brand-300 transition-colors"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => handleMagicPill(c.code, "same")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-p-xs font-medium text-text-base hover:border-brand-300 transition-colors"
                    >
                      Igual que anterior
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default MetasMensualesPage;
