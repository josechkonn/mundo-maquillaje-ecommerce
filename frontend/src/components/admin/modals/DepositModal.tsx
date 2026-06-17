import { useState, useEffect } from "react";
import { ArrowDownLeftIcon } from "@heroicons/react/24/outline";
import { cashRegisterService, type CashRegister } from "../../../services/cashRegisterService";
import Modal from "../../ui/Modal";
import toast from "react-hot-toast";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DepositModal = ({ isOpen, onClose, onSuccess }: DepositModalProps) => {
  const [cajas, setCajas] = useState<CashRegister[]>([]);
  const [cajaId, setCajaId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFetching(true);
    cashRegisterService.getAllCashRegisters()
      .then((data) => {
        setCajas(data.filter((c) => c.isActive));
        if (data.length > 0) setCajaId(data[0].id);
      })
      .catch(() => toast.error("No se pudieron cargar las cajas"))
      .finally(() => setFetching(false));
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cajaId || !amount) {
      toast.error("Selecciona una caja y un monto");
      return;
    }
    setLoading(true);
    try {
      await cashRegisterService.deposit(cajaId, {
        amount: parseFloat(amount),
        description,
        reference,
      });
      toast.success("Depósito registrado correctamente");
      setAmount("");
      setDescription("");
      setReference("");
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Error al registrar el depósito");
    }
    setLoading(false);
  };

  const selectedCaja = cajas.find((c) => c.id === cajaId);

  const header = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center">
        <ArrowDownLeftIcon className="w-5 h-5 text-success-500" />
      </div>
      <h3 className="text-lg font-bold text-neutral-800">Depósito de caja</h3>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} header={header} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {fetching ? (
          <div className="py-8 text-center text-neutral-500">Cargando cajas...</div>
        ) : (
          <>
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-2">Caja destino</label>
              <select
                value={cajaId}
                onChange={(e) => setCajaId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white"
              >
                {cajas.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.currency.symbol}{c.balance.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-2">Monto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">
                  {selectedCaja?.currency.symbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-2">Descripción</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Concepto del depósito..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-2">Referencia</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="N° de comprobante, transferencia..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-success-500 text-white font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Registrando..." : "Registrar depósito"}
            </button>
          </>
        )}
      </form>
    </Modal>
  );
};

export default DepositModal;
