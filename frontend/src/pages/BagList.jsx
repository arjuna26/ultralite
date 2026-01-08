import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBags, deleteBag, duplicateBag } from '../api/client';

export default function BagList() {
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this bag?')) return;
    
    try {
      await deleteBag(id);
      setBags(bags.filter(b => b.id !== id));
    } catch (error) {
      alert('Failed to delete bag');
    }
  };

  const handleDuplicate = async (id, name) => {
    const newName = prompt('Name for duplicated bag:', `${name} (copy)`);
    if (!newName) return;
    
    try {
      const response = await duplicateBag(id, newName);
      setBags([response.data, ...bags]);
    } catch (error) {
      alert('Failed to duplicate bag');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bags</h1>
        <Link
          to="/bags/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          + New Bag
        </Link>
      </div>

      {bags.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No bags yet. Create your first one!</p>
          <Link
            to="/bags/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create First Bag
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bags.map((bag) => (
            <div key={bag.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{bag.name}</h3>
                  <p className="text-sm text-gray-500">
                    {bag.backpack_brand} {bag.backpack_model}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {(bag.total_weight_grams / 1000).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">kg</div>
                </div>
              </div>
              
              {bag.description && (
                <p className="text-sm text-gray-600 mb-4">{bag.description}</p>
              )}

              <div className="flex space-x-2">
                <Link
                  to={`/bags/${bag.id}/edit`}
                  className="flex-1 text-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDuplicate(bag.id, bag.name)}
                  className="flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleDelete(bag.id)}
                  className="px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}