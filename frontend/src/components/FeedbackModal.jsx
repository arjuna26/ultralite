import { useState, useEffect } from 'react';
import { submitFeedback } from '../api/client';

export default function FeedbackModal({ isOpen, onClose }) {
  const [feedbackType, setFeedbackType] = useState('feature');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFeedbackType('feature');
      setMessage('');
      setEmail('');
      setSubmitting(false);
      setSubmitted(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please share at least a few words of feedback.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitFeedback({
        feedback_type: feedbackType,
        message: message.trim(),
        email: email.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-surface-overlay)' }}
      onClick={handleClose}
    >
      <div
        className="card max-w-lg w-full mx-4 relative px-6 py-6 md:px-8 md:py-7"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-heading text-xl mb-1">
                  Help shape UltraLite
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-neutral-600)' }}>
                  Tell me which features you’d love to see next, or share any gear you’d like in the catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="feedbackType" className="label">
                  What are you sharing?
                </label>
                <select
                  id="feedbackType"
                  className="input"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                >
                  <option value="feature">Feature idea</option>
                  <option value="gear">Gear to add to catalog</option>
                  <option value="other">Other feedback</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="label">
                  Feedback
                </label>
                <textarea
                  id="message"
                  className="input"
                  rows={4}
                  placeholder="Be as specific as you’d like — workflows you care about, brands/models to support, etc."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email (optional)
                  <span className="text-xs font-normal ml-2" style={{ color: 'var(--color-neutral-500)' }}>
                    Only if you’d like a follow-up
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-error-50)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-error-600)' }}>
                    {error}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-ghost btn-sm"
                  disabled={submitting}
                >
                  Not now
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center px-4 py-6">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-heading text-xl mb-2">Thanks for the insight</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-neutral-600)' }}>
              I really appreciate you taking the time to share. Your feedback directly shapes what I build next.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

