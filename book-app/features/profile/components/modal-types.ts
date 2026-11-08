



export interface ModalProps {
  onClose: () => void;
}


export interface ConfirmActionModalProps extends ModalProps {
  onConfirm: () => void | Promise<void>;
}
