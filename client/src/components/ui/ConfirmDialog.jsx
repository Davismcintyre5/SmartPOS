// components/ui/ConfirmDialog.jsx
import { Modal } from "./Modal";
import { Button } from "./Button";

export const ConfirmDialog = ({ open, onClose, onConfirm, title = "Confirm", message, loading }) => {
  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Confirm</Button>
      </div>
    </Modal>
  );
};