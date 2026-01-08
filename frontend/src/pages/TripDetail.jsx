import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTrip, getBags, addBagToTrip, removeBagFromTrip, updateTrip, updateTripStats } from '../api/client';

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// Helper to categorize weight
const getWeightCategory = (grams) => {
  const kg = grams / 1000;
  if (kg < 5) return { label: 'Ultralight', color: 'var(--color-primary-600)' };
  if (kg < 9) return { label: 'Light', color: 'var(--color-success-600)' };
  if (kg < 13) return { label: 'Standard', color: 'var(--color-warning-600)' };
  return { label: 'Heavy', color: 'var(--color-accent-600)' };
};

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
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-primary-200)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Loading trip...</span>
          </div>
        </div>
      </div>
    );
  }

  const availableBags = allBags.filter(bag => 
    !trip.bags?.some(tripBag => tripBag.id === bag.id)
  );

  return (
    <div className="container py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/trips')}
        className="btn btn-ghost btn-sm mb-6 -ml-2"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Trips
      </button>

      {/* Trip Header Card */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-heading text-2xl md:text-3xl mb-2">{trip.name}</h1>
            {trip.location_text && (
              <p className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-neutral-600)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-accent-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {trip.location_text}
              </p>
            )}
            {trip.start_date && (
              <p className="flex items-center gap-2" style={{ color: 'var(--color-neutral-500)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(trip.start_date)}
                {trip.end_date && ` — ${formatDate(trip.end_date)}`}
              </p>
            )}
            {trip.notes && (
              <p className="mt-4 text-body">{trip.notes}</p>
            )}
          </div>
          <button
            onClick={() => setEditingTrip(!editingTrip)}
            className="btn btn-secondary btn-sm"
          >
            {editingTrip ? (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Trip
              </>
            )}
          </button>
        </div>

        {/* Edit Form */}
        {editingTrip && (
          <form onSubmit={handleUpdateTrip} className="border-t pt-6 mt-4 animate-fade-in" style={{ borderColor: 'var(--color-neutral-100)' }}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label">Trip Name <span style={{ color: 'var(--color-accent-500)' }}>*</span></label>
                <input
                  type="text"
                  value={tripForm.name}
                  onChange={(e) => setTripForm({...tripForm, name: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Location</label>
                <input
                  type="text"
                  value={tripForm.location_text}
                  onChange={(e) => setTripForm({...tripForm, location_text: e.target.value})}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  value={tripForm.start_date}
                  onChange={(e) => setTripForm({...tripForm, start_date: e.target.value})}
                  className="input"
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  value={tripForm.end_date}
                  onChange={(e) => setTripForm({...tripForm, end_date: e.target.value})}
                  className="input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Notes</label>
                <textarea
                  value={tripForm.notes}
                  onChange={(e) => setTripForm({...tripForm, notes: e.target.value})}
                  rows={3}
                  className="input"
                  style={{ minHeight: '80px' }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingTrip(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bags Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-xl">Bags for this trip</h2>
          <button
            onClick={() => setShowAddBag(!showAddBag)}
            className="btn btn-primary btn-sm"
            disabled={availableBags.length === 0 && !showAddBag}
          >
            {showAddBag ? (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Bag
              </>
            )}
          </button>
        </div>

        {/* Add Bag Form */}
        {showAddBag && (
          <form onSubmit={handleAddBag} className="card p-5 mb-4 animate-fade-in">
            {availableBags.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-caption mb-3">All your bags are already added to this trip</p>
                <Link to="/bags/new" className="btn btn-secondary btn-sm">
                  Create New Bag
                </Link>
              </div>
            ) : (
              <>
                <label className="label">Select a bag to add</label>
                <select
                  value={selectedBagId}
                  onChange={(e) => setSelectedBagId(e.target.value)}
                  className="input mb-4"
                  required
                >
                  <option value="">Choose a bag...</option>
                  {availableBags.map((bag) => (
                    <option key={bag.id} value={bag.id}>
                      {bag.name} ({(bag.total_weight_grams / 1000).toFixed(2)} kg)
                    </option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button type="submit" className="btn btn-primary btn-sm">
                    Add to Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBag(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Bags Grid */}
        {trip.bags && trip.bags.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {trip.bags.map((bag) => {
              const weightCategory = getWeightCategory(bag.total_weight_grams);
              return (
                <div key={bag.id} className="card p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-4">
                      <Link 
                        to={`/bags/${bag.id}/edit`}
                        className="text-heading text-lg hover:underline"
                        style={{ textDecorationColor: 'var(--color-primary-400)' }}
                      >
                        {bag.name}
                      </Link>
                      <p className="text-caption text-sm mt-1 truncate">
                        {bag.backpack_brand} {bag.backpack_model}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold" style={{ color: weightCategory.color }}>
                        {(bag.total_weight_grams / 1000).toFixed(2)} kg
                      </div>
                      <span className="badge mt-1" style={{ 
                        backgroundColor: `${weightCategory.color}15`,
                        color: weightCategory.color
                      }}>
                        {weightCategory.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-neutral-100)' }}>
                    <span className="badge badge-neutral">{bag.role}</span>
                    <button
                      onClick={() => handleRemoveBag(bag.id)}
                      className="text-sm font-medium transition-colors"
                      style={{ color: 'var(--color-error-500)' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" 
                 style={{ backgroundColor: 'var(--color-neutral-100)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-caption">No bags added yet</p>
            {availableBags.length > 0 && (
              <button onClick={() => setShowAddBag(true)} className="btn btn-secondary btn-sm mt-3">
                Add a Bag
              </button>
            )}
          </div>
        )}
      </div>

      {/* Trip Stats Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-xl">Trip Stats</h2>
          <button
            onClick={() => setEditingStats(!editingStats)}
            className="btn btn-secondary btn-sm"
          >
            {editingStats ? 'Cancel' : 'Edit Stats'}
          </button>
        </div>

        {!editingStats ? (
          <>
            {trip.stats && (trip.stats.nights || trip.stats.miles || trip.stats.elevation_gain_ft) ? (
              <>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {trip.stats.nights && (
                    <div>
                      <div className="text-3xl font-bold" style={{ color: 'var(--color-primary-600)' }}>
                        {trip.stats.nights}
                      </div>
                      <div className="text-caption text-sm">Nights</div>
                    </div>
                  )}
                  {trip.stats.miles && (
                    <div>
                      <div className="text-3xl font-bold" style={{ color: 'var(--color-primary-600)' }}>
                        {trip.stats.miles}
                      </div>
                      <div className="text-caption text-sm">Miles</div>
                    </div>
                  )}
                  {trip.stats.elevation_gain_ft && (
                    <div>
                      <div className="text-3xl font-bold" style={{ color: 'var(--color-primary-600)' }}>
                        {Number(trip.stats.elevation_gain_ft).toLocaleString()}
                      </div>
                      <div className="text-caption text-sm">Elevation (ft)</div>
                    </div>
                  )}
                </div>
                
                {trip.stats.weather_notes && (
                  <div className="border-t pt-4 mb-4" style={{ borderColor: 'var(--color-neutral-100)' }}>
                    <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>Weather Notes</h3>
                    <p className="text-body text-sm">{trip.stats.weather_notes}</p>
                  </div>
                )}
                
                {trip.stats.lessons_learned && (
                  <div className="border-t pt-4" style={{ borderColor: 'var(--color-neutral-100)' }}>
                    <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-neutral-700)' }}>Lessons Learned</h3>
                    <p className="text-body text-sm">{trip.stats.lessons_learned}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-caption mb-3">No stats recorded yet</p>
                <button onClick={() => setEditingStats(true)} className="btn btn-secondary btn-sm">
                  Add Trip Stats
                </button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleUpdateStats} className="animate-fade-in">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="label">Nights</label>
                <input
                  type="number"
                  value={statsForm.nights}
                  onChange={(e) => setStatsForm({...statsForm, nights: e.target.value})}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Miles</label>
                <input
                  type="number"
                  step="0.1"
                  value={statsForm.miles}
                  onChange={(e) => setStatsForm({...statsForm, miles: e.target.value})}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Elevation Gain (ft)</label>
                <input
                  type="number"
                  value={statsForm.elevation_gain_ft}
                  onChange={(e) => setStatsForm({...statsForm, elevation_gain_ft: e.target.value})}
                  className="input"
                  min="0"
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 mt-5">
              <div>
                <label className="label">Weather Notes</label>
                <textarea
                  value={statsForm.weather_notes}
                  onChange={(e) => setStatsForm({...statsForm, weather_notes: e.target.value})}
                  rows={2}
                  className="input"
                  style={{ minHeight: '70px' }}
                />
              </div>
              <div>
                <label className="label">Lessons Learned</label>
                <textarea
                  value={statsForm.lessons_learned}
                  onChange={(e) => setStatsForm({...statsForm, lessons_learned: e.target.value})}
                  rows={2}
                  className="input"
                  style={{ minHeight: '70px' }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn btn-primary">
                Save Stats
              </button>
              <button
                type="button"
                onClick={() => setEditingStats(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
