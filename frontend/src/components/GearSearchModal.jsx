import { useState, useEffect, useRef } from 'react';
import { getGear } from '../api/client';

const categories = [
  { value: 'tent', label: 'Tents' },
  { value: 'sleeping_bag', label: 'Sleeping Bags' },
  { value: 'sleeping_pad', label: 'Sleeping Pads' },
  { value: 'stove', label: 'Stoves' },
  { value: 'cookware', label: 'Cookware' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

// Category icon mapping
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
    stove: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
    sleeping_pad: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    cookware: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

export default function GearSearchModal({ isOpen, onClose, onSelect }) {
  const [gear, setGear] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const searchInputRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (isOpen) {
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Reset search when modal closes
      setSearch('');
      setCategory('');
      setGear([]);
      setHasMore(false);
      setTotal(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (search || category)) {
      // Only load gear if there's a search term or category selected
      loadGear(true);
    } else if (isOpen) {
      // Clear results if search and category are empty
      setGear([]);
      setHasMore(false);
      setTotal(0);
    }
  }, [search, category, isOpen]);

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

  const loadGear = async (reset = false) => {
    setLoading(true);
    try {
      const offset = reset ? 0 : gear.length;
      const response = await getGear({ 
        search, 
        category, 
        limit: ITEMS_PER_PAGE,
        offset 
      });
      
      const newItems = response.data.items || response.data;
      const totalCount = response.data.total || newItems.length;
      
      if (reset) {
        setGear(newItems);
      } else {
        setGear(prev => [...prev, ...newItems]);
      }
      
      setTotal(totalCount);
      setHasMore(offset + newItems.length < totalCount);
    } catch (error) {
      console.error('Failed to load gear:', error);
      setGear([]);
      setHasMore(false);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = () => {
    if (!loading && hasMore) {
      loadGear(false);
    }
  };

  const handleSelect = (item) => {
    onSelect(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="w-full max-w-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Container */}
        <div 
          className="rounded-xl shadow-2xl overflow-hidden"
          style={{ 
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-neutral-200)'
          }}
        >
          {/* Search Bar */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--color-neutral-200)' }}>
            <div className="relative">
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
                style={{ color: 'var(--color-neutral-400)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gear..."
                className="w-full py-3 pl-12 pr-4 text-lg rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ 
                  backgroundColor: 'var(--color-surface-elevated)',
                  color: 'var(--color-neutral-900)'
                }}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="px-4 py-3 border-b flex items-center gap-2 overflow-x-auto" style={{ borderColor: 'var(--color-neutral-200)' }}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className="px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all"
                style={{
                  backgroundColor: category === cat.value ? 'var(--color-primary-500)' : 'var(--color-neutral-100)',
                  color: category === cat.value ? 'white' : 'var(--color-neutral-700)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-[50vh] overflow-y-auto">
            {!search && !category ? (
              <div className="text-center py-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" 
                     style={{ backgroundColor: 'var(--color-neutral-100)' }}>
                  <svg className="w-6 h-6" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-caption">Start typing to search</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-400)' }}>Or select a category to browse</p>
              </div>
            ) : loading && gear.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin w-6 h-6" style={{ color: 'var(--color-primary-500)' }} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Searching...</span>
                </div>
              </div>
            ) : gear.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" 
                     style={{ backgroundColor: 'var(--color-neutral-100)' }}>
                  <svg className="w-6 h-6" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-caption">No gear found</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-400)' }}>Try adjusting your search</p>
              </div>
            ) : (
              <div>
                {gear.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-3 border-b transition-colors hover:bg-primary-50"
                    style={{ 
                      borderColor: 'var(--color-neutral-100)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-secondary-100)', color: 'var(--color-secondary-600)' }}
                        >
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate" style={{ color: 'var(--color-neutral-900)' }}>
                            {item.brand} {item.model}
                          </div>
                          <div className="text-xs capitalize mt-0.5" style={{ color: 'var(--color-neutral-500)' }}>
                            {item.category.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                          {item.weight_grams}g
                        </span>
                        <svg 
                          className="w-4 h-4" 
                          style={{ color: 'var(--color-neutral-400)' }}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-neutral-100)' }}>
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loading}
                      className="w-full btn btn-outline btn-sm"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        `Load More (${gear.length} of ${total})`
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Cancel Button */}
          <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-neutral-200)', backgroundColor: 'var(--color-neutral-50)' }}>
            <div className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>
              {gear.length > 0 ? `Showing ${gear.length}${total > gear.length ? ` of ${total}` : ''} item${gear.length !== 1 ? 's' : ''}` : ''}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
