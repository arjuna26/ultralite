import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import BagList from './pages/BagList';
import BagBuilder from './pages/BagBuilder';
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail';
import { getMe } from './api/client';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/bags" /> : <Login onLogin={handleLogin} />} 
          />
          
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
            path="/" 
            element={<Navigate to={user ? "/bags" : "/login"} />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;