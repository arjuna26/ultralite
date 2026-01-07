import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrip, getBags, addBagToTrip, removeBagFromTrip, updateTrip, updateTripStats } from '../api/client';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [allBags, setAllBags] = useState([]);
  const [showAddBag, setShowAddBag] = useState(false);
  const [selectedBagId, setSelectedBagId] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTrip, setEditingTrip] = useState(false);
  const [editingStats, setEditingStats] = useState(false);
  const [tripForm, setTripForm] = useState({
    name: '',
    location_text: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  const [statsForm, setStatsForm] = useState({
    nights: '',
    miles: '',
    elevation_gain_ft: '',
    weather_notes: '',
    lessons_learned: ''
  });

  useEffect(() => {
    loadTrip();
    loadBags();
  }, [id]);

  const loadTrip = async () => {
    try {
      const response = await getTrip(id);
      const tripData = response.data;
      setTrip(tripData);
      setTripForm({
        name: tripData.name || '',
        location_text: tripData.location_text || '',
        start_date: tripData.start_date ? tripData.start_date.split('T')[0] : '',
        end_date: tripData.end_date ? tripData.end_date.split('T')[0] : '',
        notes: tripData.notes || ''
      });
      if (tripData.stats) {
        setStatsForm({
          nights: tripData.stats.nights || '',
          miles: tripData.stats.miles || '',
          elevation_gain_ft: tripData.stats.elevation_gain_ft || '',
          weather_notes: tripData.stats.weather_notes || '',
          lessons_learned: tripData.stats.lessons_learned || ''
        });
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBags = async () => {
    try {
      const response = await getBags();
      setAllBags(response.data);
    } catch (error) {
      console.error('Failed to load bags:', error);
    }
  };

  const handleAddBag = async (e) => {
    e.preventDefault();
    if (!selectedBagId) return;

    try {
      await addBagToTrip(id, selectedBagId);
      setShowAddBag(false);
      setSelectedBagId('');
      loadTrip();
    } catch (error) {
      alert('Failed to add bag to trip');
    }
  };

  const handleRemoveBag = async (bagId) => {
    try {
      await removeBagFromTrip(id, bagId);
      loadTrip();
    } catch (error) {
      alert('Failed to remove bag');
    }
  };

  const handleUpdateTrip = async (e) => {
    e.preventDefault();
    try {
      await updateTrip(id, tripForm);
      setEditingTrip(false);
      loadTrip();
    } catch (error) {
      alert('Failed to update trip');
    }
  };

  const handleUpdateStats = async (e) => {
    e.preventDefault();
    try {
      await updateTripStats(id, statsForm);
      setEditingStats(false);
      loadTrip();
    } catch (error) {
      alert('Failed to update stats');
    }
  };

  if (loading || !trip) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/trips')}
        className="text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        ← Back to Trips
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
            {trip.location_text && (
              <p className="text-gray-600 mb-2">📍 {trip.location_text}</p>
            )}
            {trip.start_date && (
              <p className="text-gray-500">
                {new Date(trip.start_date).toLocaleDateString()}
                {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
              </p>
            )}
            {trip.notes && (
              <p className="mt-4 text-gray-700">{trip.notes}</p>
            )}
          </div>
          <button
            onClick={() => setEditingTrip(!editingTrip)}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
          >
            {editingTrip ? 'Cancel' : 'Edit Trip'}
          </button>
        </div>

        {editingTrip && (
          <form onSubmit={handleUpdateTrip} className="border-t pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name *</label>
                <input
                  type="text"
                  value={tripForm.name}
                  onChange={(e) => setTripForm({...tripForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={tripForm.location_text}
                  onChange={(e) => setTripForm({...tripForm, location_text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tripForm.start_date}
                    onChange={(e) => setTripForm({...tripForm, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={tripForm.end_date}
                    onChange={(e) => setTripForm({...tripForm, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={tripForm.notes}
                  onChange={(e) => setTripForm({...tripForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Update Trip
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTrip(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Bags for this trip</h2>
          <button
            onClick={() => setShowAddBag(!showAddBag)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Add Bag
          </button>
        </div>

        {showAddBag && (
          <form onSubmit={handleAddBag} className="bg-white rounded-lg shadow p-6 mb-4">
            <select
              value={selectedBagId}
              onChange={(e) => setSelectedBagId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              required
            >
              <option value="">Select a bag...</option>
              {allBags.map((bag) => (
                <option key={bag.id} value={bag.id}>
                  {bag.name} ({(bag.total_weight_grams / 1000).toFixed(2)} kg)
                </option>
              ))}
            </select>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add to Trip
              </button>
              <button
                type="button"
                onClick={() => setShowAddBag(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {trip.bags && trip.bags.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {trip.bags.map((bag) => (
              <div key={bag.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{bag.name}</h3>
                    <p className="text-sm text-gray-500">
                      {bag.backpack_brand} {bag.backpack_model}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      {(bag.total_weight_grams / 1000).toFixed(2)} kg
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {bag.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveBag(bag.id)}
                  className="mt-4 text-sm text-red-600 hover:text-red-800"
                >
                  Remove from trip
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No bags added yet</p>
        )}
      </div>

      {trip.stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Trip Stats</h2>
            <button
              onClick={() => setEditingStats(!editingStats)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              {editingStats ? 'Cancel' : 'Edit Stats'}
            </button>
          </div>

          {!editingStats ? (
            <dl className="grid grid-cols-2 gap-4">
              {trip.stats.nights && (
                <div>
                  <dt className="text-sm text-gray-500">Nights</dt>
                  <dd className="text-lg font-semibold">{trip.stats.nights}</dd>
                </div>
              )}
              {trip.stats.miles && (
                <div>
                  <dt className="text-sm text-gray-500">Miles</dt>
                  <dd className="text-lg font-semibold">{trip.stats.miles}</dd>
                </div>
              )}
              {trip.stats.elevation_gain_ft && (
                <div>
                  <dt className="text-sm text-gray-500">Elevation Gain</dt>
                  <dd className="text-lg font-semibold">{trip.stats.elevation_gain_ft} ft</dd>
                </div>
              )}
            </dl>
          ) : (
            <form onSubmit={handleUpdateStats} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nights</label>
                  <input
                    type="number"
                    value={statsForm.nights}
                    onChange={(e) => setStatsForm({...statsForm, nights: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miles</label>
                  <input
                    type="number"
                    step="0.1"
                    value={statsForm.miles}
                    onChange={(e) => setStatsForm({...statsForm, miles: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Elevation Gain (ft)</label>
                <input
                  type="number"
                  value={statsForm.elevation_gain_ft}
                  onChange={(e) => setStatsForm({...statsForm, elevation_gain_ft: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weather Notes</label>
                <textarea
                  value={statsForm.weather_notes}
                  onChange={(e) => setStatsForm({...statsForm, weather_notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lessons Learned</label>
                <textarea
                  value={statsForm.lessons_learned}
                  onChange={(e) => setStatsForm({...statsForm, lessons_learned: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Update Stats
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStats(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!editingStats && trip.stats.weather_notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Weather</p>
              <p className="text-gray-700">{trip.stats.weather_notes}</p>
            </div>
          )}
          {!editingStats && trip.stats.lessons_learned && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Lessons Learned</p>
              <p className="text-gray-700">{trip.stats.lessons_learned}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}