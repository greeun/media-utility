import { create } from 'zustand';
import { MediaFile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface FileStore {
  files: MediaFile[];
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<MediaFile>) => void;
  clearFiles: () => void;
  setProgress: (id: string, progress: number) => void;
  setResult: (id: string, result: Blob | string) => void;
  setError: (id: string, error: string) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],

  addFiles: (files: File[]) => {
    const newFiles: MediaFile[] = files.map((file) => ({
      id: uuidv4(),
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') || file.type.startsWith('video/')
        ? URL.createObjectURL(file)
        : undefined,
      status: 'pending',
      progress: 0,
    }));

    set((state) => ({
      files: [...state.files, ...newFiles],
    }));
  },

  removeFile: (id: string) => {
    set((state) => {
      const file = state.files.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return {
        files: state.files.filter((f) => f.id !== id),
      };
    });
  },

  updateFile: (id: string, updates: Partial<MediaFile>) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));
  },

  clearFiles: () => {
    set((state) => {
      state.files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      return { files: [] };
    });
  },

  setProgress: (id: string, progress: number) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, progress, status: 'processing' } : f
      ),
    }));
  },

  setResult: (id: string, result: Blob | string) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, result, status: 'completed', progress: 100 } : f
      ),
    }));
  },

  setError: (id: string, error: string) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, error, status: 'error' } : f
      ),
    }));
  },
}));
