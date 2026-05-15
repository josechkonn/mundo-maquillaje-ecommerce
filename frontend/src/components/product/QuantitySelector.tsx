import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";

interface QuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onChange: (qty: number) => void;
  className?: string;
  hideLabel?: boolean;
  variant?: "default" | "compact";
}

const QuantitySelector = ({ quantity, maxStock, onChange, className, hideLabel = false, variant = "default" }: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (quantity > 1) onChange(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < maxStock) onChange(quantity + 1);
  };

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center bg-brand-50 rounded-full px-2 py-1 gap-3 h-8 ${className}`}>
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="text-brand-400 disabled:opacity-30 p-0.5"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <span className="text-p-xs font-bold text-text-base w-4 text-center">
          {quantity}
        </span>
        <button
          onClick={handleIncrease}
          disabled={quantity >= maxStock}
          className="text-brand-400 disabled:opacity-30 p-0.5"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={className ?? "mb-8"}>
      {!hideLabel && (
        <p className="text-p-s text-text-muted mb-3 font-medium">
          Cantidad
        </p>
      )}
      <div className="inline-flex items-center bg-brand-50 rounded-[18px] px-2 h-11 w-32 justify-between">
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
