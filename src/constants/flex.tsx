// React Native flex styles (no 'display: flex' needed in RN)
const FLEX_ROW_BETWEEN = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
};

const FLEX_ROW_CENTER = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const FLEX_ROW = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
};

const FLEX_COLUMN = {
  flexDirection: 'column' as const,
};

const FLEX_ROW_SPACE_AROUND = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-around' as const,
};

const FLEX_COLUMN_CENTER = {
  flexDirection: 'column' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export const flex = {
  FLEX_ROW,
  FLEX_COLUMN,
  FLEX_ROW_CENTER,
  FLEX_ROW_BETWEEN,
  FLEX_COLUMN_CENTER,
  FLEX_ROW_SPACE_AROUND,
};
