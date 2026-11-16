import React from 'react';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<Props> = ({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) => (
  <Modal open={open} onClose={onCancel} title={title}>
    <p className="text-sm text-gray-600 mb-5">{message}</p>
    <div className="flex gap-2 justify-end">
      <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition">
        Cancel
      </button>
      <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition">
        {confirmLabel}
      </button>
    </div>
  </Modal>
);
