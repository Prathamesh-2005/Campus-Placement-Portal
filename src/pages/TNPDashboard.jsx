import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { getPendingJobDrives, approveJobDrive, rejectJobDrive, getAdminStatistics, getRecentActivity } from '../services/tnpService';
import { 
  Users, Building2, Briefcase, FileText, AlertCircle,
  Clock, CheckCircle2, XCircle, TrendingUp, Calendar, MapPin, 
  IndianRupee, GraduationCap, Loader, ArrowRight
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
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader className="w-12 h-12 text-slate-900 animate-spin mb-4" />
          <p className="text-slate-600 font-semibold">Loading TNP dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
        .font-display { font-family: 'Instrument Serif', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
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
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
        }
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: #0f172a;
          background: #ffffff;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          outline: none;
        }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:hover { border-color: #94a3b8; }
        .input-field:focus { border-color: #1e293b; box-shadow: 0 0 0 3px rgba(15,23,42,0.08); }
      `}</style>

      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="font-body hero-grid border-b border-slate-200 py-16 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="tag text-slate-400">Placement Administration</span>
              <h1 className="font-display text-5xl lg:text-6xl text-slate-900 mt-2 leading-tight">
                <span className="italic">Manage</span> placements
              </h1>
            </div>
            <div className="max-w-xs text-sm text-slate-500 leading-relaxed mt-4 lg:mt-0">
              Approve job drives, verify profiles, and monitor campus placement analytics in real-time.
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
              {[
                { value: stats.users?.student || 0, label: 'Total Students', icon: Users, color: 'text-blue-600' },
                { value: stats.users?.company || 0, label: 'Companies', icon: Building2, color: 'text-emerald-600' },
                { value: stats.jobs?.approved || 0, label: 'Approved Drives', icon: Briefcase, color: 'text-amber-600' },
                {
                  value: Object.values(stats.applications || {}).reduce((sum, count) => sum + count, 0),
                  label: 'Total Applications',
                  icon: TrendingUp,
                  color: 'text-rose-600'
                },
              ].map(({ value, label, icon: Icon, color }) => (
                <div key={label} className="bg-white px-6 py-6 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-start gap-3 mb-4">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="text-3xl font-display font-semibold text-slate-900 mb-1">{value}</div>
                  <div className="tag text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PENDING APPROVALS ── */}
      <section className="font-body py-16 px-6 lg:px-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="tag text-slate-400">Awaiting Review</span>
              <h2 className="font-display text-3xl lg:text-4xl text-slate-900 mt-1">Pending Job Drives</h2>
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 tag px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              {pendingJobs.length} {pendingJobs.length === 1 ? 'Drive' : 'Drives'}
            </div>
          </div>

          {pendingJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center card-hover">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                No pending job drives to review. All submissions have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100 bg-linear-to-r from-white to-slate-50">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <h3 className="font-display text-2xl text-slate-900 mb-2">{job.title}</h3>
                        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          {job.companies?.company_name}
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 tag px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4" />
                        Pending
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-linear-to-br from-slate-50 to-blue-50 border-b border-slate-100">
                    <div>
                      <p className="tag text-slate-400 mb-1.5">Package</p>
                      <p className="text-lg font-semibold text-emerald-600 flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />₹{job.package}
                      </p>
                    </div>
                    <div>
                      <p className="tag text-slate-400 mb-1.5">Location</p>
                      <p className="text-lg font-semibold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-blue-600" />{job.location}
                      </p>
                    </div>
                    <div>
                      <p className="tag text-slate-400 mb-1.5">Min CGPA</p>
                      <p className="text-lg font-semibold text-slate-900 flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />{job.eligibility}
                      </p>
                    </div>
                    <div>
                      <p className="tag text-slate-400 mb-1.5">Deadline</p>
                      <p className="text-lg font-semibold text-rose-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.deadline).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {job.description && (
                    <div className="px-6 py-4 border-b border-slate-100 bg-white">
                      <p className="text-slate-600 text-sm leading-relaxed">{job.description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-6 py-4 flex gap-3 bg-white">
                    <button
                      onClick={() => handleApprove(job.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors group"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <button
                      onClick={() => setSelectedJobForRejection(job.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>

                  {/* Rejection Modal */}
                  {selectedJobForRejection === job.id && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                          <h3 className="text-xl font-semibold text-slate-900">Rejection Reason</h3>
                        </div>
                        <p className="text-slate-600 text-sm mb-6">
                          Please provide a detailed reason for rejecting this job drive.
                        </p>
                        <textarea
                          placeholder="e.g. Salary package is below institutional guidelines..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="input-field min-h-[120px] resize-none mb-6 font-body"
                        />
                        <div className="flex gap-3 justify-end pt-6 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setSelectedJobForRejection(null);
                              setRejectionReason('');
                            }}
                            className="px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(job.id)}
                            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── RECENT ACTIVITY ── */}
      {activity && (
        <section className="font-body py-16 px-6 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <span className="tag text-slate-400">Activity</span>
            <h2 className="font-display text-3xl lg:text-4xl text-slate-900 mt-1 mb-12">Recent Updates</h2>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Applications */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Applications
                </h3>
                <div className="space-y-2">
                  {activity.applications.slice(0, 5).length === 0 ? (
                    <p className="text-slate-500 text-sm">No recent applications</p>
                  ) : (
                    activity.applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="bg-slate-50 rounded-lg p-4 card-hover border border-slate-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs flex-shrink-0">
                            {app.students?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{app.students?.name}</p>
                            <p className="text-slate-600 text-xs truncate">{app.job_drives?.title}</p>
                            <p className="text-slate-400 text-xs mt-1">
                              {new Date(app.applied_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Job Drives */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  Job Drives
                </h3>
                <div className="space-y-2">
                  {activity.jobDrives.slice(0, 5).length === 0 ? (
                    <p className="text-slate-500 text-sm">No recent drives</p>
                  ) : (
                    activity.jobDrives.slice(0, 5).map((job) => (
                      <div key={job.id} className="bg-slate-50 rounded-lg p-4 card-hover border border-slate-100">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{job.title}</p>
                            <p className="text-slate-600 text-xs flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3 flex-shrink-0 text-blue-600" />
                              <span className="truncate">{job.companies?.company_name}</span>
                            </p>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                              job.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : job.status === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {job.status === 'approved' ? '✅' : job.status === 'pending' ? '⏳' : '❌'}{' '}
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TNPDashboard;
