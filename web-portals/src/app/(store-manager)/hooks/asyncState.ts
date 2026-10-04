export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type AsyncAction<T> = { type: "start" } | { type: "success"; data: T } | { type: "error"; error: string };

export const initialAsyncState: AsyncState<never> = { data: null, loading: true, error: null };

/** Keeps previous data while reloading so pages don't flash empty. */
export function asyncReducer<T>(state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> {
  switch (action.type) {
    case "start":
      return { ...state, loading: true, error: null };
    case "success":
      return { data: action.data, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.error };
  }
}
