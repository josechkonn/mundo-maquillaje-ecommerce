import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useDashboardDateStore } from "../../store/dashboardDateStore";
import { dashboardService } from "../../services/dashboardService";
import { orderService, type BackendOrder } from "../../services/orderService";
import { formatPrice } from "../../lib/formatters";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import StatCard from "../../components/admin/dashboard/StatCard";
import {
  ShoppingCartIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const STATUS_CARDS = [
  { key: "TOTAL",      title: "Pedidos Totales", icon: <ShoppingCartIcon className="w-5 h-5" /> },
  { key: "PROCESSING", title: "En Proceso",      icon: <ClockIcon className="w-5 h-5" /> },
  { key: "PENDING",    title: "Pendientes",      icon: <ExclamationCircleIcon className="w-5 h-5" /> },
  { key: "DELIVERED",  title: "Completados",     icon: <CheckBadgeIcon className="w-5 h-5" /> },
  { key: "SHIPPED",    title: "Enviados",        icon: <TruckIcon className="w-5 h-5" /> },
  { key: "CANCELLED",  title: "Cancelados",      icon: <XCircleIcon className="w-5 h-5" /> },
];

const SCROLL_CLASSES = "flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth -mx-4 px-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { startDate, endDate } = useDashboardDateStore();

  // Stats
  const [byStatus, setByStatus] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // Table
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tableStartDate, setTableStartDate] = useState("");
  const [tableEndDate, setTableEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await dashboardService.getOrdersByStatus(startDate || undefined, endDate || undefined);
      setByStatus(res.byStatus || {});
      setTotal(res.total || 0);
    } catch {
      setByStatus({});
      setTotal(0);
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate]);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getAdminOrders(
        currentPage - 1, itemsPerPage, searchQuery, statusFilter,
        sortBy, sortDesc, tableStartDate, tableEndDate
      );
      setOrders(res.content || []);
      setTotalItems(res.totalElements || 0);
      setSelectedIds(new Set());
    } catch {
      setOrders([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, sortBy, sortDesc, tableStartDate, tableEndDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancelOrders = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const confirmed = window.confirm(`¿Estás seguro de cancelar ${selectedIds.size} pedido(s)?`);
    if (!confirmed) return;
    try {
      await orderService.cancelAdminOrders(Array.from(selectedIds));
      toast.success(`${selectedIds.size} pedido(s) cancelado(s)`);
      setSelectedIds(new Set());
      fetchOrders();
      fetchStats();
    } catch {
      toast.error("Error al cancelar pedidos");
    }
  }, [selectedIds, fetchOrders, fetchStats]);

  const getCount = (key: string) => key === "TOTAL" ? total : (byStatus[key] || 0);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      PENDING:    { label: "Pendiente",  className: "bg-mm-status-pending text-mm-status-pending-text border border-mm-status-pending-border" },
      PAID:       { label: "Pagado",     className: "bg-mm-status-completed text-mm-status-completed-text border border-mm-status-completed-border" },
      PROCESSING: { label: "En proceso", className: "bg-mm-status-processing text-mm-status-processing-text border border-mm-status-processing-border" },
      SHIPPED:    { label: "Enviado",    className: "bg-mm-status-processing text-mm-status-processing-text border border-mm-status-processing-border" },
      DELIVERED:  { label: "Completado", className: "bg-mm-status-completed text-mm-status-completed-text border border-mm-status-completed-border" },
      CANCELLED:  { label: "Cancelado",  className: "bg-mm-status-cancelled text-mm-status-cancelled-text border border-mm-status-cancelled-border" },
    };
    const s = map[status] || { label: status, className: "bg-neutral-100 text-neutral-800 border border-neutral-200" };
    return (
      <span className={`px-3 py-1 rounded-xl text-xs font-bold inline-block text-center whitespace-nowrap ${s.className}`}>
        {s.label}
      </span>
    );
  };

  const columns: ColumnDef<BackendOrder>[] = [
    {
      key: "orderNumber",
      header: "N° Pedido",
      sortable: true,
      render: (o) => o.orderNumber || `#${o.id.slice(0, 8).toUpperCase()}`,
    },
    {
      key: "userName",
      header: "Usuario",
      render: (o) => o.userName || o.userEmail || "—",
    },
    {
      key: "createdAt",
      header: "Fecha",
      sortable: true,
      render: (o) => o.createdAt ? new Date(o.createdAt).toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—",
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (o) => getStatusBadge(o.status),
    },
    {
      key: "totalAmount",
      header: "Total",
      sortable: true,
      render: (o) => {
        const cur = o.currency || o.paymentMethod?.currency;
        if (cur) return formatPrice(o.totalAmount || 0, cur);
        return (o.totalAmount || 0).toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      },
    },
    {
      key: "details",
      header: "Detalles",
      className: "text-center",
      render: (o) => (
        <button
          className="text-neutral-800 hover:text-[#E6426E] transition-colors"
          onClick={() => navigate(`/cuenta/pedidos/${o.id}`)}
        >
          <InformationCircleIcon className="w-6 h-6 stroke-2" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className={SCROLL_CLASSES} style={{ WebkitOverflowScrolling: "touch" }}>
        {STATUS_CARDS.map((card) => (
          <div key={card.key} className="snap-start flex-shrink-0 w-[calc((100%-3rem)/4)]">
            <StatCard
              title={card.title}
              value={statsLoading ? "..." : getCount(card.key).toLocaleString()}
              icon={card.icon}
              onClick={() => navigate("/admin/pedidos")}
            />
          </div>
        ))}
      </div>

      {/* Table */}
      <DataTable
        title="Pedidos"
        columns={columns}
        data={orders}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(o) => o.id}
        onSearch={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        startDate={tableStartDate}
        endDate={tableEndDate}
        onDateRangeChange={(s, e) => { setTableStartDate(s); setTableEndDate(e); setCurrentPage(1); }}
        filters={[{
          key: "status",
          label: "Estado",
          options: [
            { label: "Pendiente", value: "PENDING" },
            { label: "Pagado", value: "PAID" },
            { label: "Procesando", value: "PROCESSING" },
            { label: "Enviado", value: "SHIPPED" },
            { label: "Entregado", value: "DELIVERED" },
            { label: "Cancelado", value: "CANCELLED" },
          ],
          value: statusFilter,
          onChange: (v) => { setStatusFilter(v); setCurrentPage(1); },
        }]}
        sortBy={sortBy}
        sortDesc={sortDesc}
        onSort={(key, desc) => { setSortBy(key); setSortDesc(desc); setCurrentPage(1); }}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onTrashClick={handleCancelOrders}
      />
    </div>
  );
};

export default OrdersPage;
