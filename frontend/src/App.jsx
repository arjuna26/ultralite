import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll'
import Landing from './pages/Landing';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import BagList from './pages/BagList';
import BagBuilder from './pages/BagBuilder';
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail';
import GearCatalog from './pages/GearCatalog';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { getMe, logout as apiLogout } from './api/client';
import { Analytics } from "@vercel/analytics/react"

// Check if we should show coming soon page
const isComingSoon = import.meta.env.VITE_COMING_SOON === 'true';

// Wrapper component to access navigate within Router
function AppContent({ user, setUser, loading }) {
  const navigate = useNavigate();

  const handleLogin = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  }, [setUser]);

  const handleLogout = useCallback(() => {
    apiLogout(); // Clears localStorage
    setUser(null);
    navigate('/'); // Redirect to landing page
  }, [setUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center animate-pulse" style={{ backgroundColor: 'var(--color-primary-600)' }}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen topo-pattern">
      <ScrollToTop />
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        {/* Public landing page */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/bags" /> : <Landing />} 
        />
        
        <Route 
          path="/login" 
          element={user ? <Navigate to="/bags" /> : <Login onLogin={handleLogin} />} 
        />

        {/* Password reset - public route */}
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />

        {/* OAuth callback - public route */}
        <Route 
          path="/auth/callback" 
          element={<OAuthCallback onLogin={handleLogin} />} 
        />

        {/* Public info pages */}
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        
        <Route 
          path="/bags" 
          element={user ? <BagList /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/bags/new" 
          element={user ? <BagBuilder /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/bags/:id/edit" 
          element={user ? <BagBuilder /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/trips" 
          element={user ? <TripList /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/trips/:id" 
          element={user ? <TripDetail /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/gear" 
          element={user ? <GearCatalog /> : <Navigate to="/login" />} 
        />
      </Routes>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If coming soon mode, skip auth check
    if (isComingSoon) {
      setLoading(false);
      return;
    }

    // Check for existing token/session
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
        } catch (err) {
          console.warn('Token validation failed:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // If coming soon mode, just show that page
  if (isComingSoon) {
    return <ComingSoon />;
  }

  return (
    <BrowserRouter>
      <SmoothScroll>
        <AppContent user={user} setUser={setUser} loading={loading} />
      </SmoothScroll>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
