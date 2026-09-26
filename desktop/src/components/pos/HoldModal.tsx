import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

export interface HoldModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (label: string, note: string) => void;
  saving: boolean;
  defaultLabel?: string;
}

export function HoldModal({
  open,
  onClose,
  onConfirm,
  saving,
  defaultLabel,
}: HoldModalProps) {
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setLabel(defaultLabel || '');
      setNote('');
    }
  }, [open, defaultLabel]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hold sale"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(label, note)} loading={saving}>
            Hold sale
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <FormField
          label="Label"
          htmlFor="hold-label"
          hint="Optional — helps identify it later (e.g. Table 4, Jane's order)"
        >
          <Input
            id="hold-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Table 4"
            autoFocus
          />
        </FormField>

        <FormField label="Note" htmlFor="hold-note">
          <Input
            id="hold-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </FormField>
      </div>
    </Modal>
  );
}