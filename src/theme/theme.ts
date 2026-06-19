// ─────────────────────────────────────────────────────────────────────────────
// VegDash Premium Theme  —  Forest Green × Champagne Gold
// ─────────────────────────────────────────────────────────────────────────────
export const theme = {
  colors: {
    // ── Primary Brand ──────────────────────────────────────────────────────────
    primaryGreen:  '#0B4D3A',   // Forest Green  — buttons, CTAs, active states
    darkGreen:     '#0A3B2E',   // Deep Emerald  — headers, premium cards
    deepEmerald:   '#0A3B2E',   // alias of darkGreen
    sageGreen:     '#A7B8A3',   // Sage Green    — secondary icons, borders

    // ── Luxury Accents ─────────────────────────────────────────────────────────
    gold:          '#C7A96B',   // Champagne Gold — ratings, badges, highlights
    softGold:      '#D8BC84',   // Soft Gold      — hover / decorative

    // ── Backgrounds ────────────────────────────────────────────────────────────
    background:    '#FAF9F6',   // Premium Ivory  — main background
    warmWhite:     '#F5F3EE',   // Warm White     — cards, containers
    premiumIvory:  '#F5F3EE',   // alias of warmWhite
    card:          '#FFFFFF',   // Pure White     — floating cards, inputs
    pureWhite:     '#FFFFFF',   // alias of card

    // ── Typography ─────────────────────────────────────────────────────────────
    primaryText:   '#1C1C1C',
    secondaryText: '#5E5E5E',
    lightText:     '#8A8A8A',

    // ── Borders / Dividers ─────────────────────────────────────────────────────
    border:        '#E8E4DC',   // warm sage-tinted border
    divider:       '#EDE9E1',   // softer divider line

    // ── Success / Verification ─────────────────────────────────────────────────
    success:       '#2E7D32',   // Pure Veg Green
    softSuccessBg: '#E8F5E9',

    // ── Gradients (CSS string — web-only) ──────────────────────────────────────
    premiumCardGradient:       `linear-gradient(135deg, #0B4D3A 0%, #0A3B2E 100%)`,
    premiumMembershipGradient: `linear-gradient(90deg, #0A3B2E 0%, #0B4D3A 50%, #0F6A4D 100%)`,
  },

  fonts: {
    heading:   'Playfair Display, serif',
    body:      'Inter, sans-serif',
    secondary: 'Plus Jakarta Sans, sans-serif',
  },

  borderRadius: 12,

  shadows: {
    // Returns an object spreadable into a style.
    boxShadow: (color: string) => ({ boxShadow: `0px 4px 10px ${color}28` }),
    card: {
      shadowColor: '#0B4D3A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
  },
};

