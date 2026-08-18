import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getDefaultSupabaseCredentials, loadSupabaseCredentials, SupabaseCredentials } from './supabaseConfig';

let client: SupabaseClient = createClient(
  getDefaultSupabaseCredentials().url,
  getDefaultSupabaseCredentials().anonKey
);

export function getSupabaseClient(): SupabaseClient {
  return client;
}

export function configureSupabaseClient(credentials: SupabaseCredentials): void {
  client = createClient(credentials.url, credentials.anonKey);
}

export async function initSupabaseClient(): Promise<void> {
  const credentials = await loadSupabaseCredentials();
  configureSupabaseClient(credentials);
}
