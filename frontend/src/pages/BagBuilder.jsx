import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBackpacks, createBag, getBag, addItemToBag, removeItemFromBag } from '../api/client';
import GearSearch from '../components/GearSearch';
import BagItemList from '../components/BagItemList';

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
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/bags')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Back to Bags
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Bag' : 'Create New Bag'}
        </h1>
      </div>

      {!isEdit ? (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bag Name *
              </label>
              <input
                type="text"
                value={bagName}
                onChange={(e) => setBagName(e.target.value)}
                placeholder="e.g., Glacier 3-Night Solo Pack"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose Your Backpack *
              </label>
              <select
                value={selectedBackpack}
                onChange={(e) => setSelectedBackpack(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a backpack...</option>
                {backpacks.map((bp) => (
                  <option key={bp.id} value={bp.id}>
                    {bp.brand} {bp.model} ({bp.weight_grams}g)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes about this bag setup..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Bag'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">{bagData.name}</h2>
              <p className="text-sm text-gray-600 mb-4">
                {bagData.backpack_brand} {bagData.backpack_model}
              </p>
              <div className="text-3xl font-bold text-blue-600">
                {(bagData.total_weight_grams / 1000).toFixed(2)} kg
              </div>
              <div className="text-sm text-gray-500">Total weight</div>
            </div>

            <BagItemList 
              items={bagData.items || []} 
              onRemove={handleRemoveItem}
            />
          </div>

          <div>
            <GearSearch onSelect={handleAddItem} />
          </div>
        </div>
      )}
    </div>
  );
}
