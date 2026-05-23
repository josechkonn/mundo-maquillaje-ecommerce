import { useState, useEffect, useCallback } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import { orderService, type BackendOrder } from "../../services/orderService";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const user = useAuthStore(state => state.user);
  
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
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
        sortDesc
      );
      
      setOrders(response.content || []);
      setTotalItems(response.totalElements || 0);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || "Hubo un error al cargar los pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, searchQuery, selectedStatus, sortBy, sortDesc, itemsPerPage]);

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
      label: "Estado de pedido",
      options: [
        { label: "Pendiente de pago", value: "PENDING" },
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
        // Al usar UUIDs en Spring Boot, mostramos los primeros 8 caracteres de forma premium
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
      key: "paymentMethod",
      header: "Método de pago",
      render: (order) => {
        return order.paymentMethod?.name || "No especificado";
      }
    },
    {
      key: "totalAmount",
      header: "Total Pagado",
      sortable: true,
      render: (order) => {
        return (order.totalAmount || 0).toLocaleString("es-VE", { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 2 
        });
      }
    },
    {
      key: "details",
      header: "Detalles de pedido",
      render: (_order) => (
        <button 
          className="text-brand-400 hover:text-brand-500 transition-colors"
          onClick={() => toast("Ver detalles - Próximamente", { icon: "ℹ️" })}
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
