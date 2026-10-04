import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';

import { flushSyncQueue } from '@/database/syncManager';
import { useQueueStore } from '@/store/queueStore';

export interface NetworkStateInfo {
  isOnline: boolean;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

/**
 * Custom React hook that monitors device network connectivity using @react-native-community/netinfo.
 * Synchronizes online state with useQueueStore and triggers flushSyncQueue()
 * immediately when transitioning from offline to online.
 */
export function useNetworkState(): NetworkStateInfo {
  const isOnline = useQueueStore((state) => state.isOnline);
  const setIsOnline = useQueueStore((state) => state.setIsOnline);

  const [rawState, setRawState] = useState<{
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
  }>({
    isConnected: null,
    isInternetReachable: null,
  });

  // Track previous online state to identify offline -> online transitions
  const wasOnlineRef = useRef<boolean | null>(null);

  useEffect(() => {
    const handleStateChange = (state: NetInfoState) => {
      // Robust calculation: isConnected must be true, and isInternetReachable must not be explicitly false
      const online = state.isConnected === true && state.isInternetReachable !== false;

      console.log(
        '[NetworkState] isConnected:',
        state.isConnected,
        'isInternetReachable:',
        state.isInternetReachable,
        '-> isOnline:',
        online
      );

      setRawState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });

      setIsOnline(online);

      // Transition condition: previously offline and now fully connected
      const wasOffline = wasOnlineRef.current === false;
      if (wasOffline && online) {
        void flushSyncQueue();
      }

      wasOnlineRef.current = online;
    };

    // Immediate query on mount to grab initial state before waiting for listener
    NetInfo.fetch().then(handleStateChange);

    // Event listener for network changes
    const unsubscribe = NetInfo.addEventListener(handleStateChange);

    return () => {
      unsubscribe();
    };
  }, [setIsOnline]);

  return {
    isOnline,
    isConnected: rawState.isConnected,
    isInternetReachable: rawState.isInternetReachable,
  };
}

export default useNetworkState;
