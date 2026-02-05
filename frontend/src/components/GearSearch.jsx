import { useState, useEffect } from 'react';
import { getGear } from '../api/client';

const categories = [
  { value: '', label: 'All categories' },
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
    default: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  };
  return icons[category] || icons.default;
};

export default function GearSearch({ onSelect }) {
  const [gear, setGear] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGear();
  }, [search, category]);

  const loadGear = async () => {
    setLoading(true);
    try {
      const response = await getGear({ search, category });
      setGear(response.data);
    } catch (error) {
      console.error('Failed to load gear:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-heading text-lg">Add Gear</h2>
        <span className="badge badge-neutral">{gear.length} items</span>
      </div>
      
      {/* Search & Filter */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: 'var(--color-neutral-400)' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gear by name or brand..."
            className="input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gear List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-6 h-6" style={{ color: 'var(--color-primary-500)' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Searching gear...</span>
          </div>
        </div>
      ) : gear.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" 
               style={{ backgroundColor: '#fff' }}>
            <svg className="w-6 h-6" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-caption">No gear found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-400)' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {gear.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="w-full text-left p-3 rounded-lg border transition-all group"
              style={{ 
                borderColor: 'var(--color-neutral-200)',
                backgroundColor: 'var(--color-surface-elevated)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)';
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
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
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ color: 'var(--color-primary-500)' }}
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
        </div>
      )}
      
      {/* Help text */}
      {gear.length > 0 && (
        <p className="text-xs text-center mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-neutral-100)', color: 'var(--color-neutral-400)' }}>
          Click on an item to add it to your bag
        </p>
      )}
    </div>
  );
}
