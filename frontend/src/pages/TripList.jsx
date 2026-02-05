import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrips, createTrip, deleteTrip } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Get relative time helper
const getRelativeTime = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Past';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
};

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState(''); 
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

  const handleDeleteClick = (id) => {
    setDeleteTarget({ id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTrip(deleteTarget.id);
      setTrips((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      setToastMessage("Couldn't delete trip. Try again.");
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-primary-200)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Loading trips...</span>
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
        title="Delete this trip?"
        message="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading text-2xl md:text-3xl mb-1">Trips</h1>
          <p className="text-caption">
            {trips.length === 0 
              ? 'Plan your next adventure' 
              : `${trips.length} trip${trips.length !== 1 ? 's' : ''} planned`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn btn-primary"
        >
          {showCreate ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Trip
            </>
          )}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="card p-6 mb-8 animate-fade-in">
          <h2 className="text-heading text-lg mb-6">Create New Trip</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">
                Trip Name <span style={{ color: 'var(--color-accent-500)' }}>*</span>
              </label>
              <input
                type="text"
                value={newTrip.name}
                onChange={(e) => setNewTrip({...newTrip, name: e.target.value})}
                placeholder="e.g., PCT Section Hike"
                className="input"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Location</label>
              <input
                type="text"
                value={newTrip.location_text}
                onChange={(e) => setNewTrip({...newTrip, location_text: e.target.value})}
                placeholder="e.g., Glacier National Park, MT"
                className="input"
              />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={newTrip.start_date}
                onChange={(e) => setNewTrip({...newTrip, start_date: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                value={newTrip.end_date}
                onChange={(e) => setNewTrip({...newTrip, end_date: e.target.value})}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea
                value={newTrip.notes}
                onChange={(e) => setNewTrip({...newTrip, notes: e.target.value})}
                placeholder="Planning notes, reminders, etc."
                rows={3}
                className="input"
                style={{ minHeight: '80px' }}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-neutral-100)' }}>
            <button type="submit" className="btn btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Trip
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {trips.length === 0 ? (
        /* Empty State */
        <div className="card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" 
               style={{ backgroundColor: 'var(--color-secondary-100)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--color-secondary-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-heading text-xl mb-2">No trips yet</h2>
          <p className="text-body mb-6 max-w-sm mx-auto">
            Create a trip to start planning your next adventure. Associate bags with trips to track what you bring.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Plan First Trip
          </button>
        </div>
      ) : (
        /* Trips List */
        <div className="space-y-4">
          {trips.map((trip, index) => {
            const relativeTime = getRelativeTime(trip.start_date);
            const isPast = relativeTime === 'Past';
            
            return (
              <div 
                key={trip.id} 
                className="card card-hover stagger-item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link 
                          to={`/trips/${trip.id}`} 
                          className="text-heading text-lg hover:underline"
                          style={{ textDecorationColor: 'var(--color-primary-400)' }}
                        >
                          {trip.name}
                        </Link>
                        {relativeTime && (
                          <span 
                            className="badge"
                            style={isPast 
                              ? { backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-neutral-500)' }
                              : { backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }
                            }
                          >
                            {relativeTime}
                          </span>
                        )}
                      </div>
                      
                      {trip.location_text && (
                        <p className="text-sm flex items-center gap-1.5 mb-2" style={{ color: 'var(--color-neutral-600)' }}>
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {trip.location_text}
                        </p>
                      )}
                      
                      {trip.start_date && (
                        <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-neutral-500)' }}>
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(trip.start_date)}
                          {trip.end_date && ` — ${formatDate(trip.end_date)}`}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/trips/${trip.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View Details
                        <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(trip.id)}
                        className="btn btn-danger btn-sm px-3"
                        title="Delete trip"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
