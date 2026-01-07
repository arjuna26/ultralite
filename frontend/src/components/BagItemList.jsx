export default function BagItemList({ items, onRemove }) {
  const totalWeight = items.reduce((sum, item) => sum + item.total_item_weight_grams, 0);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Bag Contents</h2>
        <p className="text-gray-500 text-center py-8">No items yet. Add some gear!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Bag Contents</h2>
        <div className="text-sm text-gray-600">
          {items.length} items • {(totalWeight / 1000).toFixed(2)} kg
        </div>
      </div>
      
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.gear_item_id}
            className="flex justify-between items-center p-3 border border-gray-200 rounded-md"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">
                {item.brand} {item.model}
              </div>
              <div className="text-xs text-gray-500">
                {item.category} • Qty: {item.quantity}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-semibold text-gray-700">
                {item.total_item_weight_grams}g
              </div>
              <button
                onClick={() => onRemove(item.gear_item_id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}