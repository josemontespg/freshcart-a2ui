import type { Store, StoreId } from '../types/grocery';

export const DEFAULT_STORE_ID: StoreId = 'freshcart-organic';

export const STORES: Store[] = [
  {
    id: 'freshcart-organic',
    name: 'FreshCart Organic Market',
    tagline: 'Everyday organic produce, pasture-raised dairy & chef staples',
    logoEmoji: '🥬',
    primaryColor: '#0AAD0A',
    accentColor: '#073E1E',
    deliveryEtaMinutes: 35,
    deliveryFee: 3.99,
    freeDeliveryThreshold: 35.0,
    rating: 4.9,
    reviewCount: 4820,
    featuredPromoBanner: {
      title: 'Farm-to-Table Organic Harvest & Chef Meal Bundles',
      subtitle:
        'Scale recipes for your family, explore organic or gluten-free swaps, and add complete dinner ingredients in one click with your AI Personal Shopper.',
      badgeText: 'Free Delivery on $35+ · Seasonal Harvest',
      ctaText: 'Plan Dinner with AI Shopper',
      linkedScenarioId: 'meal-planner',
    },
  },
  {
    id: 'costco-wholesale',
    name: 'Costco Wholesale',
    tagline: 'Warehouse club bulk packs & Kirkland Signature family value',
    logoEmoji: '📦',
    primaryColor: '#005DAA',
    accentColor: '#E31837',
    deliveryEtaMinutes: 60,
    deliveryFee: 5.99,
    freeDeliveryThreshold: 75.0,
    rating: 4.8,
    reviewCount: 9150,
    featuredPromoBanner: {
      title: 'Stock Up with Club-Size Value & Weekly Meal Planning',
      subtitle:
        'Set your weekly grocery budget and nutrition goals to build a tailored family basket in seconds.',
      badgeText: 'Member Pricing · Free Delivery on $75+',
      ctaText: 'Build a Weekly Plan',
      linkedScenarioId: 'budget-builder',
    },
  },
  {
    id: 'sprouts-farmers',
    name: 'Sprouts Farmers Market',
    tagline: 'Farm-stand produce, keto, paleo & plant-based specialty',
    logoEmoji: '🌱',
    primaryColor: '#2E6B34',
    accentColor: '#1B4320',
    deliveryEtaMinutes: 45,
    deliveryFee: 3.99,
    freeDeliveryThreshold: 35.0,
    rating: 4.8,
    reviewCount: 3410,
    featuredPromoBanner: {
      title: 'Clean Ingredients, Keto Staples & Smart Cart Savings',
      subtitle:
        'Discover organic upgrades, lower-priced alternatives, and in-stock backups tailored to your basket.',
      badgeText: 'Wellness & Specialty Event · Save up to 25%',
      ctaText: 'Find Cart Savings',
      linkedScenarioId: 'cart-optimizer',
    },
  },
  {
    id: 'trader-joes-specialty',
    name: "Trader Joe's Specialty",
    tagline: 'Curated small-batch favorites, artisanal snacks & easy meals',
    logoEmoji: '🌺',
    primaryColor: '#B91C1C',
    accentColor: '#7F1D1D',
    deliveryEtaMinutes: 40,
    deliveryFee: 2.99,
    freeDeliveryThreshold: 35.0,
    rating: 4.9,
    reviewCount: 6290,
    featuredPromoBanner: {
      title: 'Small-Batch Favorites & 20-Minute Weeknight Feasts',
      subtitle:
        'Explore customer-favorite frozen meals, Everything Ciabatta, and Chili Onion Crunch, or plan quick weeknight dinners with AI.',
      badgeText: 'New Seasonal Arrivals · $2.99 Delivery',
      ctaText: 'Plan 20-Min Dinners',
      linkedScenarioId: 'meal-planner',
    },
  },
];

export function getStoreById(storeId: StoreId): Store {
  return STORES.find((store) => store.id === storeId) ?? STORES[0];
}
