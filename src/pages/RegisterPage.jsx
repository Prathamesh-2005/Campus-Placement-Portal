import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser, createStudentProfile, createCompanyProfile } from '../services/authService';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Building2, Loader, ArrowRight, GraduationCap, Shield } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [studentName, setStudentName] = useState('');
  const [branch, setBranch] = useState('');
  const [cgpa, setCgpa] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  const [tnpName, setTnpName] = useState('');
  const [tnpVerificationCode, setTnpVerificationCode] = useState('');

  const branches = ['CSE', 'IT', 'ECE', 'AIDS'];

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (role === 'student' && !studentName) { toast.error('Name is required'); return; }
    if (role === 'company' && !companyName) { toast.error('Company name is required'); return; }
    if (role === 'tnp' && !tnpName) { toast.error('Name is required'); return; }

    setLoading(true);
    try {
      const signupResult = await signupUser(email, password, role);
      if (!signupResult.success) {
        let errorMsg = signupResult.error;
        if (errorMsg.includes('429') || errorMsg.includes('rate')) errorMsg = 'Too many attempts. Please wait a few minutes.';
        else if (errorMsg.includes('already registered') || errorMsg.includes('User already exists')) errorMsg = 'This email is already registered.';
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      const userId = signupResult.user.id;

      if (role === 'student') {
        const profileResult = await createStudentProfile(userId, {
          name: studentName, branch, cgpa: parseFloat(cgpa), skills: [], resume_url: null,
        });
        if (!profileResult.success) { toast.error(profileResult.error); setLoading(false); return; }
      } else if (role === 'company') {
        const profileResult = await createCompanyProfile(userId, {
          company_name: companyName, description: companyDescription, location: '',
        });
        if (!profileResult.success) { toast.error(profileResult.error); setLoading(false); return; }
      }

      toast.success('✅ Account created successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'student',  Icon: GraduationCap, label: 'Student',           desc: 'Find & apply for jobs',    accent: 'text-blue-600',   ring: 'border-blue-600',   bg: 'bg-blue-50' },
    { value: 'company',  Icon: Building2,     label: 'Company',            desc: 'Post drives & hire talent', accent: 'text-emerald-600', ring: 'border-emerald-600', bg: 'bg-emerald-50' },
    { value: 'tnp',      Icon: Shield,        label: 'Placement Officer',  desc: 'Oversee placements',        accent: 'text-amber-600',  ring: 'border-amber-600',  bg: 'bg-amber-50' },
  ];

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
        .input-field-plain {
          width: 100%;
          padding: 0.625rem 0.875rem;
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
        .input-field::placeholder,
        .input-field-plain::placeholder { color: #94a3b8; }
        .input-field:hover, .input-field-plain:hover  { border-color: #94a3b8; }
        .input-field:focus, .input-field-plain:focus  { border-color: #1e293b; box-shadow: 0 0 0 3px rgba(15,23,42,0.08); }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-950 flex-col justify-between p-12 hero-grid relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <span className="tag text-slate-500">Campus Placement Platform</span>
          <h1 className="font-display text-5xl xl:text-6xl text-white mt-4 leading-[1.05]">
            Join<br />
            <span className="italic text-blue-400">CampusHire.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-xs font-body">
            Create your account in minutes. Choose your role and get access to the tools built for you.
          </p>
        </div>

        {/* Role overview */}
        <div className="space-y-3 font-body">
          {roles.map(({ value, Icon, label, desc, accent }) => (
            <div key={value} className="flex items-center gap-3">
              <Icon className={`w-4 h-4 flex-shrink-0 ${accent}`} />
              <div>
                <span className="text-slate-200 text-sm font-semibold">{label}</span>
                <span className="text-slate-500 text-xs ml-2">— {desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-slate-800 rounded-xl overflow-hidden border border-slate-800 font-body">
          {[{ v: '500+', l: 'Job Drives' }, { v: '2k+', l: 'Students' }, { v: '150+', l: 'Companies' }].map(({ v, l }) => (
            <div key={l} className="bg-slate-900 px-4 py-4">
              <div className="font-display text-2xl text-white">{v}</div>
              <div className="tag text-slate-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 bg-slate-50 font-body overflow-y-auto">
        <div className="w-full max-w-md">

          {/* mobile brand */}
          <div className="lg:hidden mb-8">
            <span className="tag text-slate-400">CampusHire</span>
            <h2 className="font-display text-3xl text-slate-900 mt-1">Create account.</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="px-8 py-6 border-b border-slate-100">
              <span className="tag text-slate-400">Register</span>
              <h3 className="text-xl font-semibold text-slate-900 mt-1">New account</h3>
            </div>

            <div className="px-8 py-7 space-y-6">

              {/* ── ROLE SELECTOR ── */}
              <div className="space-y-2">
                <span className="tag text-slate-400">I am a</span>
                <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                  {roles.map(({ value, Icon, label, accent, ring, bg }) => {
                    const active = role === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        className={`flex flex-col items-center gap-1.5 py-4 px-2 text-center transition-colors ${
                          active ? `${bg} border-b-2 ${ring}` : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? accent : 'text-slate-400'}`} />
                        <span className={`text-xs font-semibold leading-tight ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── FORM ── */}
              <form onSubmit={handleRegister} className="space-y-4 pt-2 border-t border-slate-100">

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="tag text-slate-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" className="input-field" required />
                  </div>
                </div>

                {/* Password row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="tag text-slate-500">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" className="input-field" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="tag text-slate-500">Confirm</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••" className="input-field" required />
                    </div>
                  </div>
                </div>

                {/* ── STUDENT FIELDS ── */}
                {role === 'student' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <span className="tag text-slate-400">Student details</span>

                    <div className="space-y-1.5">
                      <label className="tag text-slate-500">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                          placeholder="John Doe" className="input-field" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="tag text-slate-500">Branch</label>
                        <select value={branch} onChange={(e) => setBranch(e.target.value)}
                          className="input-field-plain" required>
                          <option value="">Select…</option>
                          {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="tag text-slate-500">CGPA</label>
                        <input type="number" value={cgpa} onChange={(e) => setCgpa(e.target.value)}
                          placeholder="7.5" step="0.01" min="0" max="10" className="input-field-plain" required />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── COMPANY FIELDS ── */}
                {role === 'company' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <span className="tag text-slate-400">Company details</span>

                    <div className="space-y-1.5">
                      <label className="tag text-slate-500">Company Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Tech Corp Inc." className="input-field" required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="tag text-slate-500">Description</label>
                      <textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)}
                        placeholder="Brief description of your company…" rows="2"
                        className="input-field-plain resize-none" />
                    </div>
                  </div>
                )}

                {/* ── TNP FIELDS ── */}
                {role === 'tnp' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <span className="tag text-slate-400">Officer details</span>

                    <div className="space-y-1.5">
                      <label className="tag text-slate-500">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input type="text" value={tnpName} onChange={(e) => setTnpName(e.target.value)}
                          placeholder="Dr. Smith" className="input-field" required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="tag text-slate-500">Verification Code</label>
                      <input type="text" value={tnpVerificationCode} onChange={(e) => setTnpVerificationCode(e.target.value)}
                        placeholder="Institution code" className="input-field-plain" required />
                      <p className="text-xs text-slate-400">Contact your administrator for this code.</p>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2 group">
                  {loading ? (
                    <><Loader className="w-4 h-4 animate-spin" />Creating…</>
                  ) : (
                    <>Create Account<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                  )}
                </button>
              </form>

              {/* divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="tag text-slate-300">or</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              <button onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
                Sign In Instead
              </button>

              <p className="text-center text-xs text-slate-400 pt-1">
                Need help?{' '}
                <a href="#" className="text-slate-600 hover:text-slate-900 font-semibold transition-colors">Contact support</a>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">© 2026 CampusHire. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;