import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/src/theme/colors';

export default function ScanLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: Platform.OS === 'ios',
        headerBlurEffect: Platform.OS === 'ios' ? 'regular' : undefined,
        headerStyle: Platform.OS === 'ios'
          ? undefined
          : { backgroundColor: colors.white },
        headerTitleStyle: { fontWeight: '600', color: colors.gray[900] },
        headerTintColor: colors.primary[600],
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="review"
        options={{ title: 'Review Bill' }}
      />
      <Stack.Screen
        name="analyzing"
        options={{ title: 'Analyzing', headerBackVisible: false }}
      />
      <Stack.Screen
        name="results"
        options={{ title: 'Results' }}
      />
      <Stack.Screen
        name="script"
        options={{ title: 'Negotiation Script' }}
      />
    </Stack>
  );
}
