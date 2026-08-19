import { create } from 'zustand';
import { StoreStatus, StoreStatusValue } from '../models/Volet';
import { getStoredVoletIds, persistVoletIds } from '../services/VoletsStorage';
import { StoreStatusRepository } from '../services/StoreStatusRepository';

interface VoletsState {
  storeIds: string[];
  statuses: Record<string, StoreStatus>;
  isLoading: boolean;
  error: string | null;
  loadVolets: () => Promise<void>;
  addVolet: (storeId: string) => Promise<void>;
  removeVolet: (storeId: string) => Promise<void>;
  sendCommand: (storeId: string, status: StoreStatusValue) => Promise<void>;
}

export const useVoletsStore = create<VoletsState>((set, get) => ({
  storeIds: [],
  statuses: {},
  isLoading: false,
  error: null,

  loadVolets: async () => {
    set({ isLoading: true, error: null });
    try {
      const storeIds = await getStoredVoletIds();
      const statuses = await StoreStatusRepository.getLatestStatuses(storeIds);
      set({ storeIds, statuses, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Une erreur est survenue.', isLoading: false });
    }
  },

  addVolet: async (storeId: string) => {
    const trimmed = storeId.trim();
    if (!trimmed || get().storeIds.includes(trimmed)) {
      return;
    }
    const storeIds = [...get().storeIds, trimmed];
    await persistVoletIds(storeIds);
    set({ storeIds });
  },

  removeVolet: async (storeId: string) => {
    const storeIds = get().storeIds.filter((id) => id !== storeId);
    await persistVoletIds(storeIds);
    const statuses = { ...get().statuses };
    delete statuses[storeId];
    set({ storeIds, statuses });
  },

  sendCommand: async (storeId: string, status: StoreStatusValue) => {
    try {
      await StoreStatusRepository.sendStatus(storeId, status);
      set({
        statuses: {
          ...get().statuses,
          [storeId]: {
            id: get().statuses[storeId]?.id ?? '',
            store_id: storeId,
            status,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error: any) {
      set({ error: error.message || "Impossible d'envoyer la commande." });
      throw error;
    }
  },
}));
