import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const textStyles = {
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.gray[900],
    letterSpacing: -0.5,
  } as TextStyle,
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.gray[900],
    letterSpacing: -0.3,
  } as TextStyle,
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gray[900],
  } as TextStyle,
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  } as TextStyle,
  body: {
    fontSize: 16,
    color: colors.gray[500],
    lineHeight: 24,
  } as TextStyle,
  bodySmall: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  } as TextStyle,
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
  } as TextStyle,
  money: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  } as TextStyle,
  moneyLarge: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.success[600],
    letterSpacing: -1,
  } as TextStyle,
};
