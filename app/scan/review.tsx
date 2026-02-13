import { View, Text, Image, Pressable, Alert, SafeAreaView, Animated as RNAnimated } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useBillStore } from '@/src/stores/bill-store';
import { useCamera } from '@/src/hooks/useCamera';
import { useAnalysis } from '@/src/hooks/useAnalysis';
import { FadeIn } from '@/src/components/ui/FadeIn';
import { lightHaptic } from '@/src/utils/haptics';
import { colors } from '@/src/theme/colors';

export default function ReviewScreen() {
  const router = useRouter();
  const imageUri = useBillStore((s) => s.imageUri);
  const setImageUri = useBillStore((s) => s.setImageUri);
  const { pickImage, takePhoto, loading: cameraLoading } = useCamera();
  const { analyze } = useAnalysis();
  const [analyzing, setAnalyzing] = useState(false);

  // Pulse animation for dashed border
  const borderPulse = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    if (!imageUri) {
      const pulse = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(borderPulse, { toValue: 1, duration: 2000, useNativeDriver: false }),
          RNAnimated.timing(borderPulse, { toValue: 0, duration: 2000, useNativeDriver: false }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [imageUri]);

  const borderColor = borderPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.gray[300], colors.primary[400]],
  });

  const handlePickImage = useCallback(async () => {
    const uri = await pickImage();
    if (uri) setImageUri(uri);
  }, [pickImage, setImageUri]);

  const handleTakePhoto = useCallback(async () => {
    const uri = await takePhoto();
    if (uri) setImageUri(uri);
  }, [takePhoto, setImageUri]);

  const showPicker = useCallback(() => {
    Alert.alert('Add Bill Photo', 'How would you like to add your bill?', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Photo Library', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleTakePhoto, handlePickImage]);

  useEffect(() => {
    if (!imageUri) {
      const timer = setTimeout(showPicker, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAnalyze = async () => {
    lightHaptic();
    setAnalyzing(true);
    await analyze();
    setAnalyzing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      {imageUri ? (
        <View style={{ flex: 1 }}>
          {/* Image Preview */}
          <FadeIn from={{ opacity: 0, scale: 0.95 }} duration={400}>
            <View style={{
              flex: 1, margin: 16, borderRadius: 20, overflow: 'hidden',
              backgroundColor: colors.gray[200],
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
              elevation: 4,
            }}>
              <Image
                source={{ uri: imageUri }}
                style={{ flex: 1, width: '100%', minHeight: 300 }}
                resizeMode="contain"
              />
            </View>
          </FadeIn>

          {/* Ready indicator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success[500], marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: colors.gray[500], fontWeight: '500' }}>Ready for analysis</Text>
          </View>

          {/* Bottom Actions */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
            <Pressable
              onPress={handleAnalyze}
              disabled={analyzing}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={pressed ? [colors.primary[700], '#3730a3'] : [colors.primary[600], '#6d28d9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 18,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    opacity: analyzing ? 0.6 : 1,
                  }}
                >
                  <FontAwesome name="magic" size={18} color="white" />
                  <Text style={{ color: 'white', fontSize: 17, fontWeight: '700', marginLeft: 10 }}>
                    Analyze This Bill
                  </Text>
                </LinearGradient>
              )}
            </Pressable>

            <Pressable
              onPress={showPicker}
              style={{ alignItems: 'center', paddingVertical: 14, marginTop: 4 }}
            >
              <Text style={{ color: colors.primary[600], fontSize: 15, fontWeight: '600' }}>
                Choose Different Photo
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <LinearGradient
            colors={[colors.gray[50], colors.primary[50]]}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            }}
          />
          <Pressable
            onPress={showPicker}
            style={({ pressed }) => ({
              width: 200,
              height: 200,
              borderRadius: 24,
              borderWidth: 2.5,
              borderStyle: 'dashed',
              borderColor: pressed ? colors.primary[600] : colors.gray[300],
              backgroundColor: pressed ? colors.primary[50] : colors.gray[50],
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <FontAwesome name="camera" size={44} color={colors.gray[400]} />
            <Text style={{ color: colors.gray[500], fontSize: 15, fontWeight: '500', marginTop: 12 }}>
              Tap to add bill
            </Text>
          </Pressable>
          <Text style={{ color: colors.gray[400], fontSize: 13, marginTop: 20, textAlign: 'center', lineHeight: 20 }}>
            Take a photo of your bill or choose one from your photo library
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
