import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { logoutUser } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const navigateToDashboard = () => {
    if (role === 'student') {
      navigate('/student-dashboard');
    } else if (role === 'company') {
      navigate('/company-dashboard');
    } else if (role === 'tnp') {
      navigate('/tnp-dashboard');
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CH</span>
            </div>
            <span className="text-white font-bold text-lg">CampusHire</span>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={navigateToDashboard}
              className="text-gray-300 hover:text-white transition px-3 py-2 text-sm font-medium"
            >
              Dashboard
            </button>
            {role === 'student' && (
              <button
                onClick={() => navigate('/jobs')}
                className="text-gray-300 hover:text-white transition px-3 py-2 text-sm font-medium"
              >
                Jobs
              </button>
            )}
            {role === 'tnp' && (
              <button
                onClick={() => navigate('/tnp-dashboard')}
                className="text-gray-300 hover:text-white transition px-3 py-2 text-sm font-medium"
              >
                Manage
              </button>
            )}
          </div>

          {/* Right - User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-gray-300 text-sm font-medium">{user.email}</p>
              <p className="text-gray-500 text-xs capitalize">{role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
