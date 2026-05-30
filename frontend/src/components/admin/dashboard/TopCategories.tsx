import { useState, useMemo } from "react";
import { useCurrencyStore } from "../../../store/currencyStore";
import { useDashboardData } from "../../../pages/admin/DashboardPage";
import { formatPrice } from "../../../lib/formatters";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import Modal from "../../ui/Modal";

const COLORS = ["#E6426E", "#F472B6", "#FB7185", "#FDA4AF", "#FECDD3"];

const TopCategories = () => {
  const { selectedCurrency } = useCurrencyStore();
  const overview = useDashboardData();
  const [modalOpen, setModalOpen] = useState(false);

  const categories = overview?.categories?.categories || [];
  const total = overview?.categories?.total ?? 0;

  const chartData = useMemo(() =>
    categories.map((cat) => ({ name: cat.name, value: cat.total })),
    [categories]
  );

  return (
    <>
      <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-bold text-text-base">Top de Categorías</h5>
          <button
            onClick={() => setModalOpen(true)}
            className="w-[35px] h-[35px] bg-brand-300 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity"
            style={{ boxShadow: "0 0 6px rgba(34,34,34,0.35)" }}
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-64 h-64 mx-auto my-8 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={108}
                outerRadius={128}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-text-muted">Ventas totales</span>
            <span className="text-sm font-bold text-text-base">
              {selectedCurrency && formatPrice(total, selectedCurrency)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {categories.slice(0, 5).map((cat, i) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-[5px] flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-p-s md:text-p-b text-text-base truncate">{cat.name}</span>
              </div>
              {selectedCurrency && (
                <span className="text-p-s md:text-p-b font-bold text-text-base flex-shrink-0 ml-4">
                  {formatPrice(cat.total, selectedCurrency)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Todas las Categorías" maxWidth="lg">
        <div className="flex flex-col items-center">
          <div className="relative w-[250px] h-[250px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={107}
                  outerRadius={125}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-text-muted">Ventas totales</span>
              <span className="text-sm font-bold text-text-base">
                {selectedCurrency && formatPrice(total, selectedCurrency)}
              </span>
            </div>
          </div>

          <div className="w-full space-y-3">
            {categories.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-[5px] flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-p-s md:text-p-b text-text-base truncate">{cat.name}</span>
                </div>
                {selectedCurrency && (
                  <span className="text-p-s md:text-p-b font-bold text-text-base flex-shrink-0 ml-4">
                    {formatPrice(cat.total, selectedCurrency)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TopCategories;
