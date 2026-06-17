import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDashboardDateStore } from "../../store/dashboardDateStore";
import { dashboardService } from "../../services/dashboardService";
import { orderService, type BackendOrder } from "../../services/orderService";
import { formatPrice } from "../../lib/formatters";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
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

const SCROLL_CLASSES = "flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tableStartDate, setTableStartDate] = useState("");
  const [tableEndDate, setTableEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmSingleDelete, setConfirmSingleDelete] = useState(false);
  const [singleDeleteLoading, setSingleDeleteLoading] = useState(false);
  const [singleToDelete, setSingleToDelete] = useState<BackendOrder | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const pageSize = 10;

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
      const res = await orderService.getAdminOrders({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        page: currentPage - 1,
        size: pageSize,
        sortBy,
        sortDesc,
        startDate: tableStartDate || undefined,
        endDate: tableEndDate || undefined,
      });
      setOrders(res.content);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalElements);
      setSelectedIds(new Set());
    } catch {
      toast.error("No se pudieron cargar los pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, currentPage, sortBy, sortDesc, tableStartDate, tableEndDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setConfirmBulkDelete(true);
  }, [selectedIds]);

  const doDeleteBulk = useCallback(async () => {
    setBulkDeleteLoading(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => orderService.deleteOrder(id)));
      toast.success(`${selectedIds.size} pedido(s) eliminado(s)`);
      setSelectedIds(new Set());
      setConfirmBulkDelete(false);
      fetchOrders();
      fetchStats();
    } catch {
      toast.error("Error al eliminar pedidos");
    } finally {
      setBulkDeleteLoading(false);
    }
  }, [selectedIds, fetchOrders, fetchStats]);

  const doDeleteSingle = useCallback(async () => {
    if (!singleToDelete) return;
    setSingleDeleteLoading(true);
    try {
      await orderService.deleteOrder(singleToDelete.id);
      toast.success(`Pedido ${singleToDelete.orderNumber || `#${singleToDelete.id.slice(0,8).toUpperCase()}`} eliminado`);
      setSingleToDelete(null);
      setSingleDeleteLoading(false);
      setConfirmSingleDelete(false);
      fetchOrders();
      fetchStats();
    } catch {
      toast.error("Error al eliminar el pedido");
    } finally {
      setSingleDeleteLoading(false);
    }
  }, [singleToDelete, fetchOrders, fetchStats]);

  const getCount = (key: string) => key === "TOTAL" ? total : (byStatus[key] || 0);

  const STATUS_MAP: Record<string, { label: string; className: string }> = {
    PENDING:    { label: "Pendiente",  className: "bg-mm-status-pending text-mm-status-pending-text border border-mm-status-pending-border" },
    PAID:       { label: "Pagado",     className: "bg-mm-status-completed text-mm-status-completed-text border border-mm-status-completed-border" },
    PROCESSING: { label: "En proceso", className: "bg-mm-status-processing text-mm-status-processing-text border border-mm-status-processing-border" },
    SHIPPED:    { label: "Enviado",    className: "bg-mm-status-processing text-mm-status-processing-text border border-mm-status-processing-border" },
    DELIVERED:  { label: "Completado", className: "bg-mm-status-completed text-mm-status-completed-text border border-mm-status-completed-border" },
    CANCELLED:  { label: "Cancelado",  className: "bg-mm-status-cancelled text-mm-status-cancelled-text border border-mm-status-cancelled-border" },
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const oldStatus = orders.find((o) => o.id === orderId)?.status;
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await orderService.updateOrder(orderId, { status: newStatus });
      fetchStats();
      toast.success("Estado actualizado");
    } catch {
      if (oldStatus) setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: oldStatus } : o));
      toast.error("Error al actualizar estado");
    }
  };

  const StatusSelect = ({ order }: { order: BackendOrder }) => {
    const s = STATUS_MAP[order.status] || { label: order.status, className: "bg-neutral-100 text-neutral-800 border border-neutral-200" };
    return (
      <select
        value={order.status}
        onChange={(e) => handleStatusChange(order.id, e.target.value)}
        className={`px-3 py-1 rounded-xl text-xs font-bold text-center whitespace-nowrap cursor-pointer outline-none ${s.className}`}
        style={{ appearance: "auto" }}
      >
        {Object.entries(STATUS_MAP).map(([val, opt]) => (
          <option key={val} value={val} className="bg-white text-neutral-800">{opt.label}</option>
        ))}
      </select>
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
      render: (o) => <StatusSelect order={o} />,
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
  ];

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={doDeleteBulk}
        title="Eliminar pedidos"
        message={`¿Estás seguro de eliminar ${selectedIds.size} pedido(s)? Se restaurará el stock y se eliminarán todas las transacciones asociadas.`}
        confirmLabel="Eliminar permanentemente"
        maxWidth="lg"
        loading={bulkDeleteLoading}
      />

      <ConfirmDialog
        isOpen={confirmSingleDelete}
        onClose={() => { setConfirmSingleDelete(false); setSingleToDelete(null); }}
        onConfirm={doDeleteSingle}
        title="Eliminar pedido"
        message={`¿Estás seguro de eliminar permanentemente el pedido ${singleToDelete?.orderNumber || `#${singleToDelete?.id.slice(0,8).toUpperCase()}`}? Se restaurará el stock y se eliminarán todas las transacciones asociadas.`}
        confirmLabel="Eliminar permanentemente"
        maxWidth="lg"
        loading={singleDeleteLoading}
      />

      {/* Stats cards */}
      <div className={SCROLL_CLASSES} style={{ WebkitOverflowScrolling: "touch" }}>
        {STATUS_CARDS.map((card) => (
            <div key={card.key} className="snap-start flex-shrink-0 w-[85%] sm:w-[calc((100%-3rem)/4)]">
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
        titleInfo={`${totalItems || 0} pedidos registrados`}
        columns={columns}
        data={orders}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onSearch={setSearchQuery}
        searchPlaceholder="Buscar por pedido, usuario o email..."
        sortBy={sortBy}
        sortDesc={sortDesc}
        onSort={(key, desc) => { setSortBy(key); setSortDesc(desc); }}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(o) => o.id}
        onTrashClick={handleDeleteSelected}
        trashButtonTitle="Eliminar pedidos"
        onEdit={(o) => navigate(`/admin/pedidos/${o.id}/editar`)}
        onDelete={(o) => { setSingleToDelete(o); setConfirmSingleDelete(true); }}
        filters={[
          {
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
          },
        ]}
        startDate={tableStartDate}
        endDate={tableEndDate}
        onDateRangeChange={(s, e) => { setTableStartDate(s); setTableEndDate(e); setCurrentPage(1); }}
      />
    </div>
  );
};

export default OrdersPage;
