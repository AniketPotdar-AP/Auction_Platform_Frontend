import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Auctions from './pages/Auctions';
import CreateAuction from './pages/CreateAuction';
import AuctionDetail from './pages/AuctionDetail';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerifications from './pages/AdminVerifications';
import AdminApprovals from './pages/AdminApprovals';
import AdminUsers from './pages/AdminUsers';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { useAuthStore } from './stores/authStore';

function App() {
  const { loadUser, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? (user?.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard />) : <Navigate to="/login" />}
          />
          <Route
            path="/auctions"
            element={isAuthenticated ? <Auctions /> : <Navigate to="/login" />}
          />
          <Route
            path="/auctions/:id"
            element={isAuthenticated ? <AuctionDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/payment/:auctionId"
            element={isAuthenticated ? <Payment /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/notifications"
            element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />}
          />
          <Route
            path="/create-auction"
            element={isAuthenticated ? (user?.role === 'admin' ? <Navigate to="/admin" /> : <CreateAuction />) : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/verifications"
            element={isAuthenticated ? <AdminVerifications /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/approvals"
            element={isAuthenticated ? <AdminApprovals /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/users"
            element={isAuthenticated ? <AdminUsers /> : <Navigate to="/login" />}
          />
          <Route
            path="/contact"
            element={<ContactUs />}
          />
          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />
          <Route
            path="/terms-of-service"
            element={<TermsOfService />}
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
