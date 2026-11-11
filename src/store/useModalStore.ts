import { create } from 'zustand';

export type ModalVariant = 'primary' | 'danger' | 'info' | 'warning';

export interface ModalConfig {
  mode: 'alert' | 'confirm';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ModalVariant;
  onConfirm?: () => void | Promise<void>;
}

interface ModalState {
  isOpen: boolean;
  isBusy: boolean;
  config: ModalConfig | null;
  errorMessage: string | null;
  showAlert: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: ModalVariant;
  }) => void;
  showConfirm: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ModalVariant;
    onConfirm: () => void | Promise<void>;
  }) => void;
  setBusy: (busy: boolean) => void;
  setError: (err: string | null) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  isBusy: false,
  config: null,
  errorMessage: null,

  showAlert: (options) =>
    set({
      isOpen: true,
      isBusy: false,
      errorMessage: null,
      config: {
        mode: 'alert',
        confirmLabel: options.confirmLabel || 'OK',
        variant: options.variant || 'info',
        ...options,
      },
    }),

  showConfirm: (options) =>
    set({
      isOpen: true,
      isBusy: false,
      errorMessage: null,
      config: {
        mode: 'confirm',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        variant: options.variant || 'primary',
        ...options,
      },
    }),

  setBusy: (isBusy) => set({ isBusy }),
  setError: (errorMessage) => set({ errorMessage }),
  closeModal: () =>
    set({
      isOpen: false,
      isBusy: false,
      errorMessage: null,
      config: null,
    }),
}));

