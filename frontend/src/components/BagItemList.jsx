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

// Group items by category for better organization
const groupByCategory = (items) => {
  return items.reduce((groups, item) => {
    const category = item.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});
};

export default function BagItemList({ items, onRemove }) {
  const totalWeight = items.reduce((sum, item) => sum + item.total_item_weight_grams, 0);
  const groupedItems = groupByCategory(items);

  if (items.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-heading text-lg mb-5">Bag Contents</h2>
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" 
               style={{ backgroundColor: 'var(--color-secondary-100)' }}>
            <svg className="w-7 h-7" style={{ color: 'var(--color-secondary-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-caption">No items yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-400)' }}>
            Search and add gear from the panel on the right
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-heading text-lg">Bag Contents</h2>
        <div className="flex items-center gap-3">
          <span className="badge badge-neutral">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-primary-700)' }}>
            {(totalWeight / 1000).toFixed(2)} kg
          </span>
        </div>
      </div>
      
      {/* Items grouped by category */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const categoryWeight = categoryItems.reduce((sum, item) => sum + item.total_item_weight_grams, 0);
          const categoryPercent = totalWeight > 0 ? Math.round((categoryWeight / totalWeight) * 100) : 0;
          
          return (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-secondary-100)', color: 'var(--color-secondary-600)' }}
                  >
                    {getCategoryIcon(category)}
                  </div>
                  <span className="text-sm font-medium capitalize" style={{ color: 'var(--color-neutral-700)' }}>
                    {category.replace('_', ' ')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-neutral-400)' }}>
                    ({categoryItems.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-neutral-500)' }}>
                    {(categoryWeight / 1000).toFixed(2)} kg
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
                    backgroundColor: 'var(--color-neutral-100)', 
                    color: 'var(--color-neutral-600)' 
                  }}>
                    {categoryPercent}%
                  </span>
                </div>
              </div>
              
              {/* Category Items */}
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.gear_item_id}
                    className="flex items-center justify-between p-3 rounded-lg border group"
                    style={{ borderColor: 'var(--color-neutral-200)' }}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="font-medium text-sm truncate" style={{ color: 'var(--color-neutral-900)' }}>
                        {item.brand} {item.model}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-neutral-500)' }}>
                          Qty: {item.quantity} × {item.weight_grams}g each
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                        {item.total_item_weight_grams}g
                      </span>
                      <button
                        onClick={() => onRemove(item.gear_item_id)}
                        className="opacity-50 hover:opacity-100 transition-opacity p-1.5 rounded-md"
                        style={{ color: 'var(--color-error-500)' }}
                        title="Remove from bag"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Weight Summary */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-neutral-200)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--color-neutral-600)' }}>
            Total contents weight
          </span>
          <span className="text-lg font-bold" style={{ color: 'var(--color-primary-700)' }}>
            {(totalWeight / 1000).toFixed(2)} kg
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-400)' }}>
          Backpack weight is calculated separately
        </p>
      </div>
    </div>
  );
}
