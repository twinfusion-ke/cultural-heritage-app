/**
 * Cultural Heritage Centre — Full Featured Mobile App
 *
 * Complete app with: navigation, API data, cart, offline support.
 * Error boundary prevents crashes from killing the app.
 *
 * Edge-to-edge: SafeAreaProvider at root, transparent system bars,
 * insets applied via hooks in AppHeader and TabNavigator.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';

import RootNavigator from './src/navigation/TabNavigator';
import { colors } from './src/theme/colors';
import { fontAssets } from './src/theme/typography';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { startSyncService, onSyncChange } from './src/services/syncService';
import { useUIStore } from './src/stores/uiStore';
import { useEnvStore } from './src/stores/envStore';
import { useCartStore } from './src/stores/cartStore';
import { useFavoritesStore } from './src/stores/favoritesStore';
import { cacheClearAll } from './src/db/contentCache';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Android edge-to-edge: transparent navigation bar
if (Platform.OS === 'android') {
  NavigationBar.setBackgroundColorAsync('transparent').catch(() => {});
  NavigationBar.setPositionAsync('absolute').catch(() => {});
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,        // 30 seconds — refetch often for fresh content
      gcTime: 1000 * 60 * 60 * 24, // keep cache 24h for offline
      retry: 1,
      networkMode: 'offlineFirst',
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});

/** Error Boundary — catches crashes and shows recovery screen */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorScreen}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMsg}>{this.state.error}</Text>
          <Text
            style={styles.errorRetry}
            onPress={() => this.setState({ hasError: false, error: '' })}
          >
            Tap to retry
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

/** App initializer — loads stores, starts services */
function AppInitializer({ children }: { children: React.ReactNode }) {
  useNetworkStatus();

  useEffect(() => {
    // Load persisted stores
    useEnvStore.getState().loadFromStorage();
    useCartStore.getState().loadFromStorage();
    useFavoritesStore.getState().loadFromStorage();

    // Start background sync service
    startSyncService();

    // Listen for sync count changes
    const unsub = onSyncChange((count) => {
      useUIStore.getState().setPendingSyncCount(count);
    });

    // Clear stale cache on every app start so WP changes show immediately
    cacheClearAll();

    return unsub;
  }, []);

  return <>{children}</>;
}

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
      setReady(true);
    }
  }, [fontsLoaded]);

  // Force ready even if fonts fail after 3s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ready) {
        SplashScreen.hideAsync().catch(() => {});
        setReady(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <AppInitializer>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AppInitializer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e382c' },
  errorScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e382c', padding: 32 },
  errorTitle: { fontSize: 22, color: '#F5F2ED', marginBottom: 12, textAlign: 'center' },
  errorMsg: { fontSize: 13, color: 'rgba(245,242,237,0.5)', textAlign: 'center', marginBottom: 24 },
  errorRetry: { fontSize: 14, color: '#C5A059', textAlign: 'center', padding: 12 },
});
