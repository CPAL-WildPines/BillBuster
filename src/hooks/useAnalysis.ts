import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useBillStore } from '@/src/stores/bill-store';
import { useHistoryStore } from '@/src/stores/history-store';
import { useSavingsStore } from '@/src/stores/savings-store';
import { useSettingsStore } from '@/src/stores/settings-store';
import { getAIProvider } from '@/src/services/ai/ai-service';
import { prepareImageForAI } from '@/src/services/ai/image-utils';
import { saveScript } from '@/src/services/storage/bill-repository';
import { getOpenAIKey, getAnthropicKey, getOpenRouterKey } from '@/src/services/storage/secure-storage';
import type { Bill } from '@/src/models/bill';
import type { AnalysisResult } from '@/src/models/analysis';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function useAnalysis() {
  const router = useRouter();
  const addBill = useHistoryStore((s) => s.addBill);
  const addSavings = useSavingsStore((s) => s.addSavings);

  const analyze = useCallback(async () => {
    const { imageUri, setStatus, setCurrentBill, setCurrentAnalysis, setError } =
      useBillStore.getState();
    const { aiProvider } = useSettingsStore.getState();

    if (!imageUri) {
      Alert.alert('No Image', 'Please select a bill photo first.');
      return;
    }

    // Check API key before starting
    const keyGetters: Record<string, () => Promise<string | null>> = {
      openrouter: getOpenRouterKey,
      openai: getOpenAIKey,
      anthropic: getAnthropicKey,
    };
    const providerNames: Record<string, string> = {
      openrouter: 'OpenRouter',
      openai: 'OpenAI',
      anthropic: 'Anthropic',
    };
    const key = await keyGetters[aiProvider]();
    if (!key) {
      Alert.alert(
        'API Key Required',
        `No ${providerNames[aiProvider]} API key found. Add one in Settings first.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => router.dismissAll() },
        ],
      );
      return;
    }

    setStatus('analyzing');
    router.push('/scan/analyzing');

    try {
      const provider = getAIProvider(aiProvider);
      const base64 = await prepareImageForAI(imageUri);
      const response = await provider.analyzeBill(base64);

      const billId = generateId();
      const now = new Date().toISOString();

      const bill: Bill = {
        id: billId,
        imageUri,
        category: response.category,
        provider: response.provider,
        totalAmount: response.totalAmount,
        billDate: response.billDate,
        createdAt: now,
        lineItems: response.lineItems,
      };

      const analysis: AnalysisResult = {
        billId,
        summary: response.summary,
        overallRiskScore: response.overallRiskScore,
        totalIdentifiedSavings: response.totalIdentifiedSavings,
        findings: response.findings,
        createdAt: now,
      };

      setCurrentBill(bill);
      setCurrentAnalysis(analysis);

      await addBill(bill, analysis);
      addSavings(analysis.totalIdentifiedSavings);
      useSettingsStore.getState().incrementScansUsed();

      router.replace('/scan/results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      console.error('Analysis error:', err);
      setError(message);
      router.replace('/scan/results');
    }
  }, [router, addBill, addSavings]);

  const generateScript = useCallback(async () => {
    const { currentBill, currentAnalysis, setCurrentScript, setError } =
      useBillStore.getState();
    const { aiProvider } = useSettingsStore.getState();

    if (!currentBill || !currentAnalysis) return;

    try {
      const provider = getAIProvider(aiProvider);
      const response = await provider.generateScript(
        currentBill.provider,
        currentAnalysis.findings,
        currentAnalysis.totalIdentifiedSavings,
      );

      const script = {
        billId: currentBill.id,
        format: 'phone' as const,
        sections: response.sections,
        keyPoints: response.keyPoints,
        createdAt: new Date().toISOString(),
      };

      setCurrentScript(script);
      await saveScript(script);
      router.push('/scan/script');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Script generation failed';
      console.error('Script error:', err);
      setError(message);
      Alert.alert('Error', message);
    }
  }, [router]);

  return { analyze, generateScript };
}
