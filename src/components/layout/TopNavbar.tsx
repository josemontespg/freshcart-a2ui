import React from 'react';
import {
  Search,
  ShoppingCart,
  Sparkles,
  Clock,
  CheckCircle2,
  X,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import type { Store } from '../../types/grocery';
import type { ScenarioId } from '../ai-shopper/AIShopperDrawer';

export interface TopNavbarProps {
  activeStore: Store;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalItemCount: number;
  subtotal: number;
  isFreeDeliveryUnlocked: boolean;
  amountToFreeDelivery: number;
  onOpenCart: () => void;
  isAIShopperOpen: boolean;
  onToggleAIShopper: () => void;
  onLaunchScenario?: (scenarioId: ScenarioId) => void;
  onOpenProtocolInspector?: () => void;
  protocolLogCount?: number;
  onOpenOnboardingReport?: () => void;
}

const QUICK_SEARCH_TERMS = ['Organic', 'Salmon', 'Avocado', 'Quinoa', 'Yogurt', 'Keto'];

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeStore,
  searchQuery,
  onSearchChange,
  totalItemCount,
  subtotal,
  isFreeDeliveryUnlocked,
  amountToFreeDelivery,
  onOpenCart,
  isAIShopperOpen,
  onToggleAIShopper,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Main Header Row */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Active Store Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#top"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0AAD0A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#099409] transition-colors">
              <span className="text-xl" role="img" aria-label="FreshCart">
                🥕
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-stone-900">
                  Fresh<span className="text-[#0AAD0A]">Cart</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <span>{activeStore.logoEmoji}</span>
                <span className="font-medium text-stone-700 truncate max-w-[140px] sm:max-w-[200px]">
                  {activeStore.name}
                </span>
                <span className="text-stone-300">•</span>
                <span className="inline-flex items-center gap-0.5 text-[#0AAD0A] font-semibold">
                  <Clock className="w-3 h-3" />
                  {activeStore.deliveryEtaMinutes} min
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Central Search Input with Quick Filter Suggestions */}
        <div className="flex-1 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search ${activeStore.name} for produce, meals, or pantry staples...`}
              aria-label={`Search ${activeStore.name}`}
              className="w-full pl-11 pr-24 py-2.5 bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-sm text-stone-900 rounded-full border border-stone-200/80 focus:border-[#0AAD0A] focus:ring-2 focus:ring-[#0AAD0A]/15 focus:outline-none transition-all placeholder:text-stone-400"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 bg-stone-200/70 hover:bg-stone-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 absolute right-3">
                {QUICK_SEARCH_TERMS.slice(0, 3).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onSearchChange(term)}
                    className="text-[11px] font-medium text-stone-500 hover:text-[#073E1E] bg-white hover:bg-emerald-50 border border-stone-200/80 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Buttons: AI Personal Shopper & Cart Drawer */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* AI Personal Shopper Toggle */}
          <button
            type="button"
            onClick={onToggleAIShopper}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              isAIShopperOpen
                ? 'bg-[#073E1E] text-white border-[#073E1E] shadow-xs'
                : 'bg-emerald-50/90 hover:bg-emerald-100/80 text-[#073E1E] border-emerald-200/90'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#0AAD0A]" />
            <span>AI Shopper</span>
            {isAIShopperOpen ? (
              <PanelRightClose className="w-3.5 h-3.5 opacity-80 hidden sm:inline" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5 opacity-80 hidden sm:inline" />
            )}
          </button>

          {/* Primary Cart Drawer Button */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping cart with ${totalItemCount} items`}
            className="inline-flex items-center gap-2.5 bg-[#0AAD0A] hover:bg-[#099409] active:bg-[#077d07] text-white font-semibold px-4 py-2.5 rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="relative flex items-center">
              <ShoppingCart className="w-4 h-4" />
              {isFreeDeliveryUnlocked && totalItemCount > 0 && (
                <CheckCircle2
                  className="w-3 h-3 text-emerald-200 -ml-1 -mt-2"
                  aria-label="Free delivery unlocked"
                />
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold">{totalItemCount}</span>
            <span className="hidden sm:inline text-emerald-200/80">|</span>
            <span className="hidden sm:inline text-xs sm:text-sm font-semibold">
              ${subtotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {/* Free Delivery Status Sub-bar when close to unlocking */}
      {totalItemCount > 0 && !isFreeDeliveryUnlocked && amountToFreeDelivery > 0 && (
        <div className="bg-emerald-50/90 border-t border-emerald-100 px-4 py-1.5 text-center text-xs text-emerald-900">
          Add <span className="font-bold text-[#0AAD0A]">${amountToFreeDelivery.toFixed(2)}</span> more from{' '}
          <span className="font-semibold">{activeStore.name}</span> to unlock{' '}
          <span className="font-bold text-[#073E1E]">Free Delivery</span>
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
