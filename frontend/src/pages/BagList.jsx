import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBags, deleteBag, duplicateBag, createCustomGear } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import CloneModal from '../components/CloneModal';
import Toast from '../components/Toast';

const gearCategories = [
  { value: 'backpack', label: 'Backpack' },
  { value: 'tent', label: 'Tent' },
  { value: 'sleeping_bag', label: 'Sleeping Bag' },
  { value: 'sleeping_pad', label: 'Sleeping Pad' },
  { value: 'stove', label: 'Stove' },
  { value: 'cookware', label: 'Cookware' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'other', label: 'Other' },
];

// Helper to categorize weight
const getWeightCategory = (grams) => {
  const kg = grams / 1000;
  if (kg < 5) return { label: 'Ultralight', color: 'var(--color-primary-600)' };
  if (kg < 9) return { label: 'Light', color: 'var(--color-success-600)' };
  if (kg < 13) return { label: 'Standard', color: 'var(--color-warning-600)' };
  return { label: 'Heavy', color: 'var(--color-accent-600)' };
};

export default function BagList() {
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cloneTarget, setCloneTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  // Custom gear modal state
  const [addCustomOpen, setAddCustomOpen] = useState(false);
  const [customForm, setCustomForm] = useState({ brand: '', model: '', category: 'backpack', weight_grams: '' });
  const [customSubmitLoading, setCustomSubmitLoading] = useState(false);
  const [customError, setCustomError] = useState(''); 

  useEffect(() => {
    loadBags();
  }, []);

  const loadBags = async () => {
    try {
      const response = await getBags();
      setBags(response.data);
    } catch (error) {
      console.error('Failed to load bags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget({ id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBag(deleteTarget.id);
      setBags((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      setToastMessage("Couldn't delete bag. Try again.");
      setDeleteTarget(null);
    }
  };

  const handleCloneClick = (id, name) => {
    setCloneTarget({ id, name });
  };

  const handleCloneSubmit = async (newName) => {
    if (!cloneTarget) return;
    try {
      const response = await duplicateBag(cloneTarget.id, newName);
      setBags((prev) => [response.data, ...prev]);
      setCloneTarget(null);
    } catch (error) {
      setToastMessage("Couldn't duplicate bag. Try again.");
      setCloneTarget(null);
    }
  };

  const handleAddCustomSubmit = async (e) => {
    e.preventDefault();
    setCustomError('');
    if (!customForm.brand?.trim() || !customForm.model?.trim() || !customForm.category || !customForm.weight_grams || Number(customForm.weight_grams) < 1) {
      setCustomError('Brand, model, category, and weight (positive grams) required.');
      return;
    }
    setCustomSubmitLoading(true);
    try {
      await createCustomGear({
        brand: customForm.brand.trim(),
        model: customForm.model.trim(),
        category: customForm.category,
        weight_grams: Number(customForm.weight_grams),
      });
      setAddCustomOpen(false);
      setCustomForm({ brand: '', model: '', category: 'backpack', weight_grams: '' });
      setToastMessage('Custom gear added! You can now use it in your bags.');
    } catch (err) {
      setCustomError(err.response?.data?.error || 'Failed to add custom gear');
    } finally {
      setCustomSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-primary-200)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Loading bags...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
      
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Bag"
        message="Are you sure you want to delete this bag? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <CloneModal
        isOpen={!!cloneTarget}
        title="Name for duplicated bag"
        message="Enter a name for the clone."
        inputLabel="Bag name"
        inputDefault={cloneTarget ? `${cloneTarget.name} (copy)` : ''}
        submitLabel="Clone Bag"
        onSubmit={handleCloneSubmit}
        onCancel={() => setCloneTarget(null)}
      />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading text-2xl md:text-3xl mb-1">My Bags</h1>
          <p className="text-caption">
            {bags.length === 0 
              ? 'Create your first gear configuration' 
              : `${bags.length} bag${bags.length !== 1 ? 's' : ''} configured`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAddCustomOpen(true)}
            className="btn btn-secondary btn-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your Gear
          </button>
          <Link to="/bags/new" className="btn btn-primary btn-md">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Bag
          </Link>
        </div>
      </div>

      {bags.length === 0 ? (
        /* Empty State */
        <div className="card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" 
               style={{ backgroundColor: 'var(--color-secondary-100)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--color-secondary-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-heading text-xl mb-2">No bags yet</h2>
          <p className="text-body mb-6 max-w-sm mx-auto">
            Create your first bag to start tracking your gear weight. Each bag represents a complete pack configuration.
          </p>
          <Link to="/bags/new" className="btn btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create First Bag
          </Link>
        </div>
      ) : (
        /* Bags Grid */
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bags.map((bag, index) => {
            const weightCategory = getWeightCategory(bag.total_weight_grams);
            return (
              <div 
                key={bag.id} 
                className="card card-hover p-6 stagger-item flex flex-col justify-between"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  {/* Backpack Image */}
                  <div className="w-14 h-14 rounded-lg mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center"
                       style={{ backgroundColor: '#ffffff' }}>
                    {bag.backpack_image_url ? (
                      <img 
                        src={bag.backpack_image_url} 
                        alt={`${bag.backpack_brand} ${bag.backpack_model}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <svg className="w-6 h-6" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-heading text-lg truncate">{bag.name}</h3>
                    <p className="text-caption text-sm mt-1">
                      <span className="truncate whitespace-normal">{bag.backpack_brand} {bag.backpack_model}</span>
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0 flex flex-row items-center justify-end">
                    <div className="text-2xl font-bold" style={{ color: weightCategory.color }}>
                      {(bag.total_weight_grams / 1000).toFixed(2)} <span className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>kg</span>
                    </div>
                  </div>
                </div>
                
                {/* Weight Badge */}
                <div className="mb-4">
                  <span className="badge" style={{ 
                    backgroundColor: `${weightCategory.color}15`,
                    color: weightCategory.color
                  }}>
                    {weightCategory.label}
                  </span>
                </div>
                
                {bag.description && (
                  <p className="text-body text-sm mb-4 line-clamp-2">{bag.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-neutral-100)' }}>
                  <Link
                    to={`/bags/${bag.id}/edit`}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleCloneClick(bag.id, bag.name)}
                    className="btn btn-secondary btn-sm flex-1 hover:bg-primary-100"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Clone
                  </button>
                  <button
                    onClick={() => handleDeleteClick(bag.id)}
                    className="btn btn-danger btn-sm px-3"
                    title="Delete bag"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Gear Modal */}
      {addCustomOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
          onClick={() => setAddCustomOpen(false)}
        >
          <div 
            className="card p-6 w-full max-w-md animate-fade-in" 
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-heading text-xl mb-4">Add Your Gear</h2>
            <p className="text-caption text-sm mb-4">
              Add your own gear that's not in the catalog. You can use it in any of your bags.
            </p>
            <form onSubmit={handleAddCustomSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">Brand <span style={{ color: 'var(--color-accent-500)' }}>*</span></label>
                  <input 
                    type="text" 
                    value={customForm.brand} 
                    onChange={e => setCustomForm(f => ({ ...f, brand: e.target.value }))} 
                    className="input w-full" 
                    placeholder="e.g., Osprey"
                    required 
                  />
                </div>
                <div>
                  <label className="label">Model <span style={{ color: 'var(--color-accent-500)' }}>*</span></label>
                  <input 
                    type="text" 
                    value={customForm.model} 
                    onChange={e => setCustomForm(f => ({ ...f, model: e.target.value }))} 
                    className="input w-full" 
                    placeholder="e.g., Exos 58"
                    required 
                  />
                </div>
                <div>
                  <label className="label">Category <span style={{ color: 'var(--color-accent-500)' }}>*</span></label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {gearCategories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCustomForm(f => ({ ...f, category: cat.value }))}
                        className="px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all border"
                        style={{
                          backgroundColor: customForm.category === cat.value ? 'var(--color-primary-500)' : 'var(--color-neutral-50)',
                          color: customForm.category === cat.value ? 'white' : 'var(--color-neutral-700)',
                          borderColor: customForm.category === cat.value ? 'var(--color-primary-500)' : 'var(--color-neutral-200)',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Weight (grams) <span style={{ color: 'var(--color-accent-500)' }}>*</span></label>
                  <input 
                    type="number" 
                    min="1" 
                    value={customForm.weight_grams} 
                    onChange={e => setCustomForm(f => ({ ...f, weight_grams: e.target.value }))} 
                    className="input w-full" 
                    placeholder="e.g., 1200"
                    required 
                  />
                </div>
                {customError && (
                  <p className="text-sm" style={{ color: 'var(--color-error-600)' }}>{customError}</p>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => { setAddCustomOpen(false); setCustomError(''); }} 
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={customSubmitLoading} 
                  className="btn btn-primary flex-1"
                >
                  {customSubmitLoading ? 'Saving...' : 'Add Gear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
