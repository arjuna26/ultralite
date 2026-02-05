import { useState, useEffect, useRef } from 'react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toLocalDate(isoStr) {
  if (!isoStr) return null;
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(isoStr) {
  const d = toLocalDate(isoStr);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DatePicker({
  value = '',           // YYYY-MM-DD
  onChange,
  min = null,          // YYYY-MM-DD or null
  max = null,
  placeholder = 'Select date',
  label,
  id,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => toLocalDate(value) || new Date());
  const containerRef = useRef(null);

  const valueDate = toLocalDate(value);
  const minDate = min ? toLocalDate(min) : null;
  const maxDate = max ? toLocalDate(max) : null;

  // Keep view month in sync when value changes
  useEffect(() => {
    if (value) setViewDate(toLocalDate(value) || new Date());
  }, [value]);

  // Outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  const isDisabled = (d) => {
    if (!d) return true;
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  const isSelected = (d) => valueDate && d && toISO(d) === value;

  const handleSelect = (d) => {
    if (!d || isDisabled(d)) return;
    onChange?.(toISO(d));
    setOpen(false);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label className="label" htmlFor={id}>{label}</label>}
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="input w-full text-left flex items-center justify-between"
        style={{ cursor: 'pointer' }}
      >
        <span style={value ? { color: 'var(--color-neutral-900)' } : { color: 'var(--color-neutral-400)' }}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <svg className="w-4 h-4" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 p-4 rounded-xl shadow-lg border animate-fade-in"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-neutral-200)',
            minWidth: '280px',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="btn btn-ghost btn-sm p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium" style={{ color: 'var(--color-neutral-800)' }}>
              {MONTHS[month]} {year}
            </span>
            <button type="button" onClick={nextMonth} className="btn btn-ghost btn-sm p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center text-xs font-medium py-1" style={{ color: 'var(--color-neutral-500)' }}>
                {wd}
              </div>
            ))}
            {days.map((d, i) => (
              <button
                key={d ? d.getTime() : i}
                type="button"
                disabled={isDisabled(d)}
                onClick={() => handleSelect(d)}
                className="aspect-square rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: isSelected(d) ? 'var(--color-primary-500)' : 'transparent',
                  color: isSelected(d) ? 'white' : isDisabled(d) ? 'var(--color-neutral-400)' : 'var(--color-neutral-800)',
                }}
                onMouseOver={(e) => {
                  if (!d || isDisabled(d) || isSelected(d)) return;
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-100)';
                }}
                onMouseOut={(e) => {
                  if (!isSelected(d)) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {d ? d.getDate() : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}