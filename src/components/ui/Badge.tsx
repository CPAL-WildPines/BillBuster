import { View, Text } from 'react-native';
import type { FindingSeverity } from '@/src/models/analysis';

const severityStyles: Record<FindingSeverity, { bg: string; text: string }> = {
  low: { bg: 'bg-gray-100', text: 'text-gray-600' },
  medium: { bg: 'bg-warning-100', text: 'text-warning-600' },
  high: { bg: 'bg-danger-100', text: 'text-danger-600' },
  critical: { bg: 'bg-danger-500', text: 'text-white' },
};

interface BadgeProps {
  severity: FindingSeverity;
  label?: string;
}

export function Badge({ severity, label }: BadgeProps) {
  const style = severityStyles[severity];
  return (
    <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-semibold capitalize ${style.text}`}>
        {label ?? severity}
      </Text>
    </View>
  );
}
