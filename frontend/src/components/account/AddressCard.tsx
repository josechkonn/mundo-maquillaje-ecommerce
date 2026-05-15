import { PencilIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckIcon as CheckOutline } from "@heroicons/react/24/outline";
import Button from "../ui/Button";

interface Address {
  id: string;
  name: string;
  fullname: string;
  phone: string;
  direction: string;
  municipality: string;
  parish: string;
  city: string;
  state: string;
}

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  variant?: "account" | "checkout";
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  variant = "account",
  isSelected = false,
  onSelect
}: AddressCardProps) => {

  // Lógica de color de fondo:
  const bgColor = variant === "account"
    ? "bg-neutral-300"
    : isSelected ? "bg-neutral-300" : "bg-neutral-50";

  return (
    <div
      onClick={() => onSelect?.(address.id)}
      className={`relative rounded-2xl p-6 flex flex-row justify-between items-end min-h-[140px] transition-all cursor-pointer border-l-[6px] border-brand-400 shadow-sm ${bgColor}`}
    >
      {/* Check circular arriba a la derecha (Idéntico a la imagen) */}
      {variant === "checkout" && isSelected && (
        <div className="absolute top-4 right-4 w-10 h-10 bg-brand-400 rounded-full flex items-center justify-center text-white shadow-md z-20">
          <CheckOutline className="w-6 h-6 stroke-[3.5]" />
        </div>
      )}

      <div className="flex-1 space-y-1">
        <h3 className="text-xl font-bold text-neutral-800">{address.name}</h3>
        <div className="text-neutral-700 text-sm space-y-1.5 mt-4">
          <p><span className="font-semibold text-neutral-900">Recibe:</span> {address.fullname}</p>
          <p><span className="font-semibold text-neutral-900">Dirección:</span> {address.direction}</p>
          <p><span className="font-semibold text-neutral-900">Ciudad:</span> {address.city}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onEdit && (
          <Button
            onClick={(e) => { e.stopPropagation(); onEdit(address); }}
            variant="primary"
            fullWidth={false}
            className="!bg-brand-400 hover:!bg-brand-500 !px-6 !py-2 !text-sm !rounded-xl"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Editar</span>
          </Button>
        )}
        {onDelete && (
          <Button
            onClick={(e) => { e.stopPropagation(); onDelete(address.id); }}
            variant="primary"
            fullWidth={false}
            className="!bg-brand-400 hover:!bg-brand-500 !px-6 !py-2 !text-sm !rounded-xl"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Eliminar</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
