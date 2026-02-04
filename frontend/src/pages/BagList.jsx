import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBags, deleteBag, duplicateBag } from '../api/client';

// Helper to categorize weight
const getWeightCategory = (grams) => {
  const kg = grams / 1000;
  if (kg < 5) return { label: 'Ultralight', color: 'var(--color-primary-600)' };
  if (kg < 9) return { label: 'Light', color: 'var(--color-success-600)' };
  if (kg < 13) return { label: 'Standard', color: 'var(--color-warning-600)' };
  return { label: 'Heavy', color: 'var(--color-accent-600)' };
};

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
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-primary-200)' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Loading bags...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading text-2xl md:text-3xl mb-1">My Bags</h1>
          <p className="text-caption">
            {bags.length === 0 
              ? 'Create your first gear configuration' 
              : `${bags.length} bag${bags.length !== 1 ? 's' : ''} configured`}
          </p>
        </div>
        <Link to="/bags/new" className="btn btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Bag
        </Link>
      </div>

      {bags.length === 0 ? (
        /* Empty State */
        <div className="card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" 
               style={{ backgroundColor: 'var(--color-secondary-100)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--color-secondary-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-heading text-xl mb-2">No bags yet</h2>
          <p className="text-body mb-6 max-w-sm mx-auto">
            Create your first bag to start tracking your gear weight. Each bag represents a complete pack configuration.
          </p>
          <Link to="/bags/new" className="btn btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create First Bag
          </Link>
        </div>
      ) : (
        /* Bags Grid */
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bags.map((bag, index) => {
            const weightCategory = getWeightCategory(bag.total_weight_grams);
            return (
              <div 
                key={bag.id} 
                className="card card-hover p-6 stagger-item flex flex-col justify-between"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  {/* Backpack Image */}
                  <div className="w-14 h-14 rounded-lg mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center"
                       style={{ backgroundColor: '#ffffff' }}>
                    {bag.backpack_image_url ? (
                      <img 
                        src={bag.backpack_image_url} 
                        alt={`${bag.backpack_brand} ${bag.backpack_model}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <svg className="w-6 h-6" style={{ color: 'var(--color-neutral-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-heading text-lg truncate">{bag.name}</h3>
                    <p className="text-caption text-sm mt-1">
                      <span className="truncate">{bag.backpack_brand} {bag.backpack_model}</span>
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold" style={{ color: weightCategory.color }}>
                      {(bag.total_weight_grams / 1000).toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>kg</div>
                  </div>
                </div>
                
                {/* Weight Badge */}
                <div className="mb-4">
                  <span className="badge" style={{ 
                    backgroundColor: `${weightCategory.color}15`,
                    color: weightCategory.color
                  }}>
                    {weightCategory.label}
                  </span>
                </div>
                
                {bag.description && (
                  <p className="text-body text-sm mb-4 line-clamp-2">{bag.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-neutral-100)' }}>
                  <Link
                    to={`/bags/${bag.id}/edit`}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDuplicate(bag.id, bag.name)}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Clone
                  </button>
                  <button
                    onClick={() => handleDelete(bag.id)}
                    className="btn btn-danger btn-sm px-3"
                    title="Delete bag"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
