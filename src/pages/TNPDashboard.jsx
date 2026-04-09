import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { getPendingJobDrives, approveJobDrive, rejectJobDrive, getAdminStatistics, getRecentActivity } from '../services/tnpService';
import { 
  Users, Building2, Briefcase, FileText, Edit2, AlertCircle,
  Clock, CheckCircle2, XCircle, TrendingUp, Calendar, MapPin, 
  IndianRupee, GraduationCap
} from 'lucide-react';

const TNPDashboard = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedJobForRejection, setSelectedJobForRejection] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const jobsResult = await getPendingJobDrives();
      if (jobsResult.success) {
        setPendingJobs(jobsResult.data);
      }

      const statsResult = await getAdminStatistics();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      const activityResult = await getRecentActivity();
      if (activityResult.success) {
        setActivity(activityResult.data);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleApprove = async (jobId) => {
    const result = await approveJobDrive(jobId);
    if (result.success) {
      setPendingJobs((prev) => prev.filter((j) => j.id !== jobId));
      const emailCount = result.emailsSent || 0;
      toast.success(`✅ Job drive approved! 📧 Notification emails sent to ${emailCount} eligible students`);
    } else {
      toast.error('Error approving job: ' + (result.error || 'Unknown error'));
    }
  };

  const handleReject = async (jobId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const result = await rejectJobDrive(jobId, rejectionReason);
    if (result.success) {
      setPendingJobs((prev) => prev.filter((j) => j.id !== jobId));
      setSelectedJobForRejection(null);
      setRejectionReason('');
      toast.success('Job drive rejected!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading TNP dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 pb-16">
      <Navbar />

      {/* Blur Backdrop for Rejection Modal */}
      {selectedJobForRejection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 animate-in fade-in duration-300"></div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Card */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-11 w-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">TNP Dashboard</h1>
                <p className="text-slate-300 mt-1 font-medium">Manage campus placement drives and student applications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 hover:shadow-xl transition-all hover:border-slate-200 hover:scale-105 transform">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">👥</span>
              </div>
              <p className="text-slate-600 text-sm font-semibold">Total Students</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.users?.student || 0}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 hover:shadow-xl transition-all hover:border-slate-200 hover:scale-105 transform">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">🏢</span>
              </div>
              <p className="text-slate-600 text-sm font-semibold">Total Companies</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.users?.company || 0}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 hover:shadow-xl transition-all hover:border-slate-200 hover:scale-105 transform">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">📋</span>
              </div>
              <p className="text-slate-600 text-sm font-semibold">Approved Drives</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.jobs?.approved || 0}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 hover:shadow-xl transition-all hover:border-slate-200 hover:scale-105 transform">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                </div>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">📊</span>
              </div>
              <p className="text-slate-600 text-sm font-semibold">Total Applications</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {Object.values(stats.applications || {}).reduce((sum, count) => sum + count, 0)}
              </p>
            </div>
          </div>
        )}

        {/* Pending Approvals Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Approvals
            </h2>
            <span className="text-sm bg-amber-50 text-amber-700 px-3.5 py-1 rounded-full font-semibold">
              {pendingJobs.length} Awaiting
            </span>
          </div>

          {pendingJobs.length === 0 ? (
            <div className="bg-linear-to-br from-white to-slate-50 rounded-2xl border border-slate-100 border-dashed p-12 text-center flex flex-col items-center">
              <div className="h-14 w-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">All Caught Up!</h3>
              <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                There are no pending job drives to review. All submissions have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden hover:shadow-lg transition-all hover:border-slate-200">
                  
                  {/* Job Header */}
                  <div className="p-5 border-b border-slate-100 bg-linear-to-r from-white to-slate-50">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{job.title}</h3>
                        <p className="text-slate-600 font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          {job.companies?.company_name}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-bold rounded-lg border border-amber-200 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending Review
                      </div>
                    </div>
                  </div>

                  {/* Job Details Grid */}
                  <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-linear-to-br from-slate-50 to-blue-50">
                    <div className="hover:bg-white p-3 rounded-lg transition">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Package</p>
                      <p className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4" />
                        ₹{job.package}
                      </p>
                    </div>
                    <div className="hover:bg-white p-3 rounded-lg transition">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</p>
                      <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {job.location}
                      </p>
                    </div>
                    <div className="hover:bg-white p-3 rounded-lg transition">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Min CGPA</p>
                      <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-emerald-500" />
                        {job.eligibility}
                      </p>
                    </div>
                    <div className="hover:bg-white p-3 rounded-lg transition">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deadline</p>
                      <p className="text-lg font-bold text-rose-600 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {job.description && (
                    <div className="px-6 py-4 border-b border-slate-100 bg-white">
                      <p className="text-slate-600 text-sm font-medium leading-relaxed">{job.description}</p>
                    </div>
                  )}

                  {/* Rejection Reason Modal */}
                  {selectedJobForRejection === job.id && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
                      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-100 shadow-2xl p-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 pointer-events-auto">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-rose-600" />
                          Rejection Reason
                        </h3>
                        <p className="text-slate-600 font-medium mb-4">Please provide a detailed reason for rejecting this job drive.</p>
                        <textarea
                          placeholder="e.g. Salary package is below institutional guidelines. Please resubmit with adjusted compensation..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg bg-linear-to-r from-white to-blue-50 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-300 focus:ring-offset-1 transition-all shadow-sm min-h-[120px] resize-none"
                          rows="5"
                        />
                        <div className="mt-6 flex items-center gap-3 pt-6 border-t border-slate-200 justify-end">
                          <button
                            onClick={() => {
                              setSelectedJobForRejection(null);
                              setRejectionReason('');
                            }}
                            className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(job.id)}
                            className="px-6 py-2.5 bg-linear-to-r from-rose-600 to-rose-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:from-rose-700 hover:to-rose-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-1"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-5 bg-white flex gap-3">
                    <button
                      onClick={() => handleApprove(job.id)}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedJobForRejection(job.id)}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-rose-600 to-rose-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:from-rose-700 hover:to-rose-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-1 gap-2"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        {activity && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Applications */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" />
                Recent Applications
              </h2>
              <div className="space-y-3">
                {activity.applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md hover:border-slate-200 transition-all shadow-sm hover:scale-102 transform">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                        {app.students?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{app.students?.name}</p>
                        <p className="text-slate-600 text-sm font-medium">Applied for {app.job_drives?.title}</p>
                        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Job Drives */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-emerald-500" />
                Recent Job Drives
              </h2>
              <div className="space-y-3">
                {activity.jobDrives.slice(0, 5).map((job) => (
                  <div key={job.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md hover:border-slate-200 transition-all shadow-sm hover:scale-102 transform">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{job.title}</p>
                        <p className="text-slate-600 text-sm font-medium flex items-center gap-1 mt-1">
                          <Building2 className="h-3.5 w-3.5 text-blue-500" />
                          by {job.companies?.company_name}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                        job.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        job.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {job.status === 'approved' && '✅ Approved'}
                        {job.status === 'pending' && '⏳ Pending'}
                        {job.status === 'rejected' && '❌ Rejected'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TNPDashboard;
