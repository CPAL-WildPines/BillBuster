import { View, Text, ScrollView, Pressable, Share, Alert, SafeAreaView, Animated as RNAnimated } from 'react-native';
import { useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useBillStore } from '@/src/stores/bill-store';
import { FadeIn } from '@/src/components/ui/FadeIn';
import { lightHaptic, successHaptic } from '@/src/utils/haptics';
import { colors } from '@/src/theme/colors';

export default function ScriptScreen() {
  const router = useRouter();
  const script = useBillStore((s) => s.currentScript);
  const reset = useBillStore((s) => s.reset);
  const [copied, setCopied] = useState(false);

  if (!script) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.gray[400], fontSize: 15 }}>No script generated</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fullText = script.sections
    .map((s) => `${s.title}\n\n${s.content}`)
    .join('\n\n---\n\n')
    + '\n\nKey Points:\n'
    + script.keyPoints.map((p) => `• ${p}`).join('\n');

  const handleCopy = async () => {
    successHaptic();
    await Clipboard.setStringAsync(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    lightHaptic();
    await Share.share({ message: fullText, title: 'Negotiation Script — BillBuster' });
  };

  const handleCopyPoint = async (point: string) => {
    lightHaptic();
    await Clipboard.setStringAsync(point);
    Alert.alert('Copied!', 'Point copied to clipboard.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {/* Best Time to Call tip */}
        <FadeIn from={{ opacity: 0, translateY: 12 }} duration={400}>
          <View style={{
            backgroundColor: '#fffbeb', borderRadius: 14, padding: 14, marginBottom: 16,
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: '#fef3c7',
          }}>
            <FontAwesome name="clock-o" size={16} color="#f59e0b" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#92400e' }}>Best Time to Call</Text>
              <Text style={{ fontSize: 12, color: '#a16207', marginTop: 2, lineHeight: 17 }}>
                Tuesday-Thursday, 8-10 AM or 2-4 PM. Avoid Mondays and lunch hours for shorter wait times.
              </Text>
            </View>
          </View>
        </FadeIn>

        {script.sections.map((section, i) => (
          <FadeIn key={i} from={{ opacity: 0, translateY: 16 }} delay={100 + i * 80} duration={400}>
            <View style={{
              backgroundColor: colors.white, borderRadius: 16, padding: 18, marginBottom: 12,
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                {/* Gradient number circle */}
                <LinearGradient
                  colors={[colors.primary[600], '#7c3aed']}
                  style={{
                    width: 28, height: 28, borderRadius: 14,
                    alignItems: 'center', justifyContent: 'center', marginRight: 10,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: 'white' }}>{i + 1}</Text>
                </LinearGradient>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.gray[900] }}>{section.title}</Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.gray[700], lineHeight: 22 }}>{section.content}</Text>
            </View>
          </FadeIn>
        ))}

        {script.keyPoints.length > 0 && (
          <FadeIn from={{ opacity: 0, translateY: 16 }} delay={100 + script.sections.length * 80} duration={400}>
            <View style={{
              backgroundColor: colors.success[50], borderRadius: 16, padding: 18, marginBottom: 12,
              borderWidth: 1, borderColor: colors.success[100],
            }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 12 }}>
                Key Points to Remember
              </Text>
              {script.keyPoints.map((point, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleCopyPoint(point)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <FontAwesome name="check-circle" size={15} color={colors.success[500]} style={{ marginTop: 2, marginRight: 10 }} />
                  <Text style={{ fontSize: 14, color: colors.gray[700], flex: 1, lineHeight: 20 }}>{point}</Text>
                </Pressable>
              ))}
              <Text style={{ fontSize: 11, color: colors.gray[400], marginTop: 4, textAlign: 'center' }}>
                Tap any point to copy it
              </Text>
            </View>
          </FadeIn>
        )}
      </ScrollView>

      {/* Bottom Bar — frosted glass */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 20, paddingTop: 14, paddingBottom: 34,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8,
      }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => ({
              flex: 1, backgroundColor: pressed ? colors.gray[200] : colors.gray[100],
              borderRadius: 14, paddingVertical: 14, alignItems: 'center',
              flexDirection: 'row', justifyContent: 'center',
            })}
          >
            <FontAwesome name={copied ? 'check' : 'copy'} size={15} color={copied ? colors.success[500] : colors.gray[700]} />
            <Text style={{ color: copied ? colors.success[500] : colors.gray[700], fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={pressed ? [colors.primary[700], '#5b21b6'] : [colors.primary[600], '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flex: 1, borderRadius: 14, paddingVertical: 14,
                  alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
                  minWidth: 120,
                }}
              >
                <FontAwesome name="share" size={15} color="white" />
                <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>Share</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
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
