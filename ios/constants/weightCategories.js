import { COLORS } from './colors';

export const getWeightCategory = (grams) => {
  const kg = grams / 1000;
  if (kg < 5) return { label: 'Ultralight', color: COLORS.primary600, bg: COLORS.primary50 };
  if (kg < 9) return { label: 'Light', color: COLORS.success, bg: COLORS.successLight };
  if (kg < 13) return { label: 'Standard', color: COLORS.warning, bg: COLORS.warningLight };
  return { label: 'Heavy', color: COLORS.accent600, bg: COLORS.accent100 };
};

export const formatWeight = (grams) => {
  if (!grams && grams !== 0) return '—';
  return `${(grams / 1000).toFixed(2)} kg`;
};

export const formatWeightGrams = (grams) => {
  if (!grams && grams !== 0) return '—';
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${grams}g`;
};
