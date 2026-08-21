import { create } from 'zustand';
import { AirConditionnerCommand, AirConditionnerState } from '../models/AirConditionner';
import { AirConditionnerRepository } from '../services/AirConditionnerRepository';

interface ClimatisationState {
  state: AirConditionnerState | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  loadState: () => Promise<void>;
  sendCommand: (command: AirConditionnerCommand) => Promise<void>;
}

export const useClimatisationStore = create<ClimatisationState>((set, get) => ({
  state: null,
  isLoading: false,
  isSending: false,
  error: null,

  loadState: async () => {
    set({ isLoading: true, error: null });
    try {
      const state = await AirConditionnerRepository.getState();
      set({ state, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Impossible de charger l'état de la climatisation.", isLoading: false });
    }
  },

  sendCommand: async (command: AirConditionnerCommand) => {
    set({ isSending: true, error: null });
    try {
      const state = await AirConditionnerRepository.sendCommand(command, get().state?.id);
      set({ state, isSending: false });
    } catch (error: any) {
      set({ error: error.message || "Impossible d'envoyer la commande de climatisation.", isSending: false });
      throw error;
    }
  },
}));
