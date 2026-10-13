export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  heavy: 'Nunito_800ExtraBold',
  arabic: 'NotoNaskhArabic_400Regular',
  arabicBold: 'NotoNaskhArabic_700Bold',
  /** Only for verified Quran text from generated data. */
  quran: 'AmiriQuran_400Regular',
  /** Long-form reading (Seerah episodes, stories). */
  serif: 'Lora_400Regular',
  serifSemibold: 'Lora_600SemiBold',
  serifBold: 'Lora_700Bold',
} as const;

export const typeScale = {
  display: 30,
  title: 24,
  heading: 20,
  body: 16,
  small: 14,
  tiny: 12,
} as const;

/** Minimum touch target recommended by platform accessibility guidelines. */
export const TOUCH_TARGET = 48;

/** Font scale of the "larger text" setting (system font scaling still applies on top). */
export const LARGE_TEXT_SCALE = 1.15;

/** Card / raised shadows; pass `c.shadow` so dark mode uses a black shadow. */
export function shadows(color: string) {
  return {
    card: {
      shadowColor: color,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    raised: {
      shadowColor: color,
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  } as const;
}
