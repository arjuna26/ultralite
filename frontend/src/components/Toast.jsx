import { useEffect } from 'react';

export default function Toast({ message, onDismiss, duration = 5000 }) {
  useEffect(() => {
    if (!message || !duration) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-lg shadow-lg animate-fade-in flex items-center gap-3 max-w-md"
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-neutral-200)',
        color: 'var(--color-neutral-800)',
      }}
    >
      <span className="text-sm flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="btn btn-ghost btn-sm p-1"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}