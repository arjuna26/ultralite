import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBackpacks, createBag, getBag, addItemToBag, removeItemFromBag } from '../api/client';
import GearSearch from '../components/GearSearch';
import BagItemList from '../components/BagItemList';

// Helper to categorize weight
const getWeightCategory = (grams) => {
  const kg = grams / 1000;
  if (kg < 5) return { label: 'Ultralight', color: 'var(--color-primary-600)' };
  if (kg < 9) return { label: 'Light', color: 'var(--color-success-600)' };
  if (kg < 13) return { label: 'Standard', color: 'var(--color-warning-600)' };
  return { label: 'Heavy', color: 'var(--color-accent-600)' };
};

export default function BagBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [backpacks, setBackpacks] = useState([]);
  const [selectedBackpack, setSelectedBackpack] = useState('');
  const [bagName, setBagName] = useState('');
  const [description, setDescription] = useState('');
  const [bagData, setBagData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBackpacks();
    if (isEdit) {
      loadBag();
    }
  }, [id]);

  const loadBackpacks = async () => {
    try {
      const response = await getBackpacks();
      setBackpacks(response.data);
    } catch (error) {
      console.error('Failed to load backpacks:', error);
    }
  };

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
      {/* Back Button & Title */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/bags')}
          className="btn btn-ghost btn-sm mb-4 -ml-2"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Bags
        </button>
        <h1 className="text-heading text-2xl md:text-3xl">
          {isEdit ? 'Edit Bag' : 'Create New Bag'}
        </h1>
      </div>

      {!isEdit ? (
        /* Create Form */
        <div className="max-w-2xl">
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
                <select
                  value={selectedBackpack}
                  onChange={(e) => setSelectedBackpack(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select a backpack...</option>
                  {backpacks.map((bp) => (
                    <option key={bp.id} value={bp.id}>
                      {bp.brand} {bp.model} ({bp.weight_grams}g)
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs" style={{ color: 'var(--color-neutral-500)' }}>
                  Your backpack weight is included in the total
                </p>
              </div>

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
      ) : (
        /* Edit Mode - Three Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Left Column - Bag Info & Contents */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Bag Summary Card */}
            <div className="card p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-heading text-xl mb-1">{bagData.name}</h2>
                  {bagData.description && (
                    <p className="text-caption text-sm mt-2">{bagData.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold" style={{ color: weightCategory.color }}>
                      {(bagData.total_weight_grams / 1000).toFixed(2)}
                      <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-neutral-500)' }}>kg</span>
                    </div>
                  </div>
                  <span className="badge" style={{ 
                    backgroundColor: `${weightCategory.color}15`,
                    color: weightCategory.color
                  }}>
                    {weightCategory.label}
                  </span>
                </div>
              </div>
              
              {/* Weight breakdown bar */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-neutral-100)' }}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ color: 'var(--color-neutral-600)' }}>Progress</span>
                  <span style={{ color: 'var(--color-neutral-500)' }}>
                    {bagData.items?.length || 0} items
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-neutral-100)' }}>
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

            {/* Bag Contents */}
            <BagItemList 
              items={bagData.items || []} 
              onRemove={handleRemoveItem}
            />
          </div>

          {/* Center Column - Backpack Visual */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <div className="card p-6 flex flex-col items-center">
                {/* Backpack Image */}
                <div 
                  className="w-48 h-48 rounded-xl overflow-hidden flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--color-neutral-100)' }}
                >
                  {bagData.backpack_image_url ? (
                    <img 
                      src={bagData.backpack_image_url} 
                      alt={`${bagData.backpack_brand} ${bagData.backpack_model}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-16 h-16" style={{ color: 'var(--color-neutral-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                </div>
                
                {/* Backpack Details */}
                <h3 className="text-heading text-lg text-center">
                  {bagData.backpack_brand} {bagData.backpack_model}
                </h3>
                <p className="text-caption text-sm mt-1">
                  {bagData.backpack_weight_grams}g
                </p>
                
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
                        <div 
                          key={item.gear_item_id || `item-${index}`}
                          className="w-15 h-15 rounded-lg overflow-hidden flex items-center justify-center transition-transform hover:scale-110"
                          style={{ backgroundColor: 'var(--color-neutral-100)' }}
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

          {/* Right Column - Gear Search */}
          <div className="lg:col-span-2 order-3">
            <div className="lg:sticky lg:top-24">
              <GearSearch onSelect={handleAddItem} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
