import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBackpacks, createBag, getBag, addItemToBag, removeItemFromBag, createCustomGear } from '../api/client';
import GearSearchModal from '../components/GearSearchModal';
import BagItemList from '../components/BagItemList';
import Toast from '../components/Toast';
import { useImageBackgroundColor } from '../hooks/useImageBackgroundColor';

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

// Small thumbnail component for gear items in bag
function GearThumbnail({ item }) {
  const imageBackgroundColor = useImageBackgroundColor(item.image_url);
  
  return (
    <div 
      className="w-15 h-15 rounded-lg overflow-hidden flex items-center justify-center transition-transform hover:scale-110"
      style={{ backgroundColor: imageBackgroundColor }}
      title={`${item.brand} ${item.model} (${item.weight_grams}g)`}
    >
      {item.image_url ? (
        <img 
          src={item.image_url} 
          alt={`${item.brand} ${item.model}`}
          className="w-full h-full object-contain"
        />
      ) : (
        <svg className="w-5 h-5" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )}
    </div>
  );
}

export default function BagBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [selectedBackpack, setSelectedBackpack] = useState('');
  const [bagName, setBagName] = useState('');
  const [description, setDescription] = useState('');
  const [bagData, setBagData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBackpackModalOpen, setIsBackpackModalOpen] = useState(false);
  const [selectedBackpackObj, setSelectedBackpackObj] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [addCustomOpen, setAddCustomOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    brand: '',
    model: '',
    category: 'backpack',
    weight_grams: '',
  });
  const [customSubmitLoading, setCustomSubmitLoading] = useState(false);
  const [customError, setCustomError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadBag();
    }
  }, [id]);

  const loadBag = async () => {
    try {
      const response = await getBag(id);
      const bag = response.data;
      setBagData(bag);
      setBagName(bag.name);
      setDescription(bag.description || '');
      setSelectedBackpack(bag.backpack_gear_item_id);
    } catch (error) {
      console.error('Failed to load bag:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedBackpack || !bagName) return;

    setLoading(true);
    try {
      const response = await createBag({
        name: bagName,
        backpack_gear_item_id: selectedBackpack,
        description,
      });
      navigate(`/bags/${response.data.id}/edit`);
    } catch (error) {
      alert('Failed to create bag');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (gearItem) => {
    try {
      await addItemToBag(id, gearItem.id);
      setIsSearchModalOpen(false);
      loadBag(); // Reload to get updated weight
    } catch (error) {
      alert('Failed to add item');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItemFromBag(id, itemId);
      loadBag(); // Reload to get updated weight
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleBackpackSelect = (bp) => {
    setSelectedBackpack(bp.id);
    setSelectedBackpackObj(bp);
    setIsBackpackModalOpen(false);
  }

  const handleAddCustomSubmit = async (e) => {
    e.preventDefault();
    setCustomError('');
    if (
      !customForm.brand?.trim() ||
      !customForm.model?.trim() ||
      !customForm.category ||
      !customForm.weight_grams ||
      Number(customForm.weight_grams) < 1
    ) {
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
      setToastMessage('Custom gear added! You can now use it in this and other bags.');
    } catch (err) {
      setCustomError(err.response?.data?.error || 'Failed to add custom gear');
    } finally {
      setCustomSubmitLoading(false);
    }
  };

  if (isEdit && !bagData) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-primary-200)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Loading bag...</span>
          </div>
        </div>
      </div>
    );
  }

  const weightCategory = bagData ? getWeightCategory(bagData.total_weight_grams) : null;

  return (
    <div className="container py-8">
      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />

      {/* Back Button & Weight Bar */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/bags')}
            className="btn btn-ghost btn-sm -ml-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bags
          </button>
          
          {/* Weight Progress Bar - centered */}
          {isEdit && (
            <div className="hidden md:flex flex-col items-center flex-1 max-w-xl mx-auto">
              <span className="text-sm font-medium mb-1" style={{ color: weightCategory.color }}>
                {weightCategory.label}
              </span>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-neutral-100)' }}>
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((bagData.total_weight_grams / 15000) * 100, 100)}%`,
                    backgroundColor: weightCategory.color
                  }}
                />
              </div>
              <div className="flex justify-between w-full mt-1">
                <span className="text-xs" style={{ color: 'var(--color-neutral-400)' }}>0 kg</span>
                <span className="text-xs" style={{ color: 'var(--color-neutral-400)' }}>15 kg</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <h1 className="text-heading text-2xl md:text-3xl">
            {isEdit ? 'Edit Bag' : 'Create New Bag'}
          </h1>
          {isEdit && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="btn btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Gear
              </button>
              <button
                type="button"
                onClick={() => setAddCustomOpen(true)}
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your Gear
              </button>
            </div>
          )}
        </div>
      </div>

      {!isEdit ? (
        /* Create Form - Two Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="order-2 lg:order-1">
            <form onSubmit={handleCreate} className="card p-6 md:p-8">
              <div className="space-y-6">
                {/* Bag Name */}
                <div>
                  <label className="label">
                    Bag Name <span style={{ color: 'var(--color-accent-500)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bagName}
                    onChange={(e) => setBagName(e.target.value)}
                    placeholder="e.g., Glacier 3-Night Solo Pack"
                    className="input"
                    required
                  />
                  <p className="mt-1.5 text-xs" style={{ color: 'var(--color-neutral-500)' }}>
                    Give your bag a descriptive name you'll remember
                  </p>
                </div>
                                {/* Backpack Selection */}
                                <div>
                  <label className="label">
                    Choose Your Backpack <span style={{ color: 'var(--color-accent-500)' }}>*</span>
                  </label>
                  {selectedBackpackObj ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsBackpackModalOpen(true)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsBackpackModalOpen(true)}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer"
                      style={{ borderColor: 'var(--color-neutral-200)', backgroundColor: 'var(--color-surface-elevated)' }}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-neutral-100)' }}>
                        {selectedBackpackObj.image_url ? (
                          <img src={selectedBackpackObj.image_url} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <svg className="w-6 h-6" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm" style={{ color: 'var(--color-neutral-900)' }}>
                          {selectedBackpackObj.brand} {selectedBackpackObj.model}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>
                          {selectedBackpackObj.weight_grams}g
                        </div>
                      </div>
                      <span className="text-sm" style={{ color: 'var(--color-primary-600)' }}>Change</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsBackpackModalOpen(true)}
                      className="input w-full text-left flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search backpacks...
                    </button>
                  )}
                  <p className="mt-1.5 text-xs" style={{ color: 'var(--color-neutral-500)' }}>
                    Your backpack weight is included in the total
                  </p>
                </div>

                <GearSearchModal
                  isOpen={isBackpackModalOpen}
                  onClose={() => setIsBackpackModalOpen(false)}
                  onSelect={handleBackpackSelect}
                  restrictCategory="backpack"
                  title="Choose backpack"
                />

                {/* Description */}
                <div>
                  <label className="label">Description <span style={{ color: 'var(--color-neutral-400)' }}>(optional)</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Notes about this bag setup, like trip type or conditions..."
                    rows={3}
                    className="input"
                    style={{ minHeight: '100px' }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full btn-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Bag
                    </>
                  )}
              </button>
            </div>
          </form>
        </div>
                {/* Right Column - Backpack Image */}
                {selectedBackpackObj && (
          <div className="order-1 lg:order-2 flex">
            <div className="lg:sticky lg:top-24 w-full flex items-center justify-center">
              <div 
                className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: 'transparent' }}
              >
                {selectedBackpackObj.image_url ? (
                  <img 
                    src={selectedBackpackObj.image_url} 
                    alt={`${selectedBackpackObj.brand} ${selectedBackpackObj.model}`}
                    className="w-full h-full object-contain max-h-[500px]"
                  />
                ) : (
                  <svg className="w-24 h-24" style={{ color: 'var(--color-neutral-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      ) : (
        /* Edit Mode - Two Column Layout */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Bag Contents */}
            <div className="order-2 lg:order-1">
              {/* Bag Contents */}
              <BagItemList 
                items={bagData.items || []} 
                onRemove={handleRemoveItem}
              />
            </div>

            {/* Right Column - Backpack Visual */}
            <div className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <div className="card p-6">
                  {/* Bag Name & Weight + Backpack Image Row */}
                  <div className="flex items-start gap-14">
                    {/* Left: Bag Name & Weight */}
                    <div>
                      <h2 className="text-heading text-xl mb-1">{bagData.name}</h2>
                      {bagData.description && (
                        <p className="text-caption text-sm mt-1 mb-3">{bagData.description}</p>
                      )}
                      <div className="text-3xl font-bold" style={{ color: weightCategory.color }}>
                        {(bagData.total_weight_grams / 1000).toFixed(2)}
                        <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-neutral-500)' }}>kg</span>
                      </div>
                      
                      {/* Mobile weight bar */}
                      <div className="mt-4 md:hidden">
                        <span className="text-sm font-medium" style={{ color: weightCategory.color }}>
                          {weightCategory.label}
                        </span>
                        <div className="w-full h-2 rounded-full overflow-hidden mt-1" style={{ backgroundColor: 'var(--color-neutral-100)' }}>
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min((bagData.total_weight_grams / 15000) * 100, 100)}%`,
                              backgroundColor: weightCategory.color
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs" style={{ color: 'var(--color-neutral-400)' }}>0 kg</span>
                          <span className="text-xs" style={{ color: 'var(--color-neutral-400)' }}>15 kg</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Backpack Image & Details */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div 
                        className="w-64 h-64 rounded-xl overflow-hidden flex items-center justify-center mb-2"
                        style={{ backgroundColor: '#ffffff' }}
                      >
                        {bagData.backpack_image_url ? (
                          <img 
                            src={bagData.backpack_image_url} 
                            alt={`${bagData.backpack_brand} ${bagData.backpack_model}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <svg className="w-12 h-12" style={{ color: 'var(--color-neutral-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-center" style={{ color: 'var(--color-neutral-700)' }}>
                        {bagData.backpack_brand} {bagData.backpack_model}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-neutral-500)' }}>
                        {bagData.backpack_weight_grams}g
                      </p>
                    </div>
                  </div>
                  
                  {/* Packed Gear Thumbnails */}
                  <div className="w-full mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-neutral-100)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-neutral-600)' }}>
                        Packed Gear
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-neutral-400)' }}>
                        {bagData.items?.length || 0} items
                      </span>
                    </div>
                    
                    {bagData.items && bagData.items.length > 0 ? (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {bagData.items.map((item, index) => (
                          <GearThumbnail 
                            key={item.gear_item_id || `item-${index}`}
                            item={item}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4" style={{ color: 'var(--color-neutral-400)' }}>
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-xs">No gear added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gear Search Modal */}
          <GearSearchModal 
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            onSelect={handleAddItem}
          />

          {/* Add Custom Gear Modal */}
          {addCustomOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              onClick={() => setAddCustomOpen(false)}
            >
              <div
                className="card p-6 w-full max-w-md animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-heading text-xl mb-4">Add Your Gear</h2>
                <p className="text-caption text-sm mb-4">
                  Add your own gear that&apos;s not in the catalog. You can use it in this bag and others.
                </p>
                <form onSubmit={handleAddCustomSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="label">
                        Brand <span style={{ color: 'var(--color-accent-500)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={customForm.brand}
                        onChange={(e) =>
                          setCustomForm((f) => ({ ...f, brand: e.target.value }))
                        }
                        className="input w-full"
                        placeholder="e.g., Osprey"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">
                        Model <span style={{ color: 'var(--color-accent-500)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={customForm.model}
                        onChange={(e) =>
                          setCustomForm((f) => ({ ...f, model: e.target.value }))
                        }
                        className="input w-full"
                        placeholder="e.g., Exos 58"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">
                        Category <span style={{ color: 'var(--color-accent-500)' }}>*</span>
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {gearCategories.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() =>
                              setCustomForm((f) => ({ ...f, category: cat.value }))
                            }
                            className="px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all border"
                            style={{
                              backgroundColor:
                                customForm.category === cat.value
                                  ? 'var(--color-primary-500)'
                                  : 'var(--color-neutral-50)',
                              color:
                                customForm.category === cat.value
                                  ? 'white'
                                  : 'var(--color-neutral-700)',
                              borderColor:
                                customForm.category === cat.value
                                  ? 'var(--color-primary-500)'
                                  : 'var(--color-neutral-200)',
                            }}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label">
                        Weight (grams){' '}
                        <span style={{ color: 'var(--color-accent-500)' }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={customForm.weight_grams}
                        onChange={(e) =>
                          setCustomForm((f) => ({
                            ...f,
                            weight_grams: e.target.value,
                          }))
                        }
                        className="input w-full"
                        placeholder="e.g., 1200"
                        required
                      />
                    </div>
                    {customError && (
                      <p
                        className="text-sm"
                        style={{ color: 'var(--color-error-600)' }}
                      >
                        {customError}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setAddCustomOpen(false);
                        setCustomError('');
                      }}
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
        </>
      )}
    </div>
  );
}
