import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser, createStudentProfile, createCompanyProfile } from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // student, company, tnp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Branches dropdown options
  const branches = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'Other'];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (role === 'student' && !studentName) {
      setError('Name is required');
      return;
    }

    if (role === 'company' && !companyName) {
      setError('Company name is required');
      return;
    }

    if (role === 'tnp' && !tnpName) {
      setError('Name is required');
      return;
    }

    if (role === 'tnp' && !tnpVerificationCode) {
      setError('Verification code is required');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create user
      const signupResult = await signupUser(email, password, role);
      if (!signupResult.success) {
        // Better error messages for specific errors
        let errorMsg = signupResult.error;
        if (errorMsg.includes('429') || errorMsg.includes('rate')) {
          errorMsg = 'Too many signup attempts. Please wait a few minutes and try again with a different email if possible.';
        } else if (errorMsg.includes('already registered') || errorMsg.includes('User already exists')) {
          errorMsg = 'This email is already registered. Try logging in instead.';
        }
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const userId = signupResult.user.id;

      // Step 2: Create role-specific profile
      if (role === 'student') {
        const profileResult = await createStudentProfile(userId, {
          name: studentName,
          branch,
          cgpa: parseFloat(cgpa),
          skills: [],
          resume_url: null,
        });

        if (!profileResult.success) {
          setError(profileResult.error);
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
          setError(profileResult.error);
          setLoading(false);
          return;
        }
      }
      // TNP profile creation would go here if needed

      // Success - redirect to login
      navigate('/login', {
        state: { message: 'Registration successful! Please login.' },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-center items-center p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-lg mb-6">
            <span className="text-3xl font-bold text-blue-600">CH</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">CampusHire</h1>
          <p className="text-blue-100 text-lg mb-12">Smart Campus Placement Portal</p>
          
          <div className="bg-white/10 rounded-lg p-6 text-left">
            <h3 className="text-white font-semibold mb-4">Join as:</h3>
            <div className="space-y-3 text-blue-100 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">👤</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Student</p>
                  <p className="text-xs mt-1">Browse jobs, apply for positions, track applications</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">🏢</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Company</p>
                  <p className="text-xs mt-1">Post jobs, manage applications, hire talent</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">👨‍💼</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Placement Officer</p>
                  <p className="text-xs mt-1">Approve jobs, monitor placements, manage process</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-1">Join CampusHire</p>
          </div>

          {/* Register Card */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-600 mb-6">Choose your role and create your account</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">I am a:</label>
              <div className="space-y-2">
                {[
                  { value: 'student', label: '👤 Student', desc: 'Find and apply for jobs' },
                  { value: 'company', label: '🏢 Company', desc: 'Post jobs and hire' },
                  { value: 'tnp', label: '👨‍💼 Placement Officer', desc: 'Manage placements' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition" style={{ borderColor: role === option.value ? '#2563eb' : '#e5e7eb', backgroundColor: role === option.value ? '#eff6ff' : '#ffffff' }}>
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role === option.value}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-600">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Student Fields */}
              {role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Branch</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    >
                      <option value="">Select your branch</option>
                      {branches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">CGPA</label>
                    <input
                      type="number"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="7.5"
                      step="0.01"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </>
              )}

              {/* Company Fields */}
              {role === 'company' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Tech Corp Inc."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Company Description</label>
                    <textarea
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="Brief description of your company..."
                      rows="3"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                </>
              )}

              {/* TNP Fields */}
              {role === 'tnp' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={tnpName}
                      onChange={(e) => setTnpName(e.target.value)}
                      placeholder="Dr. Smith"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">TNP Verification Code</label>
                    <input
                      type="text"
                      value={tnpVerificationCode}
                      onChange={(e) => setTnpVerificationCode(e.target.value)}
                      placeholder="Enter institution verification code"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">Contact your institution administrator for the verification code</p>
                  </div>
                </>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <p className="text-gray-500 text-sm">Already have an account?</p>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Login link */}
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
