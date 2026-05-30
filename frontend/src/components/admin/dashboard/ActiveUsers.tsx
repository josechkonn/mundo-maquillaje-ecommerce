import { useState } from "react";
import { useDashboardData } from "../../../pages/admin/DashboardPage";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import Modal from "../../ui/Modal";

interface StateData {
  state: string;
  count: number;
  percentage: number;
  change: number;
}

const BAR_COLORS = ["#E6426E", "#F472B6", "#FB7185", "#FDA4AF", "#FECDD3", "#FDE68A"];

const ActiveUsers = () => {
  const overview = useDashboardData();
  const [modalOpen, setModalOpen] = useState(false);

  const states = overview?.activeUsers?.states || [];
  const topStates = states.slice(0, 5);
  const displayTotal = overview?.activeUsers?.total ?? 0;
  const displayChange = overview?.activeUsers?.change ?? 0;

  return (
    <>
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-neutral-100 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-bold text-text-base">Usuarios Activos</h5>
          <button
            onClick={() => setModalOpen(true)}
            className="w-[35px] h-[35px] bg-brand-300 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity"
            style={{ boxShadow: "0 0 6px rgba(34,34,34,0.35)" }}
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-end justify-between mb-5">
          <span className="text-3xl font-bold text-brand-400">{displayTotal.toLocaleString()}</span>
          {overview?.activeUsers && (
            <div className="flex flex-col items-end flex-shrink-0">
              <span
                className="text-p-s md:text-p-b font-bold whitespace-nowrap"
                style={{ color: displayChange >= 0 ? "#54D027" : "#FF3C3C" }}
              >
                {displayChange >= 0 ? "+" : ""}{displayChange}%
              </span>
              <span className="text-p-sm font-normal text-neutral-800">vs semana pasada</span>
            </div>
          )}
        </div>

        <div className="space-y-3 flex-1">
          {topStates.map((item: StateData, i: number) => (
            <div key={item.state}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-base font-medium truncate mr-2">{item.state}</span>
                <span className="text-text-muted flex-shrink-0 ml-2">{item.percentage}%</span>
              </div>
              <div className="w-full h-[6px] bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(item.percentage, 1)}%`,
                    backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
          {topStates.length === 0 && (
            <p className="text-text-muted text-sm text-center py-4">Cargando...</p>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Usuarios por Estado" maxWidth="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <span className="text-sm font-bold text-text-base">Total: {displayTotal.toLocaleString()}</span>
            <span
              className="text-xs font-bold"
              style={{ color: displayChange >= 0 ? "#54D027" : "#FF3C3C" }}
            >
              {displayChange >= 0 ? "+" : ""}{displayChange}% vs semana pasada
            </span>
          </div>
          {states.map((item: StateData, i: number) => (
            <div key={item.state}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-base font-medium">{item.state}</span>
                <div className="flex items-center gap-3 text-text-muted">
                  <span>{item.count.toLocaleString()}</span>
                  <span className="font-semibold text-text-base">{item.percentage}%</span>
                  <span
                    className="font-bold min-w-[4ch] text-right"
                    style={{ color: item.change >= 0 ? "#54D027" : "#FF3C3C" }}
                  >
                    {item.change >= 0 ? "+" : ""}{item.change}%
                  </span>
                </div>
              </div>
              <div className="w-full h-[6px] bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(item.percentage, 1)}%`,
                    backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default ActiveUsers;
