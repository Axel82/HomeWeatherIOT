import { create } from 'zustand';
import { WeatherData } from '../models/WeatherData';
import { WeatherRepository } from '../services/WeatherRepository';

interface WeatherState {
  data: WeatherData[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  data: [],
  isLoading: false,
  error: null,
  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await WeatherRepository.getRecentWeatherData(50);
      set({ data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Une erreur est survenue.', isLoading: false });
    }
  },
}));
