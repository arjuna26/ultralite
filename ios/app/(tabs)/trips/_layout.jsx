import { Stack } from 'expo-router';
import { COLORS } from '../../../constants/colors';

export default function TripsLayout() {
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
      <Stack.Screen name="new" options={{ title: 'New Trip', headerBackTitle: 'Trips' }} />
      <Stack.Screen name="[id]" options={{ title: 'Trip Details', headerBackTitle: 'Trips' }} />
    </Stack>
  );
}
