import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  CalendarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { orderService, type TransactionResponse } from "../../services/orderService";
import TransaccionesSkeleton from "../../components/admin/skeletons/TransaccionesSkeleton";
import { useDashboardDateStore } from "../../store/dashboardDateStore";
import toast from "react-hot-toast";
import Drawer from "../../components/ui/Drawer";

type TxStatus = "PENDING" | "COMPLETED" | "VERIFIED" | "REJECTED" | "CANCELLED";
type TxType = "ORDER_PAYMENT" | "DEPOSIT" | "WITHDRAW";

const statusConfig: Record<TxStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pendiente", color: "text-amber-600 bg-amber-50 border-amber-200", icon: ExclamationCircleIcon },
  COMPLETED: { label: "Completado", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircleIcon },
  VERIFIED: { label: "Verificado", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircleIcon },
  REJECTED: { label: "Rechazado", color: "text-red-600 bg-red-50 border-red-200", icon: XCircleIcon },
  CANCELLED: { label: "Cancelado", color: "text-red-600 bg-red-50 border-red-200", icon: XCircleIcon },
};

const typeConfig: Record<TxType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  ORDER_PAYMENT: { label: "Pago de pedido", icon: BanknotesIcon, color: "text-brand-600", bg: "bg-brand-50" },
  DEPOSIT: { label: "Depósito", icon: ArrowDownLeftIcon, color: "text-green-600", bg: "bg-green-50" },
  WITHDRAW: { label: "Retiro", icon: ArrowUpRightIcon, color: "text-red-600", bg: "bg-red-50" },
};

const formatDateLabel = (d: string) => {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";
  return date.toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" });
};

const formatTime = (d: string) => new Date(d).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });

const formatMoney = (amount: number, symbol: string, position: "LEFT" | "RIGHT", decimals: number) => {
  const str = amount.toLocaleString("es-VE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return position === "LEFT" ? `${symbol}${str}` : `${str} ${symbol}`;
};

const TransaccionesPage = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);
  const [activeCurrency, setActiveCurrency] = useState<string>("ALL");
  const [activeType, setActiveType] = useState<string>("ALL");
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { startDate, endDate } = useDashboardDateStore();

  const fetchTransactions = useCallback(async (cursor?: string) => {
    try {
      const sDate = startDate || undefined;
      const eDate = endDate || undefined;
      const data = await orderService.getAllTransactions(cursor, 20, sDate, eDate);
      setTransactions((prev) => cursor ? [...prev, ...data.content] : data.content);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Error loading transactions:", err);
      toast.error("Error al cargar transacciones");
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    setTransactions([]);
    setHasMore(true);
    setNextCursor("");
    fetchTransactions().finally(() => setLoading(false));
  }, [fetchTransactions]);

  const lastTransactionRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (loadingMore || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextCursor) {
          setLoadingMore(true);
          fetchTransactions(nextCursor).finally(() => setLoadingMore(false));
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, nextCursor, fetchTransactions]
  );

  const currencies = useMemo(() => {
    const map = new Map<string, { symbol: string; position: "LEFT" | "RIGHT"; decimals: number; total: number }>();
    transactions.forEach((tx) => {
      const c = tx.currency;
      const key = c.code;
      const existing = map.get(key);
      const isPositive = tx.type === "DEPOSIT" || (tx.type === "ORDER_PAYMENT" && (tx.status === "VERIFIED" || tx.status === "COMPLETED"));
      const value = isPositive ? tx.amount : -tx.amount;
      if (existing) {
        existing.total += value;
      } else {
        map.set(key, { symbol: c.symbol, position: c.symbolPosition, decimals: c.decimalPlaces, total: value });
      }
    });
    return Array.from(map.entries()).map(([code, data]) => ({ code, ...data }));
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = transactions;
    if (activeCurrency !== "ALL") {
      result = result.filter((tx) => tx.currency.code === activeCurrency);
    }
    if (activeType !== "ALL") {
      result = result.filter((tx) => tx.type === activeType);
    }
    return result;
  }, [transactions, activeCurrency, activeType]);

  const grouped = useMemo(() => {
    const map = new Map<string, TransactionResponse[]>();
    filtered.forEach((tx) => {
      const label = formatDateLabel(tx.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(tx);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: transactions.length };
    transactions.forEach((tx) => {
      counts[tx.type] = (counts[tx.type] || 0) + 1;
    });
    return counts;
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">Transacciones</h2>
          <p className="text-p-s md:text-p-b text-text-muted mt-1">Historial de pagos, depósitos y retiros.</p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "ALL", label: "Todas" },
          { key: "ORDER_PAYMENT", label: "Pagos" },
          { key: "DEPOSIT", label: "Depósitos" },
          { key: "WITHDRAW", label: "Retiros" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveType(t.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeType === t.key
                ? "bg-brand-500 text-white"
                : "bg-white text-text-base border border-neutral-200 hover:border-neutral-300"
            }`}
          >
            {t.label} {typeCounts[t.key] ? `(${typeCounts[t.key]})` : ""}
          </button>
        ))}
      </div>

      {/* Currency ribbon */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
        <button
          onClick={() => setActiveCurrency("ALL")}
          className={`snap-start shrink-0 px-5 py-3 rounded-2xl border text-left transition-all min-w-[140px] ${
            activeCurrency === "ALL"
              ? "bg-brand-500 border-brand-500 text-white shadow-sm"
              : "bg-white border-neutral-200 text-text-base hover:border-neutral-300"
          }`}
        >
          <p className="text-p-xs font-medium opacity-80">Todas las monedas</p>
          <p className="text-lg font-bold mt-0.5">{filtered.length}</p>
          <p className="text-p-xs opacity-70 mt-0.5">transacciones</p>
        </button>
        {currencies.map((c) => (
          <button
            key={c.code}
            onClick={() => setActiveCurrency(c.code)}
            className={`snap-start shrink-0 px-5 py-3 rounded-2xl border text-left transition-all min-w-[160px] ${
              activeCurrency === c.code
                ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                : "bg-white border-neutral-200 text-text-base hover:border-neutral-300"
            }`}
          >
            <p className="text-p-xs font-medium opacity-80">{c.code}</p>
            <p className="text-lg font-bold mt-0.5">
              {formatMoney(Math.abs(c.total), c.symbol, c.position, c.decimals)}
            </p>
            <p className="text-p-xs opacity-70 mt-0.5">
              {filtered.filter((t) => t.currency.code === c.code).length} transacciones
            </p>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-[30px] border border-neutral-100 shadow-sm p-6 md:p-8 min-h-[300px]">
        {loading ? <TransaccionesSkeleton /> : filtered.length === 0 ? (
          <div className="py-12 text-center text-neutral-500">No hay transacciones registradas.</div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([label, txs], groupIndex) => {
              const isLastGroup = groupIndex === grouped.length - 1;
              return (
                <div key={label}>
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarIcon className="w-4 h-4 text-neutral-400" />
                    <h4 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">{label}</h4>
                    <div className="flex-1 h-px bg-neutral-100" />
                  </div>
                  <div className="space-y-2">
                    {txs.map((tx, txIndex) => {
                      const status = statusConfig[tx.status as TxStatus];
                      const type = typeConfig[tx.type as TxType];
                      const Icon = type.icon;
                      const c = tx.currency;
                      const isPositive = tx.type === "DEPOSIT" || (tx.type === "ORDER_PAYMENT" && (tx.status === "VERIFIED" || tx.status === "COMPLETED"));
                      const isLastItem = isLastGroup && txIndex === txs.length - 1;
                      return (
                        <button
                          key={tx.id}
                          ref={isLastItem ? lastTransactionRef : null}
                          onClick={() => setSelectedTx(tx)}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100 text-left group"
                        >
                          <div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${type.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-text-base truncate">
                                {type.label}
                                {tx.type === "ORDER_PAYMENT" && tx.order?.orderNumber ? ` — ${tx.order.orderNumber}` : ""}
                                {tx.type === "ORDER_PAYMENT" && tx.paymentMethod ? ` — ${tx.paymentMethod.name}` : ""}
                                {tx.type !== "ORDER_PAYMENT" && tx.cashRegister ? ` — ${tx.cashRegister.name}` : ""}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-p-xs font-medium border ${status.color}`}>
                                <status.icon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <p className="text-p-xs text-text-muted mt-0.5 truncate">
                              {tx.reference || tx.description || "Sin referencia"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                              {isPositive ? "+" : "-"}{formatMoney(tx.amount, c.symbol, c.symbolPosition, c.decimalPlaces)}
                            </p>
                            <p className="text-p-xs text-neutral-700 mt-0.5">{formatTime(tx.createdAt)}</p>
                          </div>
                          <ChevronRightIcon className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {loadingMore && (
              <div className="py-6 text-center text-neutral-500">
                <ArrowPathIcon className="w-5 h-5 animate-spin inline-block mr-2" />
                Cargando más...
              </div>
            )}
            {!hasMore && transactions.length > 0 && (
              <div className="py-4 text-center text-p-xs text-neutral-400">No hay más transacciones</div>
            )}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <Drawer
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Detalle de transacción"
      >
        {selectedTx && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${typeConfig[selectedTx.type as TxType].bg} flex items-center justify-center`}>
                {(() => {
                  const TIcon = typeConfig[selectedTx.type as TxType].icon;
                  return <TIcon className={`w-7 h-7 ${typeConfig[selectedTx.type as TxType].color}`} />;
                })()}
              </div>
              <div>
                <p className="text-xl font-bold text-text-base">{typeConfig[selectedTx.type as TxType].label}</p>
                <p className="text-p-s text-text-muted">
                  {selectedTx.type === "ORDER_PAYMENT"
                    ? selectedTx.paymentMethod?.name || "Sin método"
                    : selectedTx.cashRegister?.name || "Sin caja"}
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-p-s text-text-muted">Monto</span>
                <span className="text-lg font-bold text-text-base">
                  {formatMoney(selectedTx.amount, selectedTx.currency.symbol, selectedTx.currency.symbolPosition, selectedTx.currency.decimalPlaces)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-p-s text-text-muted">Estado</span>
                {(() => {
                  const s = statusConfig[selectedTx.status as TxStatus];
                  const Icon = s.icon;
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-p-xs font-medium border ${s.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {s.label}
                    </span>
                  );
                })()}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-p-s text-text-muted">Fecha</span>
                <span className="text-sm font-medium text-text-base">{new Date(selectedTx.createdAt).toLocaleString("es-VE")}</span>
              </div>
              {selectedTx.reference && (
                <div className="flex justify-between items-center">
                  <span className="text-p-s text-text-muted">Referencia</span>
                  <span className="text-sm font-medium text-text-base font-mono">{selectedTx.reference}</span>
                </div>
              )}
              {selectedTx.description && (
                <div className="flex justify-between items-start">
                  <span className="text-p-s text-text-muted">Descripción</span>
                  <span className="text-sm font-medium text-text-base text-right max-w-[60%]">{selectedTx.description}</span>
                </div>
              )}
            </div>

            <div className="bg-neutral-50 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-bold text-text-base">Detalles</p>
              <div className="space-y-2">
                <p className="text-p-s text-text-muted">
                  Moneda: <span className="font-medium text-text-base">{selectedTx.currency.code}</span>
                </p>
                {selectedTx.type === "ORDER_PAYMENT" && selectedTx.order && (
                  <p className="text-p-s text-text-muted">
                    Pedido: <span className="font-medium text-text-base">{selectedTx.order.orderNumber || selectedTx.order.id}</span>
                  </p>
                )}
                {selectedTx.type !== "ORDER_PAYMENT" && selectedTx.cashRegister && (
                  <p className="text-p-s text-text-muted">
                    Caja: <span className="font-medium text-text-base">{selectedTx.cashRegister.name}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TransaccionesPage;
