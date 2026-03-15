/**
 * Cultural Heritage Centre — Full Featured Mobile App
 *
 * Complete app with: navigation, API data, cart, offline support.
 * Error boundary prevents crashes from killing the app.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import RootNavigator from './src/navigation/TabNavigator';
import { colors } from './src/theme/colors';
import { fontAssets } from './src/theme/typography';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      networkMode: 'offlineFirst',
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
          <StatusBar barStyle="light-content" backgroundColor="#0e382c" />
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

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
      setReady(true);
    }
  }, [fontsLoaded]);

  // Show loading while fonts load (system font fallback if fonts fail)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ready) {
        SplashScreen.hideAsync().catch(() => {});
        setReady(true); // Force ready even if fonts fail
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="light-content" backgroundColor="#0e382c" />
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="light-content" backgroundColor="#0e382c" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e382c' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e382c' },
  errorScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e382c', padding: 32 },
  errorTitle: { fontSize: 22, color: '#F5F2ED', marginBottom: 12, textAlign: 'center' },
  errorMsg: { fontSize: 13, color: 'rgba(245,242,237,0.5)', textAlign: 'center', marginBottom: 24 },
  errorRetry: { fontSize: 14, color: '#C5A059', textAlign: 'center', padding: 12 },
});
