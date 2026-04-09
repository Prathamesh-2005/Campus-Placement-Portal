import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader, ArrowRight, Briefcase } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await loginUser(email, password);
    
    if (result.success) {
      toast.success('✅ Welcome back!');
      navigate('/');
    } else {
      let errorMsg = result.error;
      if (errorMsg.includes('429') || errorMsg.includes('rate')) {
        errorMsg = 'Too many attempts. Please wait a few minutes.';
      } else if (errorMsg.includes('Invalid login')) {
        errorMsg = 'Invalid email or password.';
      }
      toast.error(errorMsg);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center px-4 py-12">
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden md:block space-y-8">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-6xl font-bold text-slate-900 tracking-tight mb-3">CampusHire</h1>
              <p className="text-lg text-slate-600 font-semibold">Smart Campus Placement Portal</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '🎯', text: 'Connect students with opportunities', color: 'blue' },
                { icon: '📊', text: 'Manage placements efficiently', color: 'emerald' },
                { icon: '⚡', text: 'Real-time application tracking', color: 'amber' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className={`text-3xl`}>{item.icon}</div>
                  <span className="text-slate-700 font-semibold group-hover:text-slate-900 transition-colors">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 font-medium">© 2024 CampusHire. All rights reserved.</p>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
              {/* Header with gradient background */}
              <div className="bg-linear-to-r from-slate-900 to-slate-800 px-8 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10">
                  <div className="md:hidden mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4">
                      <Briefcase className="w-6 h-6 text-blue-300" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                  <p className="text-slate-300 mt-2 font-medium">Sign in to your account to continue</p>
                </div>
              </div>

              {/* Form content */}
              <div className="px-8 py-8 space-y-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-blue-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-blue-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-slate-500 font-medium">Don't have an account?</span>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-2.5 px-4 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-semibold rounded-lg transition-all duration-200 shadow-sm"
                >
                  Create Account
                </button>

                {/* Footer */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Need help? <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Contact support</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
