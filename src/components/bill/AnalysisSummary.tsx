import { View, Text } from 'react-native';
import type { AnalysisResult } from '@/src/models/analysis';
import { Card } from '@/src/components/ui/Card';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getRiskColor(score: number) {
  if (score >= 70) return { bg: 'bg-danger-50', text: colors.danger[600], label: 'High Risk' };
  if (score >= 40) return { bg: 'bg-warning-50', text: colors.warning[600], label: 'Medium Risk' };
  return { bg: 'bg-success-50', text: colors.success[600], label: 'Low Risk' };
}

interface AnalysisSummaryProps {
  analysis: AnalysisResult;
  provider: string;
}

export function AnalysisSummary({ analysis, provider }: AnalysisSummaryProps) {
  const risk = getRiskColor(analysis.overallRiskScore);

  return (
    <Card className="mb-4">
      <View className="flex-row items-center mb-3">
        <FontAwesome name="building" size={16} color={colors.gray[500]} />
        <Text className="text-sm text-gray-500 ml-2 capitalize">{provider}</Text>
      </View>

      <View className="flex-row justify-between mb-3">
        <View className="flex-1 mr-4">
          <Text className="text-xs text-gray-400 uppercase mb-1">Potential Savings</Text>
          <Text className="text-2xl font-bold text-success-600">
            {formatCents(analysis.totalIdentifiedSavings)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-400 uppercase mb-1">Risk Score</Text>
          <View className={`px-3 py-1.5 rounded-full ${risk.bg}`}>
            <Text style={{ color: risk.text }} className="text-sm font-semibold">
              {analysis.overallRiskScore}/100
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-sm text-gray-600 leading-5">
        {analysis.summary}
      </Text>

      <View className="flex-row mt-3">
        <View className="flex-row items-center mr-4">
          <FontAwesome name="exclamation-circle" size={14} color={colors.danger[500]} />
          <Text className="text-xs text-gray-500 ml-1">
            {analysis.findings.length} issue{analysis.findings.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      </View>
    </Card>
  );
}
