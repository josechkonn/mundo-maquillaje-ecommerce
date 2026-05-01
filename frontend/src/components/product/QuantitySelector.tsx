import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";

interface QuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onChange: (qty: number) => void;
}

const QuantitySelector = ({ quantity, maxStock, onChange }: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (quantity > 1) onChange(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < maxStock) onChange(quantity + 1);
  };

  return (
    <div className="mb-8">
      <p className="text-p-s text-text-muted mb-3 font-medium">
        Cantidad
      </p>
      {/* Diseño exacto a la imagen: + a la izquierda, - a la derecha, fondo rosa sólido */}
      <div className="inline-flex items-center bg-[#F7C5D2] rounded-[18px] px-2 h-11 w-32 justify-between">
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="w-10 h-full flex items-center justify-center text-brand-600 hover:scale-110 transition-transform disabled:opacity-30"
        >
          <MinusIcon className="w-5 h-5 stroke-2" />
        </button>
        
        <span className="text-p-b font-bold text-brand-600">
          {quantity}
        </span>
        
        <button
          onClick={handleIncrease}
          disabled={quantity >= maxStock}
          className="w-10 h-full flex items-center justify-center text-brand-600 hover:scale-110 transition-transform disabled:opacity-30"
        >
          <PlusIcon className="w-5 h-5 stroke-2" />
        </button>
      </div>
    </div>
  );
};

export default QuantitySelector;
