import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClientData {
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
}

export interface ItemData {
  _localId: string; // uuid for local list mapping
  itemId: number | null; // db item id
  code: string;
  name: string;
  quantity: number;
  price: number;
}

export interface WizardState {
  step: number;
  clientData: ClientData;
  items: ItemData[];
  setStep: (step: number) => void;
  setClientData: (data: Partial<ClientData>) => void;
  addItem: (item: ItemData) => void;
  updateItem: (id: string, updates: Partial<ItemData>) => void;
  removeItem: (id: string) => void;
  resetForm: () => void;
}

const initialState = {
  step: 1,
  clientData: {
    senderName: '',
    senderAddress: '',
    receiverName: '',
    receiverAddress: '',
  },
  items: [],
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setClientData: (data) =>
        set((state) => ({
          clientData: { ...state.clientData, ...data },
        })),
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((it) => (it._localId === id ? { ...it, ...updates } : it)),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((it) => it._localId !== id),
        })),
      resetForm: () => set(initialState),
    }),
    {
      name: 'invoice-wizard-storage',
    }
  )
);
