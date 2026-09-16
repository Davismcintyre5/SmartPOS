import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}