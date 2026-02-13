import { View, Text, ScrollView, Pressable, SafeAreaView, Share, Animated as RNAnimated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useBillStore } from '@/src/stores/bill-store';
import { useAnalysis } from '@/src/hooks/useAnalysis';
import { FadeIn } from '@/src/components/ui/FadeIn';
import { lightHaptic, successHaptic } from '@/src/utils/haptics';
import { colors } from '@/src/theme/colors';
import type { Finding } from '@/src/models/analysis';
import type { LineItem } from '@/src/models/bill';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: '#f3f4f6', text: '#4b5563', border: colors.gray[300] },
  medium: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  high: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  critical: { bg: '#ef4444', text: '#ffffff', border: '#dc2626' },
};

function RiskGauge({ score }: { score: number }) {
  const gaugeColor = score >= 70 ? colors.danger[500] : score >= 40 ? '#f59e0b' : colors.success[500];
  const label = score >= 70 ? 'High Risk' : score >= 40 ? 'Medium Risk' : 'Low Risk';

  // Animate the gauge rotation
  const rotateAnim = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    RNAnimated.timing(rotateAnim, {
      toValue: score / 100,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [score]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '90deg'],
  });

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Semicircle gauge */}
      <View style={{ width: 72, height: 36, overflow: 'hidden', marginBottom: 4 }}>
        {/* Background arc */}
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          borderWidth: 6, borderColor: colors.gray[100],
          borderBottomColor: 'transparent', borderLeftColor: 'transparent',
          transform: [{ rotate: '-45deg' }],
        }} />
        {/* Colored arc overlay */}
        <RNAnimated.View style={{
          position: 'absolute', width: 72, height: 72, borderRadius: 36,
          borderWidth: 6, borderColor: 'transparent',
          borderTopColor: gaugeColor, borderRightColor: gaugeColor,
          transform: [{ rotate: rotation }],
        }} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '800', color: gaugeColor }}>{score}</Text>
      <Text style={{ fontSize: 10, color: colors.gray[400], fontWeight: '600', textTransform: 'uppercase', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function FindingRow({ finding, index }: { finding: Finding; index: number }) {
  const sev = severityColors[finding.severity] ?? severityColors.low;
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(heightAnim, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  return (
    <FadeIn from={{ opacity: 0, translateY: 12 }} delay={index * 80} duration={400}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={{
          backgroundColor: colors.white, borderRadius: 16, marginBottom: 10,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
          elevation: 1,
          overflow: 'hidden',
        }}
      >
        {/* Left severity border */}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 4, backgroundColor: sev.border }} />
          <View style={{ flex: 1, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.gray[900], flex: 1, marginRight: 8 }}>{finding.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {finding.estimatedSavings > 0 && (
                  <Text style={{ fontSize: 13, color: colors.success[600], fontWeight: '700' }}>
                    {formatCents(finding.estimatedSavings)}
                  </Text>
                )}
                <View style={{ backgroundColor: sev.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: sev.text, textTransform: 'uppercase' }}>{finding.severity}</Text>
                </View>
              </View>
            </View>
            {/* Expandable description */}
            <RNAnimated.View style={{
              maxHeight: heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }),
              opacity: heightAnim,
              overflow: 'hidden',
            }}>
              <Text style={{ fontSize: 13, color: colors.gray[500], lineHeight: 19, marginTop: 8 }}>{finding.description}</Text>
            </RNAnimated.View>
            <FontAwesome
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={10}
              color={colors.gray[300]}
              style={{ alignSelf: 'center', marginTop: 6 }}
            />
          </View>
        </View>
      </Pressable>
    </FadeIn>
  );
}

function LineItemRow({ item }: { item: LineItem }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 12, paddingHorizontal: 16,
      backgroundColor: item.flagged ? colors.danger[50] : colors.white,
      borderRadius: 12, marginBottom: 6,
      borderWidth: item.flagged ? 1 : 0, borderColor: item.flagged ? '#fecaca' : 'transparent',
    }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.flagged && <FontAwesome name="exclamation-triangle" size={12} color={colors.danger[500]} style={{ marginRight: 6 }} />}
          <Text style={{ fontSize: 14, color: colors.gray[900], fontWeight: item.flagged ? '600' : '400' }}>{item.description}</Text>
        </View>
        {item.flagged && item.flagReason && (
          <Text style={{ fontSize: 12, color: colors.danger[600], marginTop: 3 }}>{item.flagReason}</Text>
        )}
        {item.typicalAmount != null && item.typicalAmount > 0 && (
          <Text style={{ fontSize: 11, color: colors.gray[400], marginTop: 2 }}>Typical: {formatCents(item.typicalAmount)}</Text>
        )}
      </View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: item.flagged ? colors.danger[600] : colors.gray[900] }}>
        {formatCents(item.amount)}
      </Text>
    </View>
  );
}

export default function ResultsScreen() {
  const router = useRouter();
  const status = useBillStore((s) => s.status);
  const error = useBillStore((s) => s.error);
  const bill = useBillStore((s) => s.currentBill);
  const analysis = useBillStore((s) => s.currentAnalysis);
  const reset = useBillStore((s) => s.reset);
  const { generateScript } = useAnalysis();
  const [generatingScript, setGeneratingScript] = useState(false);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  // Celebration animation for savings amount
  const savingsScale = useRef(new RNAnimated.Value(0)).current;
  const glowOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (analysis && analysis.totalIdentifiedSavings > 0) {
      successHaptic();
      RNAnimated.sequence([
        RNAnimated.parallel([
          RNAnimated.spring(savingsScale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 14 }),
          RNAnimated.timing(glowOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        RNAnimated.timing(glowOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    } else if (analysis) {
      savingsScale.setValue(1);
    }
  }, [analysis]);

  if (status === 'error' || error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.danger[100], alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <FontAwesome name="exclamation-circle" size={36} color={colors.danger[500]} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.gray[900], marginBottom: 8 }}>Analysis Failed</Text>
          <Text style={{ fontSize: 14, color: colors.gray[500], textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>{error}</Text>
          <Pressable
            onPress={() => { reset(); router.replace('/scan/review'); }}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.primary[700] : colors.primary[600],
              borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14,
            })}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!bill || !analysis) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.gray[400], fontSize: 15 }}>No analysis data</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleGenerateScript = async () => {
    lightHaptic();
    setGeneratingScript(true);
    await generateScript();
    setGeneratingScript(false);
  };

  const handleShare = async () => {
    const text = `BillBuster found ${formatCents(analysis.totalIdentifiedSavings)} in potential savings on my ${bill.provider} bill!\n\n${analysis.summary}`;
    await Share.share({ message: text, title: 'BillBuster Analysis' });
  };

  const displayItems = showFlaggedOnly ? bill.lineItems.filter((i) => i.flagged) : bill.lineItems;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {/* Summary Card */}
        <FadeIn from={{ opacity: 0, translateY: 20 }} duration={500}>
          <View style={{
            backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
            elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <FontAwesome name="building" size={16} color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.gray[900], textTransform: 'capitalize' }}>{bill.provider}</Text>
              </View>
              <Pressable onPress={handleShare} style={{ padding: 8 }}>
                <FontAwesome name="share-alt" size={18} color={colors.primary[600]} />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <View>
                <Text style={{ fontSize: 11, color: colors.gray[400], fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Potential Savings</Text>
                <View style={{ position: 'relative' }}>
                  {/* Green glow behind savings */}
                  <RNAnimated.View style={{
                    position: 'absolute', top: 4, left: -8, right: -8, bottom: -4,
                    borderRadius: 12, backgroundColor: colors.success[100],
                    opacity: glowOpacity,
                  }} />
                  <RNAnimated.Text style={{
                    fontSize: 32, fontWeight: '800', color: colors.success[600], marginTop: 4,
                    transform: [{ scale: savingsScale }],
                  }}>
                    {formatCents(analysis.totalIdentifiedSavings)}
                  </RNAnimated.Text>
                </View>
              </View>
              <RiskGauge score={analysis.overallRiskScore} />
            </View>

            <Text style={{ fontSize: 14, color: colors.gray[500], lineHeight: 20 }}>{analysis.summary}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.gray[100] }}>
              <FontAwesome name="exclamation-circle" size={13} color={colors.danger[500]} />
              <Text style={{ fontSize: 13, color: colors.gray[500], marginLeft: 6 }}>
                {analysis.findings.length} issue{analysis.findings.length !== 1 ? 's' : ''} found
              </Text>
              <Text style={{ fontSize: 13, color: colors.gray[500], marginLeft: 16 }}>
                Bill total: {formatCents(bill.totalAmount)}
              </Text>
            </View>
          </View>
        </FadeIn>

        {/* Findings */}
        {analysis.findings.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.gray[900], marginBottom: 12 }}>Issues Found</Text>
            {analysis.findings.map((finding, i) => (
              <FindingRow key={i} finding={finding} index={i} />
            ))}
          </View>
        )}

        {/* Line Items */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.gray[900] }}>All Charges</Text>
            {bill.lineItems.some((i) => i.flagged) && (
              <Pressable
                onPress={() => setShowFlaggedOnly(!showFlaggedOnly)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: showFlaggedOnly ? colors.danger[50] : colors.gray[100],
                  borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
                }}
              >
                <FontAwesome name="flag" size={10} color={showFlaggedOnly ? colors.danger[500] : colors.gray[400]} />
                <Text style={{
                  fontSize: 12, fontWeight: '600', marginLeft: 5,
                  color: showFlaggedOnly ? colors.danger[500] : colors.gray[500],
                }}>
                  Flagged only
                </Text>
              </Pressable>
            )}
          </View>
          {displayItems.map((item, i) => (
            <LineItemRow key={i} item={item} />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Bar — frosted glass effect */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 20, paddingTop: 14, paddingBottom: 34,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8,
      }}>
        <Pressable
          onPress={handleGenerateScript}
          disabled={generatingScript}
        >
          {({ pressed }) => (
            <LinearGradient
              colors={pressed ? [colors.primary[700], '#5b21b6'] : [colors.primary[600], '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 14, paddingVertical: 16, alignItems: 'center',
                opacity: generatingScript ? 0.6 : 1,
                flexDirection: 'row', justifyContent: 'center',
              }}
            >
              <FontAwesome name="magic" size={16} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                {generatingScript ? 'Generating Script...' : 'Get Negotiation Script'}
              </Text>
            </LinearGradient>
          )}
        </Pressable>
        <Pressable
          onPress={() => { reset(); router.dismissAll(); }}
          style={{ alignItems: 'center', paddingVertical: 12, marginTop: 2 }}
        >
          <Text style={{ color: colors.primary[600], fontSize: 15, fontWeight: '600' }}>Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
