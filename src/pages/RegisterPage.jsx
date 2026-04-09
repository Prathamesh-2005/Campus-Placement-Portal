import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser, createStudentProfile, createCompanyProfile } from '../services/authService';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Building2, Loader, ArrowRight, Briefcase } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Student fields
  const [studentName, setStudentName] = useState('');
  const [branch, setBranch] = useState('');
  const [cgpa, setCgpa] = useState('');

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // TNP fields
  const [tnpName, setTnpName] = useState('');
  const [tnpVerificationCode, setTnpVerificationCode] = useState('');

  const branches = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'Other'];

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (role === 'student' && !studentName) {
      toast.error('Name is required');
      return;
    }

    if (role === 'company' && !companyName) {
      toast.error('Company name is required');
      return;
    }

    if (role === 'tnp' && !tnpName) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);

    try {
      const signupResult = await signupUser(email, password, role);
      if (!signupResult.success) {
        let errorMsg = signupResult.error;
        if (errorMsg.includes('429') || errorMsg.includes('rate')) {
          errorMsg = 'Too many attempts. Please wait a few minutes.';
        } else if (errorMsg.includes('already registered') || errorMsg.includes('User already exists')) {
          errorMsg = 'This email is already registered.';
        }
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      const userId = signupResult.user.id;

      if (role === 'student') {
        const profileResult = await createStudentProfile(userId, {
          name: studentName,
          branch,
          cgpa: parseFloat(cgpa),
          skills: [],
          resume_url: null,
        });

        if (!profileResult.success) {
          toast.error(profileResult.error);
          setLoading(false);
          return;
        }
      } else if (role === 'company') {
        const profileResult = await createCompanyProfile(userId, {
          company_name: companyName,
          description: companyDescription,
          location: '',
        });

        if (!profileResult.success) {
          toast.error(profileResult.error);
          setLoading(false);
          return;
        }
      }

      toast.success('✅ Account created successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
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
        <div className="grid md:grid-cols-2 gap-8 items-start md:items-center">
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
                { icon: '🎓', text: 'Perfect fit for all roles' },
                { icon: '⚙️', text: 'Easy account setup' },
                { icon: '🔒', text: 'Secure & trusted' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-slate-700 font-semibold group-hover:text-slate-900 transition-colors">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Register Form */}
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header with gradient background */}
              <div className="bg-linear-to-r from-slate-900 to-slate-800 px-8 py-8 overflow-hidden sticky top-0 z-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10">
                  <div className="md:hidden mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4">
                      <Briefcase className="w-6 h-6 text-blue-300" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white">Create Account</h2>
                  <p className="text-slate-300 mt-2 font-medium">Choose your role and join CampusHire</p>
                </div>
              </div>

              {/* Form content */}
              <div className="px-8 py-8 space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">I am a:</label>
                  {[
                    { value: 'student', icon: User, label: 'Student', desc: 'Find and apply for jobs' },
                    { value: 'company', icon: Building2, label: 'Company', desc: 'Post jobs and hire' },
                    { value: 'tnp', icon: '👨‍💼', label: 'Placement Officer', desc: 'Manage placements' }
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = role === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setRole(option.value)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                          {typeof Icon === 'string' ? (
                            <span className="text-xl">{Icon}</span>
                          ) : (
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{option.label}</p>
                          <p className="text-xs text-slate-500">{option.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-4 pt-4 border-t border-slate-200">
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

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-blue-500" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Student Fields */}
                  {role === 'student' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 h-5 w-5 text-blue-500" />
                          <input
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-900">Branch</label>
                          <select
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm font-medium"
                            required
                          >
                            <option value="">Select branch</option>
                            {branches.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-900">CGPA</label>
                          <input
                            type="number"
                            value={cgpa}
                            onChange={(e) => setCgpa(e.target.value)}
                            placeholder="7.5"
                            step="0.01"
                            min="0"
                            max="10"
                            className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Company Fields */}
                  {role === 'company' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900">Company Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-blue-500" />
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Tech Corp Inc."
                            className="w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900">Description</label>
                        <textarea
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          placeholder="Brief description..."
                          rows="2"
                          className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm shadow-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* TNP Fields */}
                  {role === 'tnp' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 h-5 w-5 text-blue-500" />
                          <input
                            type="text"
                            value={tnpName}
                            onChange={(e) => setTnpName(e.target.value)}
                            placeholder="Dr. Smith"
                            className="w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900">Verification Code</label>
                        <input
                          type="text"
                          value={tnpVerificationCode}
                          onChange={(e) => setTnpVerificationCode(e.target.value)}
                          placeholder="Institution code"
                          className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-linear-to-r from-white to-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                          required
                        />
                        <p className="text-xs text-slate-500 mt-1 font-medium">Contact your administrator for the code</p>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Account
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
                    <span className="px-3 bg-white text-slate-500 font-medium">Already have an account?</span>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 px-4 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-semibold rounded-lg transition-all duration-200 shadow-sm"
                >
                  Sign In Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
