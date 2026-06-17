import { useDashboardData } from "../../../pages/admin/DashboardPage";

const STEPS = [
  { key: "productViews", label: "Vistas de productos", color: "#E6426E" },
  { key: "addToCart", label: "Añadido al carrito", color: "#F472B6" },
  { key: "checkoutStart", label: "Proceder al pago", color: "#FB7185" },
  { key: "purchase", label: "Compra exitosa", color: "#FDA4AF" },
  { key: "unpaidCarts", label: "Carritos sin pagar", color: "#FCA5A5" },
];

const ConversionFunnel = () => {
  const overview = useDashboardData();

  const convData = overview?.conversion;
  const currentData = convData?.current || {};
  const previousData = convData?.previous || {};

  const chartData = STEPS.map((step) => ({
    name: step.label,
    value: currentData[step.key] || 0,
    previous: previousData[step.key] || 0,
    color: step.color,
  }));

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100 col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-bold text-text-base">Tasa de Conversión</h5>
      </div>

      <div className="grid grid-cols-5 gap-2 h-48 sm:h-56">
        {chartData.map((item) => {
          const percent = (item.value / maxValue) * 100;
          const change = item.previous > 0 ? ((item.value - item.previous) / item.previous) * 100 : 0;
          const changeStr = item.previous === 0 ? "—" : `${change >= 0 ? "+" : ""}${change.toFixed(0)}%`;
          const changeColor = change >= 0 ? "text-green-600" : "text-red-500";

          return (
            <div key={item.name} className="flex flex-col items-center">
              <p className="text-neutral-700 text-[10px] sm:text-xs leading-tight text-center">{item.name}</p>
              <p className="font-bold text-brand-400 text-sm sm:text-lg my-1">{item.value.toLocaleString()}</p>
              <p className={`text-[10px] sm:text-xs font-medium ${changeColor}`}>{changeStr}</p>
              <div className="w-full flex-1 relative mt-1">
                <div
                  className="absolute bottom-0 w-full rounded-t-md transition-all duration-300"
                  style={{ height: `${percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionFunnel;
