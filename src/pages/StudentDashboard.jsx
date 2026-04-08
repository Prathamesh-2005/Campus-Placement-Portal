import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import useAuth from '../hooks/useAuth';
import { getJobDrives, getStudentApplications, applyForJob } from '../services/jobService';
import { getStudentProfile } from '../services/authService';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [tab, setTab] = useState('available'); // available, applications

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);

      // Load student profile
      const profile = await getStudentProfile(user.id);
      setStudentProfile(profile);

      // Load approved job drives
      const jobsResult = await getJobDrives({ onlyApproved: true });
      if (jobsResult.success) {
        setJobs(jobsResult.data);
      }

      // Load applications
      const applResult = await getStudentApplications(user.id);
      if (applResult.success) {
        setApplications(applResult.data);
        const appliedJobIds = new Set(applResult.data.map((a) => a.job_drives.id));
        setAppliedJobs(appliedJobIds);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleApply = async (jobId) => {
    if (!studentProfile) {
      alert('Please complete your profile first');
      return;
    }

    const result = await applyForJob(studentProfile.id, jobId);
    if (result.success) {
      setAppliedJobs((prev) => new Set([...prev, jobId]));
      alert('Application submitted successfully!');
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {studentProfile?.name || 'Student'}!
            </h1>
            <p className="text-blue-100">Find and apply to your dream placements</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-blue-100 text-sm">CGPA</p>
              <p className="text-2xl font-bold">{studentProfile?.cgpa}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-blue-100 text-sm">Branch</p>
              <p className="text-2xl font-bold">{studentProfile?.branch}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-blue-100 text-sm">Applications</p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab('available')}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              tab === 'available'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Available Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setTab('applications')}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              tab === 'applications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Applications ({applications.length})
          </button>
        </div>

        {/* Content */}
        {tab === 'available' ? (
          <div>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No job drives available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isApplied={appliedJobs.has(job.id)}
                    onApply={() => handleApply(job.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">You haven't applied to any jobs yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 flex items-start justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {app.job_drives.title}
                      </h3>
                      <p className="text-gray-600">
                        {app.job_drives.companies.company_name}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        app.status === 'selected'
                          ? 'bg-green-100 text-green-700'
                          : app.status === 'shortlisted'
                          ? 'bg-blue-100 text-blue-700'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
