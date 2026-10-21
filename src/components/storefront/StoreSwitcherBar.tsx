import React from 'react';
import { Clock, ShieldCheck, Star, Truck } from 'lucide-react';
import { STORES, getStoreById } from '../../data/stores';
import type { Store, StoreId } from '../../types/grocery';

export interface StoreSwitcherBarProps {
  stores?: Store[];
  activeStoreId: StoreId;
  onSelectStore: (storeId: StoreId) => void;
}

export const StoreSwitcherBar: React.FC<StoreSwitcherBarProps> = ({
  stores = STORES,
  activeStoreId,
  onSelectStore,
}) => {
  const activeStore = getStoreById(activeStoreId);

  return (
    <section
      aria-label="Retail store banner selector"
      className="bg-white border-b border-stone-200/80 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Horizontal store pills */}
          <div
            role="tablist"
            aria-label="Select grocery retailer"
            className="flex items-center gap-2.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar"
          >
            {stores.map((store) => {
              const isSelected = store.id === activeStoreId;
              return (
                <button
                  key={store.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectStore(store.id)}
                  className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-2xl border text-left transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#073E1E] text-white border-[#073E1E] shadow-sm ring-2 ring-[#0AAD0A]/30'
                      : 'bg-[#F7F5F0]/70 hover:bg-stone-100 text-stone-800 border-stone-200/90'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-xl text-xl shrink-0 transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-white/15 ring-1 ring-white/25'
                        : 'bg-white shadow-2xs border border-stone-200/60'
                    }`}
                    aria-hidden="true"
                  >
                    {store.logoEmoji}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate">
                        {store.name}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0AAD0A] text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs mt-0.5 ${
                        isSelected ? 'text-emerald-100' : 'text-stone-500'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {store.deliveryEtaMinutes}m
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Free ${store.freeDeliveryThreshold}+
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active store trust & SLA strip */}
          <div className="hidden xl:flex items-center gap-4 text-xs text-stone-600 bg-[#F7F5F0] px-3.5 py-2 rounded-xl border border-stone-200/80 shrink-0">
            <div className="flex items-center gap-1.5 font-medium text-stone-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{activeStore.rating.toFixed(1)}</span>
              <span className="text-stone-400">
                ({activeStore.reviewCount.toLocaleString()}+)
              </span>
            </div>
            <span className="text-stone-300" aria-hidden="true">
              |
            </span>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#0AAD0A]" />
              <span>
                Delivery in{' '}
                <strong className="text-stone-900">
                  {activeStore.deliveryEtaMinutes} mins
                </strong>
              </span>
            </div>
            <span className="text-stone-300" aria-hidden="true">
              |
            </span>
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0AAD0A]" />
              <span>100% Freshness Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
