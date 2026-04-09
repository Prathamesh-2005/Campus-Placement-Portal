import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { logoutUser } from '../services/authService';
import { LogOut, LayoutDashboard, Briefcase, Settings, Building2, GraduationCap, FileStack } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (role === 'student') return '/student-dashboard';
    if (role === 'company') return '/company-dashboard';
    if (role === 'tnp') return '/tnp-dashboard';
    return '/';
  };

  const navigateToDashboard = () => {
    navigate(getDashboardRoute());
  };

  // Helper to check if a path is active
  const isActive = (path) => location.pathname === path;

  // Reusable NavItem component for clean code
  const NavItem = ({ label, icon: Icon, onClick, active }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
        ${active 
          ? 'bg-slate-100 text-slate-900' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  if (!user) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left - Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-sm tracking-tighter">CH</span>
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">CampusHire</span>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <NavItem 
              label="Dashboard" 
              icon={LayoutDashboard} 
              onClick={navigateToDashboard}
              active={isActive(getDashboardRoute())}
            />
            
            {role === 'student' && (
              <NavItem 
                label="Jobs" 
                icon={Briefcase} 
                onClick={() => navigate('/jobs')}
                active={isActive('/jobs')}
              />
            )}
            
            {role === 'company' && (
              <NavItem 
                label="All Applications" 
                icon={FileStack} 
                onClick={() => navigate('/all-applications')}
                active={isActive('/all-applications')}
              />
            )}
            
            {role === 'tnp' && (
              <NavItem 
                label="Manage Drives" 
                icon={Settings} 
                onClick={() => navigate('/tnp-dashboard')} // Assuming this might change to a specific route later
                active={isActive('/tnp-manage')}
              />
            )}
          </div>

          {/* Right - User Info & Actions */}
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-slate-900 text-sm font-medium leading-none">
                  {user.email.split('@')[0]}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1.5">
                  {role === 'company' && <Building2 className="w-3 h-3 text-slate-400" />}
                  {role === 'student' && <GraduationCap className="w-3 h-3 text-slate-400" />}
                  {role === 'tnp' && <Settings className="w-3 h-3 text-slate-400" />}
                  <span className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">
                    {role}
                  </span>
                </div>
              </div>
              
              {/* Avatar Placeholder */}
              <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-slate-200"></div>

            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-100"
              title="Logout"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;