/**
 * Cultural Heritage Centre — Mobile App
 *
 * Root component: initializes navigation, database,
 * sync service, telemetry, and network monitoring.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';

import TabNavigator from './src/navigation/TabNavigator';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { getDatabase } from './src/db/database';
import { startSyncService, onSyncChange } from './src/services/syncService';
import { startSession, endSession } from './src/services/telemetry';
import { useUIStore } from './src/stores/uiStore';
import { colors } from './src/theme/colors';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Configure TanStack Query with offline-friendly defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,          // 5 min fresh
      gcTime: 1000 * 60 * 60 * 24,       // 24h cache
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      networkMode: 'offlineFirst',        // Serve cache first, then revalidate
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const isOnline = useNetworkStatus();
  const setPendingSyncCount = useUIStore((s) => s.setPendingSyncCount);

  useEffect(() => {
    async function init() {
      try {
        // 1. Initialize SQLite database (no network needed)
        await getDatabase();

        // 2. Start background sync service (listens for network)
        startSyncService();

        // 3. Subscribe to sync count changes
        onSyncChange((count) => setPendingSyncCount(count));

        // 4. Start telemetry session
        startSession();
      } catch (error) {
        console.warn('App init error:', error);
      } finally {
        setIsReady(true);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      endSession();
    };
  }, [setPendingSyncCount]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.shared.gold} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.root} onLayout={onLayoutRootView}>
        {/* Offline Banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              You are offline — changes will sync when connected
            </Text>
          </View>
        )}

        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.hub.primary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.hub.primary,
  },
  offlineBanner: {
    backgroundColor: colors.shared.warning,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineText: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    color: colors.shared.white,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
