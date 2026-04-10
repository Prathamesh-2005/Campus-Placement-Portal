import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader, ArrowRight, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-white flex font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
        .font-display { font-family: 'Instrument Serif', serif; }
        .font-body   { font-family: 'DM Sans', sans-serif; }
        .hero-grid {
          background-image:
            linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .tag {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem 0.625rem 2.75rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #0f172a;
          background: #ffffff;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          outline: none;
        }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:hover  { border-color: #94a3b8; }
        .input-field:focus  { border-color: #1e293b; box-shadow: 0 0 0 3px rgba(15,23,42,0.08); }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 flex-col justify-between p-12 hero-grid relative overflow-hidden">
        {/* subtle corner glow */}
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* top — brand */}
        <div>
          <span className="tag text-slate-500">Campus Placement Platform</span>
          <h1 className="font-display text-5xl xl:text-6xl text-white mt-4 leading-[1.05]">
            Welcome<br />
            <span className="italic text-blue-400">back.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-xs font-body">
            Sign in to manage your placement journey — applications, drives, and results in one place.
          </p>
        </div>

        {/* middle — feature list */}
        <div className="space-y-3 font-body">
          {[
            'Browse & apply to active job drives',
            'Real-time application status tracking',
            'Verified student & company profiles',
          ].map((text) => (
            <div key={text} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-400 text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* bottom — stats */}
        <div className="grid grid-cols-3 gap-px bg-slate-800 rounded-xl overflow-hidden border border-slate-800 font-body">
          {[
            { v: '500+', l: 'Job Drives' },
            { v: '2k+',  l: 'Students' },
            { v: '95%',  l: 'Success' },
          ].map(({ v, l }) => (
            <div key={l} className="bg-slate-900 px-4 py-4">
              <div className="font-display text-2xl text-white">{v}</div>
              <div className="tag text-slate-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50 font-body">
        <div className="w-full max-w-sm">

          {/* mobile brand */}
          <div className="lg:hidden mb-8">
            <span className="tag text-slate-400">CampusHire</span>
            <h2 className="font-display text-3xl text-slate-900 mt-1">Welcome back.</h2>
          </div>

          {/* card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* card header */}
            <div className="px-8 py-6 border-b border-slate-100">
              <span className="tag text-slate-400">Sign in</span>
              <h3 className="text-xl font-semibold text-slate-900 mt-1">Your account</h3>
            </div>

            {/* form */}
            <div className="px-8 py-7 space-y-5">
              <form onSubmit={handleLogin} className="space-y-5">

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="tag text-slate-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="tag text-slate-500">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1 group"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="tag text-slate-300">or</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              {/* Register */}
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Create Account
              </button>

              <p className="text-center text-xs text-slate-400 pt-1">
                Need help?{' '}
                <a href="#" className="text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                  Contact support
                </a>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">© 2026 CampusHire. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;