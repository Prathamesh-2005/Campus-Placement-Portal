import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getPendingJobDrives, approveJobDrive, rejectJobDrive, getAdminStatistics, getRecentActivity } from '../services/tnpService';

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
      alert(`✅ Job drive approved!\n📧 Notification emails sent to ${emailCount} eligible students`);
    } else {
      alert('Error approving job: ' + (result.error || 'Unknown error'));
    }
  };

  const handleReject = async (jobId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    const result = await rejectJobDrive(jobId, rejectionReason);
    if (result.success) {
      setPendingJobs((prev) => prev.filter((j) => j.id !== jobId));
      setSelectedJobForRejection(null);
      setRejectionReason('');
      alert('Job drive rejected!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">TNP Dashboard</h1>
          <p className="text-purple-100">Monitor and manage the campus placement system</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-semibold">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.users?.student || 0}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-semibold">Total Companies</p>
              <p className="text-3xl font-bold text-gray-900">{stats.users?.company || 0}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-semibold">Job Drives</p>
              <p className="text-3xl font-bold text-gray-900">{stats.jobs?.approved || 0}</p>
              <p className="text-gray-500 text-xs">Approved</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-semibold">Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.applications?.applied || 0}</p>
              <p className="text-gray-500 text-xs">Total</p>
            </div>
          </div>
        )}

        {/* Pending Approvals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Pending Approvals</h2>
          {pendingJobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No pending job drives to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-gray-600">
                        {job.companies?.company_name}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">
                      Pending
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Package</p>
                      <p className="font-semibold">₹{job.package} LPA</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-semibold">{job.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Min CGPA</p>
                      <p className="font-semibold">{job.eligibility}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Deadline</p>
                      <p className="font-semibold">
                        {new Date(job.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {job.description && (
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm">{job.description}</p>
                    </div>
                  )}

                  {selectedJobForRejection === job.id ? (
                    <div className="mb-4">
                      <textarea
                        placeholder="Enter rejection reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows="3"
                      />
                    </div>
                  ) : null}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(job.id)}
                      className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    {selectedJobForRejection === job.id ? (
                      <>
                        <button
                          onClick={() =>
                            handleReject(job.id)
                          }
                          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJobForRejection(null);
                            setRejectionReason('');
                          }}
                          className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedJobForRejection(job.id)}
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {activity && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Applications</h2>
              <div className="space-y-3">
                {activity.applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900">{app.students?.name}</p>
                    <p className="text-gray-600 text-sm">
                      Applied for {app.job_drives?.title}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Job Drives</h2>
              <div className="space-y-3">
                {activity.jobDrives.slice(0, 5).map((job) => (
                  <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900">{job.title}</p>
                    <p className="text-gray-600 text-sm">
                      by {job.companies?.company_name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Status: {job.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TNPDashboard;
