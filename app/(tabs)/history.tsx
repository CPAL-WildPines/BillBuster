import { View, Text, FlatList, Pressable, Alert, SafeAreaView, Animated as RNAnimated } from 'react-native';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useHistoryStore } from '@/src/stores/history-store';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { FadeIn } from '@/src/components/ui/FadeIn';
import { mediumHaptic } from '@/src/utils/haptics';
import { colors } from '@/src/theme/colors';
import type { Bill } from '@/src/models/bill';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const categoryIcons: Record<string, { icon: React.ComponentProps<typeof FontAwesome>['name']; color: string; bg: string }> = {
  phone: { icon: 'mobile-phone', color: '#4f46e5', bg: '#eef2ff' },
  internet: { icon: 'wifi', color: '#0891b2', bg: '#ecfeff' },
  cable: { icon: 'television', color: '#7c3aed', bg: '#f5f3ff' },
  electric: { icon: 'bolt', color: '#f59e0b', bg: '#fffbeb' },
  gas: { icon: 'fire', color: '#ef4444', bg: '#fef2f2' },
  water: { icon: 'tint', color: '#0ea5e9', bg: '#f0f9ff' },
  insurance: { icon: 'shield', color: '#16a34a', bg: '#f0fdf4' },
  medical: { icon: 'heartbeat', color: '#ec4899', bg: '#fdf2f8' },
  subscription: { icon: 'repeat', color: '#8b5cf6', bg: '#f5f3ff' },
  other: { icon: 'file-text-o', color: '#6b7280', bg: '#f9fafb' },
};

function BillRow({ bill, onDelete, index }: { bill: Bill; onDelete: (id: string) => void; index: number }) {
  const cat = categoryIcons[bill.category] ?? categoryIcons.other;
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(20)).current;

  useEffect(() => {
    const delay = index * 60;
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      RNAnimated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <RNAnimated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Pressable
        onPressIn={() => {
          RNAnimated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
        }}
        onPressOut={() => {
          RNAnimated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
        }}
        onLongPress={() => {
          mediumHaptic();
          Alert.alert('Delete Bill', 'Remove this bill and its analysis?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(bill.id) },
          ]);
        }}
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.gray[50] : colors.white,
          borderRadius: 16, marginBottom: 10, marginHorizontal: 16,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
          elevation: 1,
          overflow: 'hidden',
        })}
      >
        <RNAnimated.View style={{ transform: [{ scale: scaleAnim }], flexDirection: 'row', alignItems: 'center' }}>
          {/* Left accent bar */}
          <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: cat.color, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }} />

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, paddingLeft: 12 }}>
            <View style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: cat.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}>
              <FontAwesome name={cat.icon} size={22} color={cat.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.gray[900] }}>{bill.provider}</Text>
              <Text style={{ fontSize: 12, color: colors.gray[400], marginTop: 2, textTransform: 'capitalize' }}>
                {bill.category} · {formatDate(bill.billDate)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.gray[900] }}>{formatCents(bill.totalAmount)}</Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={colors.gray[300]} style={{ marginLeft: 10 }} />
          </View>
        </RNAnimated.View>
      </Pressable>
    </RNAnimated.View>
  );
}

export default function HistoryTab() {
  const bills = useHistoryStore((s) => s.bills);
  const loading = useHistoryStore((s) => s.loading);
  const loadBills = useHistoryStore((s) => s.loadBills);
  const removeBill = useHistoryStore((s) => s.removeBill);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadBills(); }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBills();
    setRefreshing(false);
  }, [loadBills]);

  // Floating animation for empty state icon
  const floatAnim = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    if (bills.length === 0 && !loading) {
      const float = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
          RNAnimated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
      );
      float.start();
      return () => float.stop();
    }
  }, [bills.length, loading]);

  if (!loading && bills.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
        <ScreenHeader title="History" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <RNAnimated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center', marginBottom: 20,
            }}>
              <FontAwesome name="clock-o" size={36} color={colors.gray[300]} />
            </View>
          </RNAnimated.View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.gray[400], marginBottom: 6 }}>No bills yet</Text>
          <Text style={{ fontSize: 14, color: colors.gray[300], textAlign: 'center', marginBottom: 24 }}>
            Bills you scan will appear here
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <ScreenHeader
        title="History"
        rightAction={
          <View style={{
            backgroundColor: colors.primary[50],
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginTop: 8,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary[600] }}>{bills.length}</Text>
          </View>
        }
      />
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <BillRow bill={item} onDelete={removeBill} index={index} />}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}
