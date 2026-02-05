import { useState } from 'react';
import { useImageBackgroundColor } from '../hooks/useImageBackgroundColor';

// Category icon mapping (reused from GearSearchModal)
const getCategoryIcon = (category) => {
  const icons = {
    tent: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l9-15 9 15H3z" />
      </svg>
    ),
    sleeping_bag: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    sleeping_pad: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    stove: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
    backpack: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    cookware: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    clothing: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    footwear: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    default: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  };
  return icons[category] || icons.default;
};

export default function GearCard({ item, onClick, isOwned }) {
  const [imageError, setImageError] = useState(false);
  const imageBackgroundColor = useImageBackgroundColor(item.image_url);

  const formatCategory = (category) => {
    return category?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  };

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="card card-hover p-3 text-left w-full transition-all group relative"
      style={{ 
        cursor: 'pointer',
        backgroundColor: 'var(--color-surface-elevated)',
      }}
    >
      {/* Owned Badge */}
      {isOwned && (
        <div 
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--color-success-100)', 
            color: 'var(--color-success-700)' 
          }}
        >
          Owned
        </div>
      )}

      {/* Image or Placeholder */}
      <div 
        className="h-32 rounded-lg mb-3 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: imageBackgroundColor }}
      >
        {item.image_url && !imageError ? (
          <img 
            src={item.image_url} 
            alt={`${item.brand} ${item.model}`}
            className="h-full w-full object-contain p-1"
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-secondary-100)', color: 'var(--color-secondary-600)' }}
          >
            {getCategoryIcon(item.category)}
          </div>
        )}
      </div>

      {/* Brand & Model */}
      <h3 
        className="font-medium text-sm truncate mb-1"
        style={{ color: 'var(--color-neutral-900)' }}
      >
        {item.brand} {item.model}
      </h3>

      {/* Category Badge & Weight */}
      <div className="flex items-center justify-between gap-2">
        <span 
          className="badge badge-neutral text-xs"
        >
          {formatCategory(item.category)}
        </span>
        <span 
          className="text-sm font-semibold"
          style={{ color: 'var(--color-primary-600)' }}
        >
          {item.weight_grams}g
        </span>
      </div>
    </button>
  );
}
