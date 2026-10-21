import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import type { ActiveOrder, DeliverySlot } from '../../types/grocery';
import { useCart } from '../../context/CartContext';

export interface CheckoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const PRESET_ADDRESSES = [
  {
    id: 'addr-sf',
    label: 'Home · San Francisco',
    address: '742 Evergreen Terrace, San Francisco, CA 94110',
    apt: 'Apt 4B',
  },
  {
    id: 'addr-mv',
    label: 'Office · Mountain View',
    address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
    apt: 'Bldg 43',
  },
];

const PAYMENT_METHODS = [
  {
    id: 'pay-apple',
    label: 'Apple Pay · Visa •••• 4242',
    badge: 'Default',
  },
  {
    id: 'pay-visa',
    label: 'Chase Sapphire Reserve •••• 8819',
    badge: '3x Grocery Points',
  },
  {
    id: 'pay-credits',
    label: 'FreshCart+ Member Wallet ($250.00 balance)',
    badge: 'Zero Fee',
  },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) => {
  const {
    items,
    activeStore,
    totalItemCount,
    subtotal,
    productSavings,
    discountAmount,
    serviceFee,
    promoCode,
    appliedPromoRule,
    freeDeliveryProgress,
    isCheckoutOpen,
    closeCheckoutModal,
    placeOrder,
  } = useCart();

  const resolvedIsOpen =
    externalIsOpen !== undefined ? externalIsOpen : isCheckoutOpen;

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      closeCheckoutModal();
    }
  };

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [confirmedOrder, setConfirmedOrder] = useState<ActiveOrder | null>(
    null
  );

  // Step 1 state: Address & Instructions
  const [deliveryAddress, setDeliveryAddress] = useState(
    PRESET_ADDRESSES[0].address
  );
  const [aptOrSuite, setAptOrSuite] = useState(PRESET_ADDRESSES[0].apt);
  const [leaveAtDoor, setLeaveAtDoor] = useState(true);
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    'Ring doorbell upon arrival; place bags by the shaded porch.'
  );
  const [addressError, setAddressError] = useState<string | null>(null);

  // Step 2 state: Delivery Slots
  const deliverySlots = useMemo<DeliverySlot[]>(() => {
    return [
      {
        id: 'slot-express',
        label: 'Priority Express Delivery',
        windowText: `Within ${activeStore.deliveryEtaMinutes} mins · Direct courier`,
        fee: 2.99,
        isExpress: true,
        badge: '⚡ Fastest',
      },
      {
        id: 'slot-1hr',
        label: 'Today · 1-Hour Window',
        windowText: 'Arrives within 60 mins',
        fee: activeStore.deliveryFee,
        isExpress: false,
        badge: 'Popular',
      },
      {
        id: 'slot-today-2pm',
        label: 'Today · 2:00 PM – 4:00 PM',
        windowText: 'Standard 2-hour window',
        fee: activeStore.deliveryFee,
        isExpress: false,
      },
      {
        id: 'slot-today-4pm',
        label: 'Today · 4:00 PM – 6:00 PM',
        windowText: 'Afternoon 2-hour window',
        fee: Math.max(1.99, Number((activeStore.deliveryFee - 1).toFixed(2))),
        isExpress: false,
        badge: 'Save $1.00',
      },
      {
        id: 'slot-tomorrow-9am',
        label: 'Tomorrow · 9:00 AM – 11:00 AM',
        windowText: 'Morning farm-fresh drop',
        fee: 1.99,
        isExpress: false,
        badge: '🌱 Eco Route',
      },
    ];
  }, [activeStore.deliveryEtaMinutes, activeStore.deliveryFee]);

  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-1hr');

  const selectedSlot = useMemo<DeliverySlot>(() => {
    return (
      deliverySlots.find((s) => s.id === selectedSlotId) ?? deliverySlots[0]
    );
  }, [deliverySlots, selectedSlotId]);

  // Step 3 state: Tip & Payment
  const [tipMode, setTipMode] = useState<'10' | '15' | '20' | '25' | 'custom'>(
    '15'
  );
  const [customTipInput, setCustomTipInput] = useState('5.00');
  const [selectedPaymentId, setSelectedPaymentId] = useState(
    PAYMENT_METHODS[0].id
  );

  // Reset to step 1 when modal opens with fresh cart items
  useEffect(() => {
    if (resolvedIsOpen) {
      setStep(1);
      setConfirmedOrder(null);
      setAddressError(null);
    }
  }, [resolvedIsOpen]);

  useEffect(() => {
    if (!resolvedIsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resolvedIsOpen]);

  const isFreeDeliveryEligible =
    freeDeliveryProgress.isUnlocked || appliedPromoRule?.code === 'A2UIV1';

  const effectiveSlotDeliveryFee = useMemo(() => {
    if (selectedSlot.isExpress) {
      const baseFee = isFreeDeliveryEligible ? 0 : activeStore.deliveryFee;
      return Number((baseFee + selectedSlot.fee).toFixed(2));
    }
    return isFreeDeliveryEligible ? 0 : selectedSlot.fee;
  }, [selectedSlot, isFreeDeliveryEligible, activeStore.deliveryFee]);

  const tipAmount = useMemo(() => {
    if (tipMode === 'custom') {
      const parsed = parseFloat(customTipInput);
      return Number.isFinite(parsed) && parsed >= 0
        ? Number(parsed.toFixed(2))
        : 0;
    }
    const pct = parseInt(tipMode, 10);
    return Number(((subtotal * pct) / 100).toFixed(2));
  }, [tipMode, customTipInput, subtotal]);

  const finalOrderTotal = useMemo(() => {
    return Number(
      Math.max(
        0,
        subtotal -
          discountAmount +
          effectiveSlotDeliveryFee +
          serviceFee +
          tipAmount
      ).toFixed(2)
    );
  }, [subtotal, discountAmount, effectiveSlotDeliveryFee, serviceFee, tipAmount]);

  if (!resolvedIsOpen) {
    return null;
  }

  const handleNextFromStep1 = () => {
    if (!deliveryAddress.trim()) {
      setAddressError('Please enter a valid delivery street address.');
      return;
    }
    setAddressError(null);
    setStep(2);
  };

  const handlePlaceOrder = () => {
    const paymentMethod =
      PAYMENT_METHODS.find((p) => p.id === selectedPaymentId)?.label ??
      PAYMENT_METHODS[0].label;

    const order = placeOrder({
      deliveryAddress: deliveryAddress.trim(),
      aptOrSuite: aptOrSuite.trim() || undefined,
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      leaveAtDoor,
      deliverySlot: selectedSlot,
      tipAmount,
      paymentMethodLabel: paymentMethod,
    });

    setConfirmedOrder(order);
    setStep(4);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      onClick={handleClose}
    >
      <div
        className="bg-[#F7F5F0] rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Stepper */}
        <div className="bg-white border-b border-stone-200 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl" aria-hidden="true">
                {activeStore.logoEmoji}
              </span>
              <div>
                <h2
                  id="checkout-modal-title"
                  className="text-base font-bold text-stone-900"
                >
                  {step === 4
                    ? 'Order Confirmed!'
                    : `Checkout · ${activeStore.name}`}
                </h2>
                <p className="text-xs text-stone-500">
                  {step === 4
                    ? `Order #${confirmedOrder?.orderId} is now live`
                    : `${totalItemCount} items · Subtotal $${subtotal.toFixed(2)}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Close checkout modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4-Step Progress Indicator */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { num: 1, label: '1. Address' },
              { num: 2, label: '2. Delivery Slot' },
              { num: 3, label: '3. Tip & Pay' },
              { num: 4, label: '4. Confirmed' },
            ].map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex flex-col gap-1">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      isCompleted || isCurrent
                        ? 'bg-[#0AAD0A]'
                        : 'bg-stone-200'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-semibold ${
                      isCurrent
                        ? 'text-[#0AAD0A]'
                        : isCompleted
                          ? 'text-stone-800'
                          : 'text-stone-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: ADDRESS & INSTRUCTIONS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-stone-200/90 p-4 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0AAD0A]" />
                    Delivery Address
                  </h3>
                  <div className="flex gap-1.5">
                    {PRESET_ADDRESSES.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setDeliveryAddress(preset.address);
                          setAptOrSuite(preset.apt);
                          setAddressError(null);
                        }}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                          deliveryAddress === preset.address
                            ? 'bg-emerald-50 border-[#0AAD0A] text-[#0AAD0A]'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (addressError) setAddressError(null);
                      }}
                      placeholder="Street address, city, state, zip"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/25 focus:border-[#0AAD0A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Apt / Suite (Optional)
                    </label>
                    <input
                      type="text"
                      value={aptOrSuite}
                      onChange={(e) => setAptOrSuite(e.target.value)}
                      placeholder="Apt, Suite, Floor"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/25 focus:border-[#0AAD0A]"
                    />
                  </div>
                </div>

                {addressError && (
                  <p className="text-xs font-medium text-red-600">
                    {addressError}
                  </p>
                )}

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leaveAtDoor}
                    onChange={(e) => setLeaveAtDoor(e.target.checked)}
                    className="w-4 h-4 accent-[#0AAD0A] rounded"
                  />
                  <span className="text-xs font-semibold text-stone-800">
                    Leave at my door if I am not around (Photo proof included)
                  </span>
                </label>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Delivery Instructions for Personal Shopper
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="Gate code, building entrance, or drop-off preference..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/25 focus:border-[#0AAD0A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY SLOT PICKER */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-stone-200/90 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-[#0AAD0A]" />
                    Choose Your Delivery Window
                  </h3>
                  {isFreeDeliveryEligible && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0AAD0A] border border-emerald-200">
                      ✓ Free Standard Delivery Unlocked
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {deliverySlots.map((slot) => {
                    const isSelected = slot.id === selectedSlotId;
                    const displayFee = slot.isExpress
                      ? (isFreeDeliveryEligible ? 0 : activeStore.deliveryFee) +
                        slot.fee
                      : isFreeDeliveryEligible
                        ? 0
                        : slot.fee;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#0AAD0A] bg-emerald-50/40 ring-1 ring-[#0AAD0A]'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="delivery-slot"
                            checked={isSelected}
                            onChange={() => setSelectedSlotId(slot.id)}
                            className="mt-1 accent-[#0AAD0A]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-stone-900">
                                {slot.label}
                              </span>
                              {slot.badge && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    slot.isExpress
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {slot.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                              {slot.isExpress ? (
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                              ) : (
                                <Truck className="w-3.5 h-3.5 text-stone-400" />
                              )}
                              {slot.windowText}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {displayFee === 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-stone-400 line-through">
                                ${slot.fee.toFixed(2)}
                              </span>
                              <span className="text-xs font-bold text-[#0AAD0A]">
                                FREE
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-stone-900">
                              ${displayFee.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SHOPPER TIP & PAYMENT SUMMARY */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Shopper Tip Card */}
              <div className="bg-white rounded-xl border border-stone-200/90 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-[#0AAD0A]" />
                      Personal Shopper Tip
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      100% of your tip goes directly to the shopper who hand-picks
                      your order.
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#0AAD0A]">
                    ${tipAmount.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {(['10', '15', '20', '25'] as const).map((pct) => {
                    const amt = ((subtotal * parseInt(pct, 10)) / 100).toFixed(
                      2
                    );
                    const isSelected = tipMode === pct;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipMode(pct)}
                        className={`py-2 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#0AAD0A] text-white border-[#0AAD0A] shadow-2xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{pct}%</div>
                        <div
                          className={`text-[10px] ${
                            isSelected ? 'text-emerald-100' : 'text-stone-500'
                          }`}
                        >
                          ${amt}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setTipMode('custom')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      tipMode === 'custom'
                        ? 'bg-[#0AAD0A] text-white border-[#0AAD0A] shadow-2xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-bold">Custom</div>
                    <div
                      className={`text-[10px] ${
                        tipMode === 'custom'
                          ? 'text-emerald-100'
                          : 'text-stone-500'
                      }`}
                    >
                      $ Amount
                    </div>
                  </button>
                </div>

                {tipMode === 'custom' && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-semibold text-stone-600">
                      Custom tip ($):
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.50"
                      value={customTipInput}
                      onChange={(e) => setCustomTipInput(e.target.value)}
                      className="w-28 text-xs px-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#0AAD0A]"
                    />
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-xl border border-stone-200/90 p-4 space-y-2.5 shadow-2xs">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0AAD0A]" />
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentId === pm.id
                          ? 'border-[#0AAD0A] bg-emerald-50/40'
                          : 'border-stone-200 bg-stone-50/60 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment-method"
                          checked={selectedPaymentId === pm.id}
                          onChange={() => setSelectedPaymentId(pm.id)}
                          className="accent-[#0AAD0A]"
                        />
                        <span className="text-xs font-semibold text-stone-900">
                          {pm.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700">
                        {pm.badge}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Complete Itemized Order Ledger */}
              <div className="bg-white rounded-xl border border-stone-200/90 p-4 space-y-2 text-xs shadow-2xs">
                <h4 className="font-bold text-stone-900 text-sm mb-2">
                  Order Summary ({items.length} unique products)
                </h4>
                <div className="flex justify-between text-stone-600">
                  <span>Items subtotal</span>
                  <span className="font-semibold text-stone-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {productSavings > 0 && (
                  <div className="flex justify-between text-[#0AAD0A]">
                    <span>Store sale savings</span>
                    <span className="font-semibold">
                      -${productSavings.toFixed(2)}
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#0AAD0A]">
                    <span>Promo discount ({promoCode})</span>
                    <span className="font-semibold">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Delivery ({selectedSlot.label})</span>
                  <span className="font-semibold text-stone-900">
                    {effectiveSlotDeliveryFee === 0 ? (
                      <strong className="text-[#0AAD0A]">FREE</strong>
                    ) : (
                      `$${effectiveSlotDeliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Service fee</span>
                  <span className="font-semibold text-stone-900">
                    ${serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Personal shopper tip</span>
                  <span className="font-semibold text-stone-900">
                    ${tipAmount.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
                  <span>Order Total</span>
                  <span className="text-base text-[#0AAD0A]">
                    ${finalOrderTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMATION */}
          {step === 4 && confirmedOrder && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0AAD0A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#0AAD0A] border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  Order #{confirmedOrder.orderId} Confirmed
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-2">
                  We&apos;ve sent your order to {confirmedOrder.store.name}!
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                  Your personal shopper{' '}
                  <strong className="text-stone-900">
                    {confirmedOrder.shopperName}
                  </strong>{' '}
                  has been assigned and will follow all of your substitution
                  preferences.
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery Window:</span>
                  <span className="font-bold text-stone-900">
                    {confirmedOrder.deliverySlot.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery Address:</span>
                  <span className="font-semibold text-stone-800">
                    {confirmedOrder.deliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Total Charged:</span>
                  <span className="font-bold text-[#0AAD0A]">
                    ${confirmedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 px-5 rounded-xl bg-[#0AAD0A] hover:bg-[#099409] text-white font-bold text-sm shadow-md transition-all"
              >
                Track Live Order Status on Storefront
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons (Steps 1-3) */}
        {step < 4 && (
          <div className="bg-white border-t border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-[#0AAD0A]" />
                <span>100% Freshness Guarantee</span>
              </div>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0AAD0A] hover:bg-[#099409] text-white text-xs font-bold shadow-xs transition-all"
              >
                <span>Continue to Delivery Window</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0AAD0A] hover:bg-[#099409] text-white text-xs font-bold shadow-xs transition-all"
              >
                <span>Continue to Tip &amp; Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0AAD0A] hover:bg-[#099409] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Place Order · ${finalOrderTotal.toFixed(2)}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
