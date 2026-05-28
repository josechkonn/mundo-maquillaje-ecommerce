import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import { orderService, type BackendOrder } from "../../services/orderService";
import { useAuthStore } from "../../store/authStore";
import { formatPrice } from "../../lib/formatters";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Sorting states
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDesc, setSortDesc] = useState(true);
  
  const [totalItems, setTotalItems] = useState(0);
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // El backend en Spring Boot maneja páginas basadas en índice 0
      const response = await orderService.getUserOrders(
        currentPage - 1, 
        itemsPerPage, 
        searchQuery, 
        selectedStatus,
        sortBy,
        sortDesc,
        startDate,
        endDate
      );
      
      setOrders(response.content || []);
      setTotalItems(response.totalElements || 0);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || "Hubo un error al cargar los pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, searchQuery, selectedStatus, sortBy, sortDesc, itemsPerPage, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Manejadores
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset a primera página al buscar
  };

  // Configuración de Filtros
  const filterConfig = [
    {
      key: "status",
      label: "Estado de la orden",
      options: [
        { label: "Pendiente", value: "PENDING" },
        { label: "Pagado", value: "PAID" },
        { label: "Procesando", value: "PROCESSING" },
        { label: "Enviado", value: "SHIPPED" },
        { label: "Entregado", value: "DELIVERED" },
        { label: "Cancelado", value: "CANCELLED" }
      ],
      value: selectedStatus,
      onChange: (value: string) => {
        setSelectedStatus(value);
        setCurrentPage(1);
      }
    }
  ];

  // Definición de columnas
  const columns: ColumnDef<BackendOrder>[] = [
    {
      key: "id",
      header: "Número de pedido",
      sortable: true,
      render: (order) => {
        if (order.orderNumber) return order.orderNumber;
        const idStr = String(order.id);
        return `#${idStr.slice(0, 8).toUpperCase()}`;
      }
    },
    {
      key: "itemCount",
      header: "Cantidad de productos",
      render: (order) => {
        // Sumar la cantidad de todos los productos en la orden
        const totalItems = order.products?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0;
        return String(totalItems).padStart(2, '0');
      }
    },
    {
      key: "createdAt",
      header: "Fecha",
      sortable: true,
      render: (order) => {
        if (!order.createdAt) return "N/A";
        const date = new Date(order.createdAt);
        return date.toLocaleDateString("es-VE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      }
    },
    {
      key: "totalAmount",
      header: "Total Pagado",
      sortable: true,
      render: (order) => {
        const currency = order.currency || order.paymentMethod?.currency;
        if (currency) {
          return formatPrice(order.totalAmount || 0, currency);
        }
        return (order.totalAmount || 0).toLocaleString("es-VE", { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 2 
        });
      }
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (order) => {
        const status = order.status;
        let badgeClass = "";
        let label = "";

        if (status === "PENDING") {
          badgeClass = "bg-mm-status-pending text-mm-status-pending-text border border-mm-status-pending-border";
          label = "Pendiente";
        } else if (status === "PAID" || status === "DELIVERED") {
          badgeClass = "bg-mm-status-completed text-mm-status-completed-text border border-mm-status-completed-border";
          label = "Completado";
        } else if (status === "PROCESSING" || status === "SHIPPED") {
          badgeClass = "bg-mm-status-processing text-mm-status-processing-text border border-mm-status-processing-border";
          label = "En proceso";
        } else if (status === "CANCELLED") {
          badgeClass = "bg-mm-status-cancelled text-mm-status-cancelled-text border border-mm-status-cancelled-border";
          label = "Cancelado";
        } else {
          badgeClass = "bg-neutral-100 text-neutral-800 border border-neutral-200";
          label = status;
        }

        return (
          <span className={`px-4 py-1.5 rounded-xl text-xs font-bold inline-block text-center whitespace-nowrap select-none ${badgeClass}`}>
            {label}
          </span>
        );
      }
    },
    {
      key: "details",
      header: "Detalles de pedido",
      render: (order) => (
        <button 
          className="text-neutral-800 hover:text-[#E6426E] transition-colors"
          onClick={() => navigate(`/cuenta/pedidos/${order.id}`)}
        >
          <InformationCircleIcon className="w-6 h-6 stroke-2" />
        </button>
      ),
      className: "text-center"
    }
  ];

  return (
    <div className="w-full">
      <DataTable
        title="Pedidos Realizados"
        columns={columns}
        data={orders}
        isLoading={isLoading}
        onSearch={handleSearch}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          setCurrentPage(1);
        }}
        filters={filterConfig}
        sortBy={sortBy}
        sortDesc={sortDesc}
        onSort={(key, desc) => {
          setSortBy(key);
          setSortDesc(desc);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default OrdersPage;
