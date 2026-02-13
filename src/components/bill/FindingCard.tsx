import { View, Text } from 'react-native';
import type { Finding } from '@/src/models/analysis';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface FindingCardProps {
  finding: Finding;
}

export function FindingCard({ finding }: FindingCardProps) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-gray-900 flex-1 mr-2">
          {finding.title}
        </Text>
        <Badge severity={finding.severity} />
      </View>
      <Text className="text-sm text-gray-600 mb-2">
        {finding.description}
      </Text>
      {finding.estimatedSavings > 0 && (
        <View className="flex-row items-center">
          <Text className="text-sm text-success-600 font-semibold">
            Potential savings: {formatCents(finding.estimatedSavings)}
          </Text>
        </View>
      )}
    </Card>
  );
}
