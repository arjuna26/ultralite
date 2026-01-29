import { useState, useEffect, useRef } from 'react';
import { getGear, getUserOwnedGear, toggleGearOwnership } from '../api/client';
import GearCard from '../components/GearCard';
import GearDetailModal from '../components/GearDetailModal';

const categories = [
  { value: '', label: 'All' },
  { value: 'backpack', label: 'Backpacks' },
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

export default function GearCatalog() {
  const [gear, setGear] = useState([]);
  const [ownedGearIds, setOwnedGearIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const searchInputRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  // Load owned gear on mount
  useEffect(() => {
    loadOwnedGear();
  }, []);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  // Reload gear when search, category, or page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadGear();
    }, search ? 300 : 0); // Debounce search, but load immediately on page/category change
    return () => clearTimeout(timer);
  }, [search, category, currentPage]);

  const loadGear = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const params = { 
        limit: String(ITEMS_PER_PAGE), // Ensure it's always sent
        offset: String(offset) // Ensure it's always sent, even if 0
      };
      
      if (search) {
        params.search = search;
      }
      
      if (category) {
        params.category = category;
      }
      
      const response = await getGear(params);
      
      const newItems = response.data.items || response.data;
      const totalCount = response.data.total || newItems.length;
      
      setGear(newItems);
      setTotal(totalCount);
    } catch (error) {
      console.error('Failed to load gear:', error);
      setGear([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadOwnedGear = async () => {
    try {
      const response = await getUserOwnedGear();
      const ids = new Set(response.data.map(item => item.gear_item_id));
      setOwnedGearIds(ids);
    } catch (error) {
      console.error('Failed to load owned gear:', error);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const startItem = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, total);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleToggleOwned = async (gearItemId) => {
    setOwnershipLoading(true);
    try {
      const response = await toggleGearOwnership(gearItemId);
      if (response.data.owned) {
        setOwnedGearIds(prev => new Set([...prev, gearItemId]));
      } else {
        setOwnedGearIds(prev => {
          const next = new Set(prev);
          next.delete(gearItemId);
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to toggle ownership:', error);
    } finally {
      setOwnershipLoading(false);
    }
  };

  const formatCategory = (cat) => {
    return cat?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  };

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading text-2xl md:text-3xl mb-1">Gear Catalog</h1>
          <p className="text-caption">
            {total === 0 
              ? 'Loading gear...' 
              : `${total.toLocaleString()} item${total !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {/* View Toggle */}
        <div 
          className="flex items-center rounded-lg p-1"
          style={{ backgroundColor: 'var(--color-neutral-100)' }}
        >
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'cards' ? '' : ''
            }`}
            style={viewMode === 'cards' 
              ? { backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-neutral-900)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
              : { color: 'var(--color-neutral-600)' }
            }
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cards
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table' ? '' : ''
            }`}
            style={viewMode === 'table' 
              ? { backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-neutral-900)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
              : { color: 'var(--color-neutral-600)' }
            }
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Table
            </span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
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
              placeholder="Search by brand or model..."
              className="input w-full"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className="px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  backgroundColor: category === cat.value ? 'var(--color-primary-500)' : 'var(--color-neutral-100)',
                  color: category === cat.value ? 'white' : 'var(--color-neutral-700)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && gear.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8" style={{ color: 'var(--color-primary-500)' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Loading gear...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && gear.length === 0 && (
        <div className="card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" 
               style={{ backgroundColor: 'var(--color-neutral-100)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-heading text-xl mb-2">No gear found</h2>
          <p className="text-body max-w-sm mx-auto">
            Try adjusting your search or category filter to find what you're looking for.
          </p>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'cards' && gear.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {gear.map((item, index) => (
            <div 
              key={item.id} 
              className="stagger-item" 
              style={{ animationDelay: `${(index % ITEMS_PER_PAGE) * 30}ms` }}
            >
              <GearCard 
                item={item} 
                onClick={handleCardClick}
                isOwned={ownedGearIds.has(item.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && gear.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-neutral-50)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-neutral-500)' }}>
                    Gear
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--color-neutral-500)' }}>
                    Category
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-neutral-500)' }}>
                    Weight
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-neutral-500)' }}>
                    Owned
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-neutral-500)' }}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {gear.map((item, index) => (
                  <tr 
                    key={item.id}
                    className="border-t transition-colors hover:bg-primary-50"
                    style={{ borderColor: 'var(--color-neutral-100)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt=""
                            className="w-10 h-10 rounded-lg object-contain"
                            style={{ backgroundColor: 'var(--color-neutral-100)' }}
                          />
                        ) : (
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-secondary-100)', color: 'var(--color-secondary-600)' }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-sm" style={{ color: 'var(--color-neutral-900)' }}>
                            {item.brand} {item.model}
                          </div>
                          <div className="text-xs md:hidden" style={{ color: 'var(--color-neutral-500)' }}>
                            {formatCategory(item.category)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge badge-neutral text-xs">
                        {formatCategory(item.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-sm" style={{ color: 'var(--color-primary-600)' }}>
                        {item.weight_grams}g
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {ownedGearIds.has(item.id) && (
                        <span 
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                          style={{ backgroundColor: 'var(--color-success-100)', color: 'var(--color-success-600)' }}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleCardClick(item)}
                        className="btn btn-ghost btn-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && gear.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-neutral-200)' }}>
          {/* Results Info */}
          <div className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
            Showing {startItem.toLocaleString()} - {endItem.toLocaleString()} of {total.toLocaleString()} items
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentPage === 1 ? 'var(--color-neutral-100)' : 'var(--color-surface-elevated)',
                color: currentPage === 1 ? 'var(--color-neutral-400)' : 'var(--color-neutral-700)',
                border: '1px solid var(--color-neutral-200)'
              }}
            >
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[2.5rem] disabled:opacity-50"
                    style={{
                      backgroundColor: currentPage === pageNum 
                        ? 'var(--color-primary-500)' 
                        : 'var(--color-surface-elevated)',
                      color: currentPage === pageNum 
                        ? 'white' 
                        : 'var(--color-neutral-700)',
                      border: currentPage === pageNum 
                        ? '1px solid var(--color-primary-500)' 
                        : '1px solid var(--color-neutral-200)'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentPage === totalPages ? 'var(--color-neutral-100)' : 'var(--color-surface-elevated)',
                color: currentPage === totalPages ? 'var(--color-neutral-400)' : 'var(--color-neutral-700)',
                border: '1px solid var(--color-neutral-200)'
              }}
            >
              <span className="flex items-center gap-1">
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Results Count (when no pagination needed) */}
      {!loading && gear.length > 0 && totalPages <= 1 && (
        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
            Showing {total.toLocaleString()} item{total !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <GearDetailModal
        item={selectedItem}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isOwned={selectedItem ? ownedGearIds.has(selectedItem.id) : false}
        onToggleOwned={handleToggleOwned}
        ownershipLoading={ownershipLoading}
      />
    </div>
  );
}
