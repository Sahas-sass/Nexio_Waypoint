export interface ConnectivityState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

/** Online when connected and the internet is not known to be unreachable. */
export const isOnlineState = (state: ConnectivityState) =>
  state.isConnected === true && state.isInternetReachable !== false;
