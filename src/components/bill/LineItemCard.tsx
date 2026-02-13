import { View, Text } from 'react-native';
import type { LineItem } from '@/src/models/bill';
import { Card } from '@/src/components/ui/Card';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface LineItemCardProps {
  item: LineItem;
}

export function LineItemCard({ item }: LineItemCardProps) {
  return (
    <Card className={`mb-2 ${item.flagged ? 'border border-danger-500' : ''}`}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center">
            {item.flagged && (
              <FontAwesome
                name="exclamation-triangle"
                size={14}
                color={colors.danger[500]}
                style={{ marginRight: 6 }}
              />
            )}
            <Text className="text-sm font-medium text-gray-900">
              {item.description}
            </Text>
          </View>
          {item.flagged && item.flagReason && (
            <Text className="text-xs text-danger-600 mt-1">
              {item.flagReason}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className={`text-sm font-semibold ${item.flagged ? 'text-danger-600' : 'text-gray-900'}`}>
            {formatCents(item.amount)}
          </Text>
          {item.typicalAmount != null && item.flagged && (
            <Text className="text-xs text-gray-400">
              Typical: {formatCents(item.typicalAmount)}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}
