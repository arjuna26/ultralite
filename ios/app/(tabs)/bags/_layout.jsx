import { Stack } from 'expo-router';
import { COLORS } from '../../../constants/colors';

export default function BagsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surfaceElevated },
        headerTintColor: COLORS.primary600,
        headerTitleStyle: { color: COLORS.neutral900, fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.surface },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'New Bag', headerBackTitle: 'Bags' }} />
      <Stack.Screen name="[id]" options={{ title: 'Bag Details', headerBackTitle: 'Bags' }} />
    </Stack>
  );
}
