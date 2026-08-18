import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_URL = 'supabase_url';
const STORAGE_KEY_ANON_KEY = 'supabase_anon_key';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export function getDefaultSupabaseCredentials(): SupabaseCredentials {
  return {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

export async function loadSupabaseCredentials(): Promise<SupabaseCredentials> {
  const [storedUrl, storedAnonKey] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEY_URL),
    AsyncStorage.getItem(STORAGE_KEY_ANON_KEY),
  ]);

  const defaults = getDefaultSupabaseCredentials();

  return {
    url: storedUrl || defaults.url,
    anonKey: storedAnonKey || defaults.anonKey,
  };
}

export async function saveSupabaseCredentials(credentials: SupabaseCredentials): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEY_URL, credentials.url),
    AsyncStorage.setItem(STORAGE_KEY_ANON_KEY, credentials.anonKey),
  ]);
}

export async function clearSupabaseCredentials(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEY_URL),
    AsyncStorage.removeItem(STORAGE_KEY_ANON_KEY),
  ]);
}
