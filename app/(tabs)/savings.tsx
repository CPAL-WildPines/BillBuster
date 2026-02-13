import { View, Text, Pressable, SafeAreaView, Animated as RNAnimated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSavingsStore } from '@/src/stores/savings-store';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { GradientCard } from '@/src/components/ui/GradientCard';
import { AnimatedCounter } from '@/src/components/ui/AnimatedCounter';
import { FadeIn } from '@/src/components/ui/FadeIn';
import { colors } from '@/src/theme/colors';

export default function SavingsTab() {
  const totalSavings = useSavingsStore((s) => s.totalSavings);
  const billCount = useSavingsStore((s) => s.billCount);
  const loading = useSavingsStore((s) => s.loading);
  const loadSavings = useSavingsStore((s) => s.loadSavings);
  const router = useRouter();

  useEffect(() => { loadSavings(); }, []);

  // Floating animation for empty state
  const floatAnim = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    if (totalSavings === 0 && billCount === 0 && !loading) {
      const float = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
          RNAnimated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
      );
      float.start();
      return () => float.stop();
    }
  }, [totalSavings, billCount, loading]);

  if (!loading && totalSavings === 0 && billCount === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <ScreenHeader title="Savings" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <RNAnimated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center', marginBottom: 20,
            }}>
              <FontAwesome name="line-chart" size={32} color={colors.gray[300]} />
            </View>
          </RNAnimated.View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.gray[400], marginBottom: 6 }}>No savings yet</Text>
          <Text style={{ fontSize: 14, color: colors.gray[300], textAlign: 'center', marginBottom: 24 }}>
            Scan some bills to start tracking savings
          </Text>
          <Pressable
            onPress={() => router.push('/scan/review')}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.primary[700] : colors.primary[600],
              borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12,
              flexDirection: 'row', alignItems: 'center',
            })}
          >
            <FontAwesome name="camera" size={14} color="white" />
            <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>Scan Your First Bill</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const avgPerBill = billCount > 0 ? totalSavings / billCount : 0;
  const projectedAnnual = billCount > 0 ? (totalSavings / billCount) * 12 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ScreenHeader title="Savings" />
      <View style={{ flex: 1, padding: 20, paddingTop: 8 }}>
        <FadeIn from={{ opacity: 0, translateY: 20 }} duration={600}>
          {/* Main savings card — gradient */}
          <GradientCard colors={[colors.primary[600], '#7c3aed']} style={{ marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Total Potential Savings
            </Text>
            <AnimatedCounter
              value={totalSavings / 100}
              prefix="$"
              decimals={2}
              style={{ fontSize: 44, fontWeight: '800', color: '#ffffff', letterSpacing: -1 }}
            />
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
              Found across {billCount} bill{billCount !== 1 ? 's' : ''}
            </Text>
          </GradientCard>
        </FadeIn>

        <FadeIn from={{ opacity: 0, translateY: 20 }} delay={200} duration={600}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Bills analyzed */}
            <View style={{
              flex: 1, backgroundColor: colors.white, borderRadius: 20, padding: 20, alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
              elevation: 1,
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <FontAwesome name="file-text-o" size={20} color={colors.primary[600]} />
              </View>
              <AnimatedCounter
                value={billCount}
                decimals={0}
                style={{ fontSize: 28, fontWeight: '800', color: colors.gray[900] }}
              />
              <Text style={{ fontSize: 12, color: colors.gray[400], fontWeight: '500', marginTop: 4 }}>Bills Analyzed</Text>
            </View>

            {/* Average per bill */}
            <View style={{
              flex: 1, backgroundColor: colors.white, borderRadius: 20, padding: 20, alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
              elevation: 1,
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.success[50], alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <FontAwesome name="line-chart" size={18} color={colors.success[500]} />
              </View>
              <AnimatedCounter
                value={avgPerBill / 100}
                prefix="$"
                decimals={0}
                style={{ fontSize: 28, fontWeight: '800', color: colors.gray[900] }}
              />
              <Text style={{ fontSize: 12, color: colors.gray[400], fontWeight: '500', marginTop: 4 }}>Avg per Bill</Text>
            </View>
          </View>
        </FadeIn>

        {/* Projected Annual Savings */}
        <FadeIn from={{ opacity: 0, translateY: 20 }} delay={400} duration={600}>
          <View style={{
            backgroundColor: colors.white, borderRadius: 20, padding: 20, marginTop: 12,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
            elevation: 1,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <FontAwesome name="calendar" size={18} color="#f59e0b" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.gray[900] }}>Projected Annual</Text>
                <Text style={{ fontSize: 12, color: colors.gray[400], marginTop: 2 }}>Based on your average</Text>
              </View>
            </View>
            <AnimatedCounter
              value={projectedAnnual / 100}
              prefix="$"
              decimals={0}
              style={{ fontSize: 24, fontWeight: '800', color: colors.success[600] }}
            />
          </View>
        </FadeIn>
      </View>
    </SafeAreaView>
  );
}
