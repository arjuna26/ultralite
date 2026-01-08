import { useState, useEffect } from 'react';
import { getGear } from '../api/client';

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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Add Gear</h2>
      
      <div className="space-y-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gear..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          <option value="tent">Tents</option>
          <option value="sleeping_bag">Sleeping Bags</option>
          <option value="sleeping_pad">Sleeping Pads</option>
          <option value="stove">Stoves</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {gear.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(item)}
            >
              <div>
                <div className="font-medium text-sm">{item.brand} {item.model}</div>
                <div className="text-xs text-gray-500">{item.category}</div>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {item.weight_grams}g
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
