import { type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius } from '@/src/theme/spacing';

interface GradientCardProps {
  colors: readonly [string, string, ...string[]];
  style?: ViewStyle;
  children: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientCard({
  colors: gradientColors,
  style,
  children,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: GradientCardProps) {
  return (
    <LinearGradient
      colors={gradientColors}
      start={start}
      end={end}
      style={[
        {
          borderRadius: radius['2xl'],
          padding: 28,
          shadowColor: gradientColors[0],
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}
