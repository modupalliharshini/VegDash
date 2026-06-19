import { theme } from '@/theme/theme';

const C = theme.colors;

export const colors = {
  RED_COLOR:        '#D32F2F',
  TEXT_COLOR:       C.lightText,
  WHITE_COLOR:      C.pureWhite,
  ORANGE_COLOR:     '#E65100',
  SEA_GREEN_COLOR:  C.primaryGreen,
  MAIN_DARK_COLOR:  C.primaryText,
  LIGHT_GRAY_COLOR: C.warmWhite,

  // VegDash Premium Palette
  FOREST_GREEN:   C.primaryGreen,
  DARK_EMERALD:   C.darkGreen,
  SAGE_GREEN:     C.sageGreen,
  CHAMPAGNE_GOLD: C.gold,
  SOFT_GOLD:      C.softGold,
  IVORY_BG:       C.background,
  WARM_WHITE:     C.warmWhite,
  PURE_WHITE:     C.pureWhite,
  PRIMARY_TEXT:   C.primaryText,
  SECONDARY_TEXT: C.secondaryText,
  LIGHT_TEXT:     C.lightText,
  VEG_GREEN:      C.success,
  SOFT_SUCCESS:   C.softSuccessBg,
  DARK_TEXT:      C.primaryText,
  MUTED_TEXT:     C.lightText,
  SOFT_BG:        C.warmWhite,

  // Legacy aliases (kept for backward compat)
  LIGHT_GREEN:      C.sageGreen,
  BRAND_LEAF_GREEN: C.primaryGreen,
  YELLOW_BANNER:    '#FFF3CD',
};
