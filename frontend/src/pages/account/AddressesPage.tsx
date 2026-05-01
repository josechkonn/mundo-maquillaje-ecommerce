import { useState, useEffect } from "react";
import AddressCard from "../../components/account/AddressCard";
import AddressForm from "../../components/account/AddressForm";
import toast from "react-hot-toast";
import { api } from "../../lib/api";

interface Address {
  id: string;
  name: string;
  phone: string;
  direction: string;
  municipality: string;
  parish: string;
  city: string;
  state: string;
}

const AddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await api.get("/addresses");
      setAddresses(data);
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      toast.error(error.message || "Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreateOrUpdate = async (data: any) => {
    const isEditing = !!editingAddress;
    const endpoint = isEditing ? `/addresses/${editingAddress.id}` : "/addresses";

    const id = toast.loading(isEditing ? "Actualizando..." : "Guardando...");
    try {
      if (isEditing) {
        await api.put(endpoint, data);
      } else {
        await api.post(endpoint, data);
      }

      toast.success(isEditing ? "Dirección actualizada ✨" : "Dirección guardada ✨", { id });
      setView("list");
      setEditingAddress(null);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || "No se pudo procesar la dirección", { id });
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta dirección?")) return;

    const id = toast.loading("Eliminando...");
    try {
      await api.delete(`/addresses/${addressId}`);
      toast.success("Dirección eliminada", { id });
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || "No se pudo eliminar la dirección", { id });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setView("form");
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setView("form");
  };

  if (view === "form") {
    return (
      <AddressForm
        initialData={editingAddress || undefined}
        onSubmit={handleCreateOrUpdate}
        onCancel={() => {
          setView("list");
          setEditingAddress(null);
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h4-b font-extrabold text-neutral-800 tracking-tight">
          Direcciones
        </h1>
      </div>

      <div className="h-[2px] bg-neutral-700 w-full mb-8" />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-2xl p-12 text-center border-2 border-dashed border-neutral-200">
          <p className="text-neutral-500 font-medium">Aún no tienes direcciones guardadas.</p>
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={handleAddNew}
          className="w-fit px-8 py-3.5 bg-brand-400 text-white rounded-2xl font-bold hover:bg-brand-500 transition-all shadow-brand"
        >
          Agregar Dirección
        </button>
      </div>
    </div>
  );
};

export default AddressesPage;
