import { useTheme } from '@/contexts/theme-context';

export function useThemeColors() {
  const { actualTheme } = useTheme();

  return {
    backgroundColor: actualTheme === 'dark' ? '#0F0E11' : '#FFFFFF',
    cardBackground: actualTheme === 'dark' ? '#2B2E36' : '#F3F4F6',
    textColor: actualTheme === 'dark' ? '#FFFFFF' : '#111827',
    secondaryTextColor: actualTheme === 'dark' ? '#D1D5DB' : '#6B7280',
    inputBackground: actualTheme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderColor: actualTheme === 'dark' ? '#374151' : '#E5E7EB',
    iconBackground: actualTheme === 'dark' ? '#1F2937' : '#E5E7EB',
    dividerColor: actualTheme === 'dark' ? '#1F2937' : '#E5E7EB',
    statusBarStyle: actualTheme === 'dark' ? 'light' as const : 'dark' as const,
  };
}

