import { Platform } from 'react-native';

/**
 * Platform-specific styling utilities
 * Android typically needs larger text sizes and adjusted padding to match iOS appearance
 */

/**
 * Get platform-adjusted font size
 * Android text appears smaller, so we scale it up slightly
 */
export function getFontSize(baseSize: number): number {
  if (Platform.OS === 'android') {
    // Increase font size by ~15% on Android to match iOS visual appearance
    return Math.round(baseSize * 1.15);
  }
  return baseSize;
}

/**
 * Get platform-adjusted padding
 * Android typically needs slightly less padding to match iOS visual spacing
 */
export function getPadding(basePadding: number): number {
  if (Platform.OS === 'android') {
    // Reduce padding by ~10% on Android to match iOS visual spacing
    return Math.round(basePadding * 0.9);
  }
  return basePadding;
}

/**
 * Get platform-adjusted horizontal padding
 */
export function getHorizontalPadding(basePadding: number): number {
  return getPadding(basePadding);
}

/**
 * Get platform-adjusted vertical padding
 */
export function getVerticalPadding(basePadding: number): number {
  return getPadding(basePadding);
}

/**
 * Platform-specific text style helper
 */
export function getTextStyle(baseSize: number, fontWeight: 'normal' | 'bold' | '600' | '700' = 'normal') {
  return {
    fontSize: getFontSize(baseSize),
    fontWeight: fontWeight,
  };
}

/**
 * Common text sizes with platform adjustments
 */
export const TextSizes = {
  xs: getFontSize(12),
  sm: getFontSize(14),
  base: getFontSize(16),
  lg: getFontSize(18),
  xl: getFontSize(20),
  '2xl': getFontSize(24),
  '3xl': getFontSize(30),
  '4xl': getFontSize(36),
};

/**
 * Common padding sizes with platform adjustments
 */
export const PaddingSizes = {
  xs: getPadding(4),
  sm: getPadding(8),
  base: getPadding(12),
  md: getPadding(16),
  lg: getPadding(24),
  xl: getPadding(32),
  '2xl': getPadding(40),
};

