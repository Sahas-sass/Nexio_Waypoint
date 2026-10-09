import { createMemoryDb } from './memoryDb';

/** Web build: expo-sqlite's WASM worker is not bundled, so persist to localStorage instead. */
export const localDb = createMemoryDb(typeof localStorage === 'undefined' ? undefined : localStorage);
