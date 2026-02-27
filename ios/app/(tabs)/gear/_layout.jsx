import { Stack } from 'expo-router';
import { COLORS } from '../../../constants/colors';

export default function GearLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.surface } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
