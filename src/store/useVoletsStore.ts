import { create } from 'zustand';
import { StoreStatus, StoreStatusValue } from '../models/Volet';
import { VoletsRepository } from '../services/VoletsRepository';
import { StoreStatusRepository } from '../services/StoreStatusRepository';

interface VoletsState {
  storeIds: string[];
  statuses: Record<string, StoreStatus>;
  isLoading: boolean;
  statusError: string | null;
  loadVolets: () => Promise<void>;
  addVolet: (storeId: string) => Promise<void>;
  removeVolet: (storeId: string) => Promise<void>;
  sendCommand: (storeId: string, status: StoreStatusValue) => Promise<void>;
}

export const useVoletsStore = create<VoletsState>((set, get) => ({
  storeIds: [],
  statuses: {},
  isLoading: false,
  statusError: null,

  loadVolets: async () => {
    set({ isLoading: true, statusError: null });
    let storeIds: string[];
    try {
      storeIds = await VoletsRepository.getAll();
      set({ storeIds });
    } catch (error: any) {
      set({ statusError: error.message || 'Impossible de charger les volets.', isLoading: false });
      return;
    }

    try {
      const statuses = await StoreStatusRepository.getLatestStatuses(storeIds);
      set({ statuses, isLoading: false });
    } catch (error: any) {
      set({ statusError: error.message || 'Statut distant indisponible.', isLoading: false });
    }
  },

  addVolet: async (storeId: string) => {
    const trimmed = storeId.trim();
    if (!trimmed || get().storeIds.includes(trimmed)) {
      return;
    }
    await VoletsRepository.create(trimmed);
    set({ storeIds: [...get().storeIds, trimmed] });
  },

  removeVolet: async (storeId: string) => {
    await VoletsRepository.remove(storeId);
    const statuses = { ...get().statuses };
    delete statuses[storeId];
    set({ storeIds: get().storeIds.filter((id) => id !== storeId), statuses });
  },

  sendCommand: async (storeId: string, status: StoreStatusValue) => {
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
  },
}));
