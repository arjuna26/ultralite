import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrips, createTrip, deleteTrip } from '../api/client';

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '',
    location_text: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const response = await getTrips();
      setTrips(response.data);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await createTrip(newTrip);
      setTrips([response.data, ...trips]);
      setShowCreate(false);
      setNewTrip({ name: '', location_text: '', start_date: '', end_date: '', notes: '' });
    } catch (error) {
      alert('Failed to create trip');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip?')) return;
    try {
      await deleteTrip(id);
      setTrips(trips.filter(t => t.id !== id));
    } catch (error) {
      alert('Failed to delete trip');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trips</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          + New Trip
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Trip</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newTrip.name}
              onChange={(e) => setNewTrip({...newTrip, name: e.target.value})}
              placeholder="Trip name *"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              value={newTrip.location_text}
              onChange={(e) => setNewTrip({...newTrip, location_text: e.target.value})}
              placeholder="Location (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={newTrip.start_date}
                onChange={(e) => setNewTrip({...newTrip, start_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="date"
                value={newTrip.end_date}
                onChange={(e) => setNewTrip({...newTrip, end_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <textarea
              value={newTrip.notes}
              onChange={(e) => setNewTrip({...newTrip, notes: e.target.value})}
              placeholder="Notes (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Trip
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No trips yet. Plan your first adventure!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link to={`/trips/${trip.id}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                    {trip.name}
                  </Link>
                  {trip.location_text && (
                    <p className="text-sm text-gray-600 mt-1">📍 {trip.location_text}</p>
                  )}
                  {trip.start_date && (
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(trip.start_date).toLocaleDateString()}
                      {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="text-sm text-red-600 hover:text-red-800"
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