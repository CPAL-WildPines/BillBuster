import { View, Text, Pressable, Alert, SafeAreaView, Animated as RNAnimated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useBillStore } from '@/src/stores/bill-store';
import { useUsageGate } from '@/src/hooks/useUsageGate';
import { FadeIn } from '@/src/components/ui/FadeIn';
import { lightHaptic } from '@/src/utils/haptics';
import { colors } from '@/src/theme/colors';

const HOW_IT_WORKS = [
  { icon: 'camera' as const, title: 'Snap', desc: 'Take a photo of your bill' },
  { icon: 'search' as const, title: 'Analyze', desc: 'AI finds hidden charges' },
  { icon: 'piggy-bank' as const, title: 'Save', desc: 'Get a script to negotiate' },
];

export default function ScanTab() {
  const router = useRouter();
  const reset = useBillStore((s) => s.reset);
  const { canScan: allowed, remaining, isPro } = useUsageGate();

  // Pulse animation for scan button
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;
  useEffect(() => {
    const pulse = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
        RNAnimated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleScan = () => {
    lightHaptic();
    if (!allowed) {
      Alert.alert('Scan Limit Reached', 'Upgrade to Pro for unlimited scans.');
      return;
    }
    reset();
    router.push('/scan/review');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <FadeIn from={{ opacity: 0, scale: 0.9 }} duration={600}>
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            {/* Gradient circle behind app icon */}
            <LinearGradient
              colors={[colors.primary[500], '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                shadowColor: colors.primary[600],
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <FontAwesome name="file-text-o" size={40} color="white" />
            </LinearGradient>
            <Text style={{ fontSize: 30, fontWeight: '800', color: colors.gray[900], marginBottom: 8, letterSpacing: -0.5 }}>
              BillBuster
            </Text>
            <Text style={{ fontSize: 16, color: colors.gray[500], textAlign: 'center', lineHeight: 24 }}>
              Snap a bill. Find hidden charges.{'\n'}Save money.
            </Text>
          </View>
        </FadeIn>

        <FadeIn from={{ opacity: 0, translateY: 24 }} delay={250} duration={600}>
          <RNAnimated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={handleScan}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.primary[700] : colors.primary[600],
                borderRadius: 20,
                paddingHorizontal: 36,
                paddingVertical: 18,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: colors.primary[600],
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 6,
              })}
            >
              <FontAwesome name="camera" size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 12 }}>
                Scan a Bill
              </Text>
            </Pressable>
          </RNAnimated.View>
        </FadeIn>

        <FadeIn from={{ opacity: 0 }} delay={500} duration={500}>
          {isPro ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24 }}>
              <LinearGradient
                colors={[colors.primary[500], '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <FontAwesome name="star" size={12} color="white" />
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                  Pro — Unlimited Scans
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <Text style={{ color: colors.gray[400], fontSize: 14, marginTop: 24 }}>
              {remaining} free scan{remaining !== 1 ? 's' : ''} remaining
            </Text>
          )}
        </FadeIn>

        {/* How It Works */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 48, paddingHorizontal: 8 }}>
          {HOW_IT_WORKS.map((step, i) => (
            <FadeIn key={step.title} from={{ opacity: 0, translateY: 16 }} delay={700 + i * 120} duration={500}>
              <View style={{
                flex: 1,
                backgroundColor: colors.white,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                width: 100,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary[50],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <FontAwesome name={step.icon === 'piggy-bank' ? 'dollar' : step.icon} size={18} color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.gray[900], marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 11, color: colors.gray[400], textAlign: 'center', lineHeight: 15 }}>{step.desc}</Text>
              </View>
            </FadeIn>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
