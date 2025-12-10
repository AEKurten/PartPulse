import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'premium';

export interface SubscriptionFeatures {
  aiBuildsPerMonth: number;
  aiUpgradesPerMonth: number;
  hasAds: boolean;
  prioritySupport: boolean;
  advancedFilters: boolean;
  unlimitedWishlist: boolean;
}

export interface UsageStats {
  aiBuildsUsed: number;
  aiUpgradesUsed: number;
  lastResetDate: Date;
}

export interface SubscriptionData {
  plan: SubscriptionPlan;
  features: SubscriptionFeatures;
  usage: UsageStats;
  subscriptionEndDate?: Date;
  isActive: boolean;
}

const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionFeatures> = {
  free: {
    aiBuildsPerMonth: 2,
    aiUpgradesPerMonth: 1,
    hasAds: true,
    prioritySupport: false,
    advancedFilters: false,
    unlimitedWishlist: false,
  },
  basic: {
    aiBuildsPerMonth: 10,
    aiUpgradesPerMonth: 5,
    hasAds: false,
    prioritySupport: false,
    advancedFilters: true,
    unlimitedWishlist: true,
  },
  pro: {
    aiBuildsPerMonth: 50,
    aiUpgradesPerMonth: 25,
    hasAds: false,
    prioritySupport: true,
    advancedFilters: true,
    unlimitedWishlist: true,
  },
  premium: {
    aiBuildsPerMonth: -1, // Unlimited
    aiUpgradesPerMonth: -1, // Unlimited
    hasAds: false,
    prioritySupport: true,
    advancedFilters: true,
    unlimitedWishlist: true,
  },
};

interface SubscriptionContextType {
  subscription: SubscriptionData;
  canUseAIBuild: (buildMode: 'new' | 'upgrade') => boolean;
  useAIBuild: (buildMode: 'new' | 'upgrade') => Promise<boolean>;
  upgradePlan: (plan: SubscriptionPlan) => Promise<void>;
  resetUsage: () => Promise<void>;
  getUsagePercentage: (buildMode: 'new' | 'upgrade') => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEY = '@partpulse_subscription';
const USAGE_KEY = '@partpulse_usage';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'free',
    features: SUBSCRIPTION_PLANS.free,
    usage: {
      aiBuildsUsed: 0,
      aiUpgradesUsed: 0,
      lastResetDate: new Date(),
    },
    isActive: true,
  });

  useEffect(() => {
    loadSubscription();
    checkUsageReset();
  }, []);

  const loadSubscription = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const storedUsage = await AsyncStorage.getItem(USAGE_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        const usageData = storedUsage ? JSON.parse(storedUsage) : null;
        
        setSubscription({
          ...parsed,
          usage: usageData ? {
            ...usageData,
            lastResetDate: usageData.lastResetDate ? new Date(usageData.lastResetDate) : new Date(),
          } : subscription.usage,
          subscriptionEndDate: parsed.subscriptionEndDate ? new Date(parsed.subscriptionEndDate) : undefined,
          features: SUBSCRIPTION_PLANS[parsed.plan || 'free'],
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const saveSubscription = async (data: SubscriptionData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        plan: data.plan,
        subscriptionEndDate: data.subscriptionEndDate,
        isActive: data.isActive,
      }));
      await AsyncStorage.setItem(USAGE_KEY, JSON.stringify({
        ...data.usage,
        lastResetDate: data.usage.lastResetDate.toISOString(),
      }));
      setSubscription(data);
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  const checkUsageReset = async () => {
    const now = new Date();
    const lastReset = subscription.usage.lastResetDate instanceof Date 
      ? subscription.usage.lastResetDate 
      : new Date(subscription.usage.lastResetDate);
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceReset >= 30) {
      await resetUsage();
    }
  };

  const canUseAIBuild = (buildMode: 'new' | 'upgrade'): boolean => {
    const limit = buildMode === 'new' 
      ? subscription.features.aiBuildsPerMonth 
      : subscription.features.aiUpgradesPerMonth;

    if (limit === -1) return true; // Unlimited

    const used = buildMode === 'new' 
      ? subscription.usage.aiBuildsUsed 
      : subscription.usage.aiUpgradesUsed;

    return used < limit;
  };

  const useAIBuild = async (buildMode: 'new' | 'upgrade'): Promise<boolean> => {
    if (!canUseAIBuild(buildMode)) {
      return false;
    }

    const newUsage = {
      ...subscription.usage,
      aiBuildsUsed: buildMode === 'new' 
        ? subscription.usage.aiBuildsUsed + 1 
        : subscription.usage.aiBuildsUsed,
      aiUpgradesUsed: buildMode === 'upgrade' 
        ? subscription.usage.aiUpgradesUsed + 1 
        : subscription.usage.aiUpgradesUsed,
    };

    await saveSubscription({
      ...subscription,
      usage: newUsage,
    });

    return true;
  };

  const resetUsage = async (): Promise<void> => {
    const resetUsage: UsageStats = {
      aiBuildsUsed: 0,
      aiUpgradesUsed: 0,
      lastResetDate: new Date(),
    };

    await saveSubscription({
      ...subscription,
      usage: resetUsage,
    });
  };

  const upgradePlan = async (plan: SubscriptionPlan): Promise<void> => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    await saveSubscription({
      plan,
      features: SUBSCRIPTION_PLANS[plan],
      usage: subscription.usage, // Keep current usage
      subscriptionEndDate: endDate,
      isActive: true,
    });
  };

  const getUsagePercentage = (buildMode: 'new' | 'upgrade'): number => {
    const limit = buildMode === 'new' 
      ? subscription.features.aiBuildsPerMonth 
      : subscription.features.aiUpgradesPerMonth;

    if (limit === -1) return 0; // Unlimited

    const used = buildMode === 'new' 
      ? subscription.usage.aiBuildsUsed 
      : subscription.usage.aiUpgradesUsed;

    return Math.min((used / limit) * 100, 100);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        canUseAIBuild,
        useAIBuild,
        upgradePlan,
        resetUsage,
        getUsagePercentage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

