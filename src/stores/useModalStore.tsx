import {create} from 'zustand';

export type ModalStateType = {
  visible: boolean;
};

type ModalActions = {
  setVisible: (visible: boolean) => void;
};

type ModalStore = ModalStateType & ModalActions;

export const useModalStore = create<ModalStore>((set) => ({
  visible: false,
  setVisible: (visible: boolean) => set({visible}),
}));
