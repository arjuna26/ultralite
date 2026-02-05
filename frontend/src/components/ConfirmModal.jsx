import { useEffect } from 'react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'primary', // 'danger' | 'primary'
  onConfirm,
  onCancel,
}) {  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onCancel?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmClass = variant === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-surface-overlay)' }}
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-heading text-lg mb-2">{title}</h3>
        {message && <p className="text-body text-sm mb-6" style={{ color: 'var(--color-neutral-600)' }}>{message}</p>}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={confirmClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}