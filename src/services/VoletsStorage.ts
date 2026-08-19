import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_VOLETS = 'volets_store_ids';

export async function getStoredVoletIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_VOLETS);
  return raw ? JSON.parse(raw) : [];
}

export async function persistVoletIds(storeIds: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_VOLETS, JSON.stringify(storeIds));
}
