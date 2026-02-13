import { View, Text, SafeAreaView, Animated as RNAnimated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';

const steps = [
  'Reading bill contents...',
  'Identifying line items...',
  'Checking for overcharges...',
  'Analyzing hidden fees...',
  'Calculating potential savings...',
];

function SpinningRings() {
  const rotation1 = useRef(new RNAnimated.Value(0)).current;
  const rotation2 = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const spin1 = RNAnimated.loop(
      RNAnimated.timing(rotation1, { toValue: 1, duration: 3000, useNativeDriver: true }),
    );
    const spin2 = RNAnimated.loop(
      RNAnimated.timing(rotation2, { toValue: 1, duration: 2000, useNativeDriver: true }),
    );
    spin1.start();
    spin2.start();
    return () => { spin1.stop(); spin2.stop(); };
  }, []);

  const rotate1 = rotation1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotate2 = rotation2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  return (
    <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
      {/* Faint background glow */}
      <View style={{
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        backgroundColor: colors.primary[50], opacity: 0.6,
      }} />
      {/* Outer ring */}
      <RNAnimated.View style={{
        position: 'absolute', width: 80, height: 80, borderRadius: 40,
        borderWidth: 3, borderColor: 'transparent',
        borderTopColor: colors.primary[400], borderRightColor: colors.primary[200],
        transform: [{ rotate: rotate1 }],
      }} />
      {/* Inner ring */}
      <RNAnimated.View style={{
        position: 'absolute', width: 56, height: 56, borderRadius: 28,
        borderWidth: 3, borderColor: 'transparent',
        borderTopColor: '#7c3aed', borderLeftColor: '#a78bfa',
        transform: [{ rotate: rotate2 }],
      }} />
      {/* Center icon */}
      <FontAwesome name="file-text-o" size={22} color={colors.primary[600]} />
    </View>
  );
}

function ProgressBar() {
  const progress = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(progress, {
      toValue: 1,
      duration: 12000,
      useNativeDriver: false,
    }).start();
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      backgroundColor: colors.gray[100],
    }}>
      <RNAnimated.View style={{
        height: 3, width,
        backgroundColor: colors.primary[500],
        borderRadius: 2,
      }} />
    </View>
  );
}

function StepItem({ label, delay, index, activeStep }: { label: string; delay: number; index: number; activeStep: number }) {
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const translateX = useRef(new RNAnimated.Value(-16)).current;
  const checkScale = useRef(new RNAnimated.Value(0)).current;
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      RNAnimated.timing(translateX, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  // Animate check when step completes
  const isComplete = index < activeStep;
  const isActive = index === activeStep;

  useEffect(() => {
    if (isComplete) {
      RNAnimated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }).start();
    }
  }, [isComplete]);

  useEffect(() => {
    if (isActive) {
      const pulse = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
          RNAnimated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive]);

  return (
    <RNAnimated.View style={{
      opacity, transform: [{ translateX }],
      flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    }}>
      <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        {isComplete ? (
          <RNAnimated.View style={{ transform: [{ scale: checkScale }] }}>
            <FontAwesome name="check-circle" size={18} color={colors.success[500]} />
          </RNAnimated.View>
        ) : (
          <RNAnimated.View style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: isActive ? colors.primary[400] : colors.gray[300],
            transform: isActive ? [{ scale: pulseAnim }] : [],
          }} />
        )}
      </View>
      <Text style={{
        fontSize: 15,
        color: isComplete ? colors.gray[400] : isActive ? colors.gray[700] : colors.gray[500],
        fontWeight: isActive ? '600' : '400',
      }}>
        {label}
      </Text>
    </RNAnimated.View>
  );
}

export default function AnalyzingScreen() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ProgressBar />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        <SpinningRings />

        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.gray[900], marginBottom: 6 }}>
          Analyzing Your Bill
        </Text>
        <Text style={{ fontSize: 14, color: colors.gray[400], textAlign: 'center', marginBottom: 32 }}>
          Our AI is carefully reviewing every charge
        </Text>

        <View style={{ alignSelf: 'stretch' }}>
          {steps.map((step, i) => (
            <StepItem key={step} label={step} delay={i * 700} index={i} activeStep={activeStep} />
          ))}
        </View>

        <Text style={{ fontSize: 12, color: colors.gray[300], marginTop: 24, textAlign: 'center' }}>
          This usually takes 10-15 seconds
        </Text>
      </View>
    </SafeAreaView>
  );
}
