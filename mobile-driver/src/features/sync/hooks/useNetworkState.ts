import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';

import { syncAndReload } from '@/features/trip/services/tripController';

import { useSyncStore } from '../store/syncStore';
import { isOnlineState } from '../utils/connectivity';


/** Mirror connectivity into the sync store and flush the outbox when the device comes back online. */
export function useNetworkState() {
  const wasOnline = useRef<boolean | null>(null);

  useEffect(() => {
    const handle = (state: NetInfoState) => {
      const online = isOnlineState(state);
      useSyncStore.getState().setIsOnline(online);
      if (wasOnline.current === false && online) void syncAndReload();
      wasOnline.current = online;
    };
    NetInfo.fetch().then(handle);
    return NetInfo.addEventListener(handle);
  }, []);
}
