/**
 * Network Status Hook
 *
 * Monitors online/offline state and updates the UI store.
 * Used by the root App component to show offline banners.
 */

import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useUIStore } from '../stores/uiStore';

export function useNetworkStatus() {
  const setOnline = useUIStore((s) => s.setOnline);
  const isOnline = useUIStore((s) => s.isOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setOnline(online);
    });

    return () => unsubscribe();
  }, [setOnline]);

  return isOnline;
}
