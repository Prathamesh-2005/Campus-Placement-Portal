import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AllApplicationsPage from './pages/AllApplicationsPage';
import TNPDashboard from './pages/TNPDashboard';

// Global Loading Component
const LoadingSpinner = ({ withNavbar = false }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    {withNavbar && <Navbar />}
    <div className="flex-1 flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></div>
    </div>
  </div>
);

// Unauthorized page
const UnauthorizedPage = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center px-4">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-6">
        <span className="text-3xl">🔒</span>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-600 mb-8 max-w-sm">You don't have permission to access this page</p>
      <a
        href="/"
        className="inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
      >
        Go Home
      </a>
    </div>
  </div>
);

// Home/Redirect page based on role
const HomePage = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner withNavbar={true} />;
  }

  if (!user) {
    return <LandingPage />;
  }

  // Redirect based on role
  if (role === 'student') {
    return <Navigate to="/student-dashboard" replace />;
  } else if (role === 'company') {
    return <Navigate to="/company-dashboard" replace />;
  } else if (role === 'tnp') {
    return <Navigate to="/tnp-dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Home Route - Redirects based on role */}
          <Route path="/" element={<HomePage />} />

          {/* Protected Routes - Student */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Company */}
          <Route
            path="/company-dashboard"
            element={
              <ProtectedRoute requiredRole="company">
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/all-applications"
            element={
              <ProtectedRoute requiredRole="company">
                <AllApplicationsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - TNP */}
          <Route
            path="/tnp-dashboard"
            element={
              <ProtectedRoute requiredRole="tnp">
                <TNPDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
