import { create } from 'zustand';
import { Camera, CameraCreateInput, CameraUpdateInput } from '../models/Camera';
import { CamerasRepository } from '../services/CamerasRepository';

interface CamerasState {
  cameras: Camera[];
  isLoading: boolean;
  error: string | null;
  selectedCamera: Camera | null;
  loadCameras: () => Promise<void>;
  addCamera: (input: CameraCreateInput) => Promise<void>;
  updateCamera: (id: string, input: CameraUpdateInput) => Promise<void>;
  removeCamera: (id: string) => Promise<void>;
  setSelectedCamera: (camera: Camera | null) => void;
}

export const useCamerasStore = create<CamerasState>((set, get) => ({
  cameras: [],
  isLoading: false,
  error: null,
  selectedCamera: null,

  loadCameras: async () => {
    set({ isLoading: true, error: null });
    try {
      const cameras = await CamerasRepository.getAll();
      set({ cameras, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Impossible de charger les caméras.', isLoading: false });
    }
  },

  addCamera: async (input: CameraCreateInput) => {
    set({ isLoading: true, error: null });
    try {
      const newCamera = await CamerasRepository.create(input);
      set({ cameras: [...get().cameras, newCamera], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateCamera: async (id: string, input: CameraUpdateInput) => {
    set({ isLoading: true, error: null });
    try {
      await CamerasRepository.update(id, input);
      set({
        cameras: get().cameras.map((c) => (c.id === id ? { ...c, ...input } : c)),
        selectedCamera: get().selectedCamera?.id === id ? { ...get().selectedCamera!, ...input } : get().selectedCamera,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  removeCamera: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await CamerasRepository.remove(id);
      set({
        cameras: get().cameras.filter((c) => c.id !== id),
        selectedCamera: get().selectedCamera?.id === id ? null : get().selectedCamera,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  setSelectedCamera: (camera: Camera | null) => {
    set({ selectedCamera: camera });
  },
}));
