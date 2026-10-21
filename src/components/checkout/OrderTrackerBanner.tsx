import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FastForward,
  MapPin,
  PackageCheck,
  Play,
  ShoppingBag,
  Sparkles,
  Truck,
  UserCheck,
  X,
} from 'lucide-react';
import type { ActiveOrder, OrderStage } from '../../types/grocery';
import { useCart } from '../../context/CartContext';

export interface OrderTrackerBannerProps {
  orders?: ActiveOrder[];
}

const STAGE_METADATA: Array<{
  stage: OrderStage;
  stepNumber: number;
  label: string;
  shortLabel: string;
  progressPct: number;
}> = [
  {
    stage: 'confirmed',
    stepNumber: 1,
    label: 'Order Confirmed',
    shortLabel: 'Confirmed',
    progressPct: 20,
  },
  {
    stage: 'shopper_assigned',
    stepNumber: 2,
    label: 'Personal Shopper Assigned',
    shortLabel: 'Shopper Assigned',
    progressPct: 45,
  },
  {
    stage: 'shopping',
    stepNumber: 3,
    label: 'Shopping in Progress',
    shortLabel: 'Shopping',
    progressPct: 75,
  },
  {
    stage: 'out_for_delivery',
    stepNumber: 4,
    label: 'Out for Delivery',
    shortLabel: 'Out for Delivery',
    progressPct: 92,
  },
  {
    stage: 'delivered',
    stepNumber: 5,
    label: 'Delivered',
    shortLabel: 'Delivered',
    progressPct: 100,
  },
];

function getStageDescription(order: ActiveOrder): string {
  const shopperFirst = order.shopperName.split('·')[0].trim();
  const itemUnits = order.items.reduce((sum, i) => sum + i.quantity, 0);

  switch (order.stage) {
    case 'confirmed':
      return `Order sent to ${order.store.name}. Preparing picking list for ${itemUnits} items.`;
    case 'shopper_assigned':
      return `${shopperFirst} has arrived at ${order.store.name} and is reviewing your substitution preferences.`;
    case 'shopping':
      return `${shopperFirst} is picking your groceries in-store (${order.items.length} of ${order.items.length} items found in stock · 100% freshness verified).`;
    case 'out_for_delivery':
      return `${shopperFirst} is en route to ${order.deliveryAddress} (${order.deliverySlot.label}).`;
    case 'delivered':
      return `Delivered at ${order.deliveryAddress}. Enjoy your FreshCart groceries!`;
  }
}

export const OrderTrackerBanner: React.FC<OrderTrackerBannerProps> = ({
  orders: externalOrders,
}) => {
  const {
    activeOrders,
    advanceOrderStage,
    setOrderStage,
    dismissOrder,
    toasts,
    dismissToast,
  } = useCart();

  const resolvedOrders = externalOrders ?? activeOrders;
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [autoAdvanceOrderId, setAutoAdvanceOrderId] = useState<string | null>(
    null
  );

  // Auto-advance timer when enabled
  useEffect(() => {
    if (!autoAdvanceOrderId) return;
    const target = resolvedOrders.find((o) => o.orderId === autoAdvanceOrderId);
    if (!target || target.stage === 'delivered') {
      setAutoAdvanceOrderId(null);
      return;
    }

    const timer = window.setInterval(() => {
      advanceOrderStage(autoAdvanceOrderId);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [autoAdvanceOrderId, resolvedOrders, advanceOrderStage]);

  return (
    <>
      {/* Floating Toast Queue for AI Shopper & Cart Actions */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-5 right-5 z-60 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl p-3.5 shadow-xl border flex items-start gap-3 transition-all ${
                toast.source === 'a2ui-shopper'
                  ? 'bg-[#073E1E] text-white border-emerald-700'
                  : 'bg-white text-stone-900 border-stone-200'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  toast.source === 'a2ui-shopper'
                    ? 'bg-[#0AAD0A] text-white'
                    : 'bg-emerald-100 text-[#0AAD0A]'
                }`}
              >
                {toast.source === 'a2ui-shopper' ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">
                    {toast.title}
                  </span>
                  {toast.source === 'a2ui-shopper' && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/15 text-emerald-200 shrink-0">
                      A2UI v1.0
                    </span>
                  )}
                </div>
                {toast.description && (
                  <p
                    className={`text-[11px] mt-0.5 leading-snug ${
                      toast.source === 'a2ui-shopper'
                        ? 'text-emerald-100/90'
                        : 'text-stone-600'
                    }`}
                  >
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className={`p-1 rounded-lg transition-colors ${
                  toast.source === 'a2ui-shopper'
                    ? 'text-emerald-200 hover:text-white hover:bg-white/10'
                    : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                }`}
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active Order Tracker Banners */}
      {resolvedOrders.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-3">
          {resolvedOrders.map((order) => {
            const currentMeta =
              STAGE_METADATA.find((m) => m.stage === order.stage) ??
              STAGE_METADATA[0];
            const currentIndex = STAGE_METADATA.findIndex(
              (m) => m.stage === order.stage
            );
            const isExpanded = expandedOrderId === order.orderId;
            const isAutoAdvancing = autoAdvanceOrderId === order.orderId;

            return (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl border-2 border-[#0AAD0A]/30 shadow-md overflow-hidden"
              >
                {/* Top Status Bar */}
                <div className="bg-gradient-to-r from-[#073E1E] via-[#0B5328] to-[#108910] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg">
                      {order.store.logoEmoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0AAD0A] text-white">
                          Live Order #{order.orderId}
                        </span>
                        <span className="text-xs font-semibold text-emerald-100">
                          {order.store.name} · {order.deliverySlot.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold mt-0.5">
                        {currentMeta.label}:{' '}
                        <span className="font-normal text-emerald-100">
                          {getStageDescription(order)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Interactive Stage Controls */}
                  <div className="flex items-center gap-2">
                    {order.stage !== 'delivered' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setAutoAdvanceOrderId(
                              isAutoAdvancing ? null : order.orderId
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                            isAutoAdvancing
                              ? 'bg-amber-400 text-stone-950 border-amber-300'
                              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>
                            {isAutoAdvancing ? 'Auto-Playing...' : 'Auto-Play'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => advanceOrderStage(order.orderId)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-[#073E1E] hover:bg-emerald-50 shadow-2xs transition-all cursor-pointer"
                        >
                          <FastForward className="w-3.5 h-3.5 text-[#0AAD0A]" />
                          <span>Simulate Next Stage</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.orderId)
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <span>Receipt ({order.items.length})</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => dismissOrder(order.orderId)}
                      className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
                      title="Dismiss order tracker"
                      aria-label="Dismiss order tracker"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4-Stage + Delivered Visual Stepper */}
                <div className="px-5 py-3.5 bg-[#FAF8F5]">
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-[#0AAD0A] rounded-full transition-all duration-500"
                      style={{ width: `${currentMeta.progressPct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {STAGE_METADATA.map((meta, idx) => {
                      const isDone = idx <= currentIndex;
                      const isCurrent = idx === currentIndex;

                      const StepIcon =
                        meta.stage === 'confirmed'
                          ? CheckCircle2
                          : meta.stage === 'shopper_assigned'
                            ? UserCheck
                            : meta.stage === 'shopping'
                              ? ShoppingBag
                              : meta.stage === 'out_for_delivery'
                                ? Truck
                                : PackageCheck;

                      return (
                        <button
                          key={meta.stage}
                          type="button"
                          onClick={() =>
                            setOrderStage(order.orderId, meta.stage)
                          }
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-50 border-[#0AAD0A] text-[#073E1E] shadow-2xs'
                              : isDone
                                ? 'bg-white border-emerald-200 text-stone-800'
                                : 'bg-stone-100/70 border-stone-200/70 text-stone-400 hover:text-stone-600'
                          }`}
                          title={`Jump to stage: ${meta.label}`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? 'bg-[#0AAD0A] text-white'
                                : isDone
                                  ? 'bg-emerald-100 text-[#0AAD0A]'
                                  : 'bg-stone-200 text-stone-500'
                            }`}
                          >
                            <StepIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold truncate">
                            {meta.shortLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Expandable Order Receipt & Items Drawer */}
                {isExpanded && (
                  <div className="px-5 py-4 border-t border-stone-200 bg-white grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="md:col-span-2 space-y-2">
                      <h4 className="font-bold text-stone-900">
                        Picked Items ({order.items.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {order.items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/80"
                          >
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-white border border-stone-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-stone-900 truncate">
                                {item.quantity}x {item.product.name}
                              </p>
                              <p className="text-[11px] text-stone-500">
                                ${(item.product.price * item.quantity).toFixed(2)}{' '}
                                · Sub: {item.substitutionPreference.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#0AAD0A]" />
                        <span>Order Receipt</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Subtotal</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-[#0AAD0A]">
                          <span>Promo Discount</span>
                          <span>-${order.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-stone-600">
                        <span>Delivery &amp; Service</span>
                        <span>
                          ${(order.deliveryFee + order.serviceFee).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Shopper Tip</span>
                        <span>${order.tipAmount.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900 text-sm">
                        <span>Total Paid</span>
                        <span className="text-[#0AAD0A]">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default OrderTrackerBanner;
