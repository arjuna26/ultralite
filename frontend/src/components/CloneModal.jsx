import { useEffect, useState } from 'react';

export default function CloneModal({
  isOpen,
  title,
  message,
  inputLabel = 'Name',
  inputDefault = '',
  submitLabel = 'Submit',
  onSubmit,
  onCancel,
}) {
  const [value, setValue] = useState(inputDefault);

  useEffect(() => {
    if (isOpen) setValue(inputDefault);
  }, [isOpen, inputDefault]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onCancel?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value?.trim();
    if (trimmed !== undefined && trimmed !== '') onSubmit?.(trimmed);
  };

  if (!isOpen) return null;

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
        {message && <p className="text-body text-sm mb-4" style={{ color: 'var(--color-neutral-600)' }}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <label className="label">{inputLabel}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input mt-1 mb-6"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onCancel} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}