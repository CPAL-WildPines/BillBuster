import { View, Text, TextInput, ScrollView, Pressable, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSettingsStore } from '@/src/stores/settings-store';
import {
  getOpenAIKey, setOpenAIKey,
  getAnthropicKey, setAnthropicKey,
  getOpenRouterKey, setOpenRouterKey,
  deleteAllKeys,
} from '@/src/services/storage/secure-storage';
import { deleteAllData } from '@/src/services/storage/database';
import { useHistoryStore } from '@/src/stores/history-store';
import { useSavingsStore } from '@/src/stores/savings-store';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { FadeIn } from '@/src/components/ui/FadeIn';
import { lightHaptic, errorHaptic } from '@/src/utils/haptics';
import { testOpenRouterKey, testOpenAIKey, testAnthropicKey } from '@/src/services/ai/key-validator';
import { colors } from '@/src/theme/colors';
import type { AIProviderType } from '@/src/models/settings';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

function KeyInput({
  label,
  value,
  onSave,
  onTest,
}: {
  label: string;
  value: string;
  onSave: (key: string) => void;
  onTest: (key: string) => Promise<{ ok: boolean; message: string }>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const display = value ? value.slice(0, 7) + '···' + value.slice(-4) : 'Not set';

  const handleTest = async () => {
    if (!value) return;
    setTestStatus('testing');
    const result = await onTest(value);
    setTestStatus(result.ok ? 'success' : 'error');
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  if (editing) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.gray[700], marginBottom: 6 }}>{label}</Text>
        <TextInput
          style={{
            backgroundColor: colors.gray[100], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
            fontSize: 14, color: colors.gray[900],
          }}
          placeholder="Paste your API key here"
          placeholderTextColor={colors.gray[400]}
          value={draft}
          onChangeText={setDraft}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <Pressable
            onPress={() => {
              if (draft.trim()) {
                onSave(draft.trim());
                Alert.alert('Saved', `${label} has been saved securely.`);
              }
              setEditing(false);
              setDraft('');
            }}
            style={{ backgroundColor: colors.primary[600], borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Save</Text>
          </Pressable>
          <Pressable
            onPress={() => { setEditing(false); setDraft(''); }}
            style={{ backgroundColor: colors.gray[100], borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}
          >
            <Text style={{ color: colors.gray[500], fontSize: 14, fontWeight: '600' }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.gray[700], marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => setEditing(true)}
          style={{
            flex: 1, backgroundColor: colors.gray[100], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 14, color: value ? colors.gray[900] : colors.gray[400] }}>{display}</Text>
          <FontAwesome name="pencil" size={13} color={colors.gray[400]} />
        </Pressable>
        {value ? (
          <Pressable
            onPress={handleTest}
            disabled={testStatus === 'testing'}
            style={{
              width: 48, height: 48, borderRadius: 12,
              backgroundColor: testStatus === 'success' ? colors.success[50]
                : testStatus === 'error' ? colors.danger[50]
                : colors.gray[100],
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {testStatus === 'testing' ? (
              <ActivityIndicator size="small" color={colors.primary[600]} />
            ) : testStatus === 'success' ? (
              <FontAwesome name="check" size={16} color={colors.success[500]} />
            ) : testStatus === 'error' ? (
              <FontAwesome name="times" size={16} color={colors.danger[500]} />
            ) : (
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.gray[500] }}>Test</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function SettingsTab() {
  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const setAIProvider = useSettingsStore((s) => s.setAIProvider);
  const loadBills = useHistoryStore((s) => s.loadBills);
  const loadSavings = useSavingsStore((s) => s.loadSavings);

  const [openrouterKey, setOpenrouterKeyState] = useState('');
  const [openaiKey, setOpenaiKeyState] = useState('');
  const [anthropicKey, setAnthropicKeyState] = useState('');

  useEffect(() => {
    (async () => {
      const ork = await getOpenRouterKey();
      const ok = await getOpenAIKey();
      const ak = await getAnthropicKey();
      if (ork) setOpenrouterKeyState(ork);
      if (ok) setOpenaiKeyState(ok);
      if (ak) setAnthropicKeyState(ak);
    })();
  }, []);

  const providers: { type: AIProviderType; label: string; desc: string; icon: React.ComponentProps<typeof FontAwesome>['name'] }[] = [
    { type: 'openrouter', label: 'OpenRouter', desc: 'Use any model via OpenRouter', icon: 'exchange' },
    { type: 'openai', label: 'OpenAI GPT-4o', desc: 'Best for detailed analysis', icon: 'bolt' },
    { type: 'anthropic', label: 'Claude Sonnet', desc: 'Great at finding issues', icon: 'cloud' },
  ];

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Data',
      'This permanently removes all bills, analyses, scripts, and API keys.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            errorHaptic();
            await deleteAllData();
            await deleteAllKeys();
            setOpenrouterKeyState('');
            setOpenaiKeyState('');
            setAnthropicKeyState('');
            await loadBills();
            await loadSavings();
            Alert.alert('Done', 'All data has been deleted.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40 }}>
        {/* AI Provider Section */}
        <FadeIn from={{ opacity: 0, translateY: 16 }} duration={400}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            AI Provider
          </Text>
          <Text style={{ fontSize: 13, color: colors.gray[400], marginBottom: 12 }}>
            Choose which AI analyzes your bills
          </Text>
          <View style={{
            backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
            elevation: 1,
          }}>
            {providers.map((p) => {
              const active = aiProvider === p.type;
              return (
                <Pressable
                  key={p.type}
                  onPress={() => {
                    lightHaptic();
                    setAIProvider(p.type);
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    padding: 14, borderRadius: 14, marginBottom: 8,
                    backgroundColor: active ? colors.primary[50] : colors.gray[50],
                    borderWidth: active ? 1.5 : 0, borderColor: colors.primary[200],
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: active ? colors.primary[600] : colors.gray[200],
                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                  }}>
                    <FontAwesome name={p.icon} size={16} color={active ? 'white' : colors.gray[400]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: active ? colors.primary[900] : colors.gray[700] }}>{p.label}</Text>
                    <Text style={{ fontSize: 12, color: active ? colors.primary[400] : colors.gray[400], marginTop: 1 }}>{p.desc}</Text>
                  </View>
                  {active && <FontAwesome name="check-circle" size={20} color={colors.primary[600]} />}
                </Pressable>
              );
            })}
          </View>
        </FadeIn>

        {/* API Keys Section */}
        <FadeIn from={{ opacity: 0, translateY: 16 }} delay={100} duration={400}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            API Keys
          </Text>
          <Text style={{ fontSize: 13, color: colors.gray[400], marginBottom: 12 }}>
            Stored securely on your device
          </Text>
          <View style={{
            backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
            elevation: 1,
          }}>
            <KeyInput
              label="OpenRouter API Key"
              value={openrouterKey}
              onSave={async (k) => { await setOpenRouterKey(k); setOpenrouterKeyState(k); }}
              onTest={testOpenRouterKey}
            />
            <KeyInput
              label="OpenAI API Key"
              value={openaiKey}
              onSave={async (k) => { await setOpenAIKey(k); setOpenaiKeyState(k); }}
              onTest={testOpenAIKey}
            />
            <KeyInput
              label="Anthropic API Key"
              value={anthropicKey}
              onSave={async (k) => { await setAnthropicKey(k); setAnthropicKeyState(k); }}
              onTest={testAnthropicKey}
            />
            <View style={{ backgroundColor: '#f0f9ff', borderRadius: 10, padding: 12, marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: '#0369a1', lineHeight: 18 }}>
                Keys are stored securely on your device using the iOS Keychain. They are never sent anywhere except to the AI provider you select.
              </Text>
            </View>
          </View>
        </FadeIn>

        {/* Data & Privacy Section */}
        <FadeIn from={{ opacity: 0, translateY: 16 }} delay={200} duration={400}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Data & Privacy
          </Text>
          <Text style={{ fontSize: 13, color: colors.gray[400], marginBottom: 12 }}>
            Everything stays on your phone
          </Text>
          <View style={{
            backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
            elevation: 1,
          }}>
            <Text style={{ fontSize: 13, color: colors.gray[500], lineHeight: 19, marginBottom: 14 }}>
              All data is stored locally on your device. Nothing is uploaded to our servers.
            </Text>
            <Pressable
              onPress={handleDeleteAll}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.danger[600] : colors.danger[500],
                borderRadius: 14, paddingVertical: 14, alignItems: 'center',
              })}
            >
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>Delete All Data</Text>
            </Pressable>
          </View>
        </FadeIn>

        {/* App Info */}
        <FadeIn from={{ opacity: 0 }} delay={300} duration={400}>
          <View style={{ alignItems: 'center', marginTop: 8, paddingBottom: 20 }}>
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center', marginBottom: 10,
            }}>
              <FontAwesome name="file-text-o" size={22} color="white" />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.gray[900] }}>BillBuster v1.0.0</Text>
            <Text style={{ fontSize: 12, color: colors.gray[400], marginTop: 4 }}>Made with care</Text>
          </View>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}
