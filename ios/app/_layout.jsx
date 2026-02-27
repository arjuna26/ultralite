import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../context/AuthContext';
import { getMe } from '../services/api';
import { getToken, removeToken } from '../services/storage';
import { COLORS } from '../constants/colors';

function useProtectedRoute(user, isLoading) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)/bags');
    }
  }, [user, segments, isLoading]);
}

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const token = await getToken();
      if (token) {
        const userData = await getMe();
        setUser(userData);
      }
    } catch {
      await removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  useProtectedRoute(user, isLoading);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthContext.Provider value={{ user, setUser }}>
          <StatusBar style="dark" backgroundColor={COLORS.surface} />
          {isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface }}>
              <ActivityIndicator size="large" color={COLORS.primary500} />
            </View>
          ) : (
            <Slot />
          )}
        </AuthContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
