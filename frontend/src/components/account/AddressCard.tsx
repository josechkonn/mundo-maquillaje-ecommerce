import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

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

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}

const AddressCard = ({ address, onEdit, onDelete }: AddressCardProps) => {
  return (
    <div className="bg-neutral-300 border-l-4 border-brand-400 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-neutral-900">{address.name}</h3>
        <div className="text-neutral-700 text-sm space-y-0.5">
          <p><span className="font-semibold">Dirección:</span> {address.direction}</p>
          <p><span className="font-semibold">Ciudad:</span> {address.city}, {address.state}</p>
          {address.phone && <p><span className="font-semibold">Teléfono:</span> {address.phone}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onEdit(address)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-400 text-white rounded-xl font-bold text-sm hover:bg-brand-500 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
          <span>Editar</span>
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-400 text-white rounded-xl font-bold text-sm hover:bg-brand-500 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
