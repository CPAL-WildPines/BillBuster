import { View, Text } from 'react-native';
import { FadeIn } from './FadeIn';
import { textStyles } from '@/src/theme/typography';
import { colors } from '@/src/theme/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, rightAction }: ScreenHeaderProps) {
  return (
    <FadeIn from={{ opacity: 0, translateY: -10 }} duration={400}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.screenTitle}>{title}</Text>
          {subtitle && (
            <Text style={{ fontSize: 14, color: colors.gray[400], marginTop: 4 }}>{subtitle}</Text>
          )}
        </View>
        {rightAction}
      </View>
    </FadeIn>
  );
}
