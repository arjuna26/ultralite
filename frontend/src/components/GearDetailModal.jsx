import { useState, useEffect } from 'react';
import { useImageBackgroundColor } from '../hooks/useImageBackgroundColor';

// Category icon mapping
const getCategoryIcon = (category) => {
  const icons = {
    tent: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l9-15 9 15H3z" />
      </svg>
    ),
    sleeping_bag: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    sleeping_pad: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    stove: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
    backpack: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    cookware: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    clothing: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    footwear: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    default: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  };
  return icons[category] || icons.default;
};

export default function GearDetailModal({ item, isOpen, onClose, isOwned, onToggleOwned, ownershipLoading }) {
  const [imageError, setImageError] = useState(false);
  const imageBackgroundColor = useImageBackgroundColor(item?.image_url);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset image error when item changes
  useEffect(() => {
    setImageError(false);
  }, [item?.id]);

  if (!isOpen || !item) return null;

  const formatCategory = (category) => {
    return category?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  };

  const formatWeightSource = (source) => {
    const sources = {
      manufacturer: 'Manufacturer',
      community: 'Community',
      estimated: 'Estimated'
    };
    return sources[source] || source || 'Unknown';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="w-full max-w-lg animate-fade-in rounded-xl shadow-2xl overflow-hidden"
        style={{ 
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-neutral-200)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--color-neutral-200)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-secondary-100)', color: 'var(--color-secondary-600)' }}
            >
              {getCategoryIcon(item.category)}
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--color-neutral-900)' }}>
                {item.brand} {item.model}
              </h2>
              <span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
                {formatCategory(item.category)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-neutral-100"
            style={{ color: 'var(--color-neutral-500)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Image */}
          <div 
            className="w-full aspect-video rounded-lg mb-4 flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: imageBackgroundColor }}
          >
            {item.image_url && !imageError ? (
              <img 
                src={item.image_url} 
                alt={`${item.brand} ${item.model}`}
                className="w-full h-full object-contain p-4"
                onError={() => setImageError(true)}
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-secondary-100)', color: 'var(--color-secondary-600)' }}
              >
                {getCategoryIcon(item.category)}
              </div>
            )}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Weight */}
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-primary-50)' }}
            >
              <div className="text-xs mb-1" style={{ color: 'var(--color-primary-600)' }}>Weight</div>
              <div className="font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                {item.weight_grams}g
                <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-neutral-500)' }}>
                  ({(item.weight_grams / 28.35).toFixed(1)} oz)
                </span>
              </div>
            </div>

            {/* Weight Source */}
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-neutral-50)' }}
            >
              <div className="text-xs mb-1" style={{ color: 'var(--color-neutral-500)' }}>Weight Source</div>
              <div className="font-medium" style={{ color: 'var(--color-neutral-700)' }}>
                {formatWeightSource(item.weight_source)}
              </div>
            </div>

            {/* Capacity (if available) */}
            {item.capacity && (
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-neutral-50)' }}
              >
                <div className="text-xs mb-1" style={{ color: 'var(--color-neutral-500)' }}>Capacity</div>
                <div className="font-medium" style={{ color: 'var(--color-neutral-700)' }}>
                  {item.capacity}
                </div>
              </div>
            )}

            {/* Season Rating (if available) */}
            {item.season_rating && (
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-neutral-50)' }}
              >
                <div className="text-xs mb-1" style={{ color: 'var(--color-neutral-500)' }}>Season Rating</div>
                <div className="font-medium" style={{ color: 'var(--color-neutral-700)' }}>
                  {item.season_rating}
                </div>
              </div>
            )}
          </div>

          {/* Materials (if available) */}
          {item.materials && (
            <div 
              className="p-3 rounded-lg mb-4"
              style={{ backgroundColor: 'var(--color-neutral-50)' }}
            >
              <div className="text-xs mb-1" style={{ color: 'var(--color-neutral-500)' }}>Materials</div>
              <div className="text-sm" style={{ color: 'var(--color-neutral-700)' }}>
                {item.materials}
              </div>
            </div>
          )}

          {/* Data Source */}
          {item.source && (
            <div className="text-xs mb-4" style={{ color: 'var(--color-neutral-400)' }}>
              Data source: {item.source}
              {item.source_url && (
                <a 
                  href={item.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:no-underline"
                  style={{ color: 'var(--color-primary-600)' }}
                >
                  View source →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer with Owned Toggle */}
        <div 
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: 'var(--color-neutral-200)', backgroundColor: 'var(--color-neutral-50)' }}
        >
          {/* Owned Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isOwned}
                onChange={() => onToggleOwned(item.id)}
                disabled={ownershipLoading}
                className="sr-only"
              />
              <div 
                className={`w-11 h-6 rounded-full transition-colors ${ownershipLoading ? 'opacity-50' : ''}`}
                style={{ 
                  backgroundColor: isOwned ? 'var(--color-success-500)' : 'var(--color-neutral-300)'
                }}
              >
                <div 
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    isOwned ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </div>
            <span 
              className="text-sm font-medium"
              style={{ color: isOwned ? 'var(--color-success-700)' : 'var(--color-neutral-600)' }}
            >
              {ownershipLoading ? 'Saving...' : (isOwned ? 'I own this' : 'Mark as owned')}
            </span>
          </label>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
