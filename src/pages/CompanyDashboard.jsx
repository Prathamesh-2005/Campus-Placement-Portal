import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';
import { getCompanyJobDrives, createJobDrive, getJobApplicants, updateApplicationStatus } from '../services/jobService';
import { getCompanyProfile } from '../services/authService';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState(null);
  const [applicants, setApplicants] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package: '',
    location: '',
    eligibility: '',
    deadline: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);

      const profile = await getCompanyProfile(user.id);
      setCompanyProfile(profile);

      const result = await getCompanyJobDrives(profile?.id);
      if (result.success) {
        setJobs(result.data);
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (!companyProfile || !companyProfile.id) {
      alert('Company profile not loaded. Please refresh the page.');
      return;
    }

    // Validate form data
    if (!formData.title || !formData.package || !formData.eligibility || !formData.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const result = await createJobDrive(companyProfile.id, formData);
    
    if (result.success) {
      if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
        alert('Job created but no data returned. Refreshing...');
        // Reload jobs
        const updatedJobs = await getCompanyJobDrives(companyProfile.id);
        if (updatedJobs.success) {
          setJobs(updatedJobs.data);
        }
      } else {
        const newJob = Array.isArray(result.data) ? result.data[0] : result.data;
        setJobs([newJob, ...jobs]);
      }
      
      setFormData({
        title: '',
        description: '',
        package: '',
        location: '',
        eligibility: '',
        deadline: '',
      });
      setShowCreateForm(false);
      alert('Job drive created! Waiting for TNP approval.');
    } else {
      alert('Error: ' + (result.error || 'Failed to create job drive'));
    }
    
    setLoading(false);
  };

  const handleViewApplicants = async (jobId) => {
    const result = await getJobApplicants(jobId);
    if (result.success) {
      setApplicants(result.data);
      setSelectedJobApplicants(jobId);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    const result = await updateApplicationStatus(applicationId, status);
    if (result.success) {
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        )
      );
      alert(`✅ Application status updated to ${status}\n📧 Email notification sent to student`);
    } else {
      alert('Error updating status: ' + (result.error || 'Unknown error'));
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {companyProfile?.company_name}
          </h1>
          <p className="text-green-100">{companyProfile?.description}</p>
        </div>

        {/* Create Job Section */}
        <div className="mb-8">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition"
            >
              + Create Job Drive
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-6">Create New Job Drive</h2>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Package (LPA)"
                    value={formData.package}
                    onChange={(e) =>
                      setFormData({ ...formData, package: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Min CGPA"
                    value={formData.eligibility}
                    onChange={(e) =>
                      setFormData({ ...formData, eligibility: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    step="0.1"
                    required
                  />
                </div>

                <textarea
                  placeholder="Job Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    Create Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Job Drives List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Job Drives</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No job drives created yet</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-gray-600">{job.location}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        job.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : job.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Package</p>
                      <p className="font-semibold">₹{job.package} LPA</p>
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

                  <button
                    onClick={() =>
                      selectedJobApplicants === job.id
                        ? setSelectedJobApplicants(null)
                        : handleViewApplicants(job.id)
                    }
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    View Applicants
                  </button>

                  {/* Applicants List */}
                  {selectedJobApplicants === job.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4">
                        Applicants ({applicants.length})
                      </h4>
                      {applicants.length === 0 ? (
                        <p className="text-gray-500">No applicants yet</p>
                      ) : (
                        <div className="space-y-3">
                          {applicants.map((app) => (
                            <div
                              key={app.id}
                              className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {app.students.name}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  {app.students.users.email}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  CGPA: {app.students.cgpa} | {app.students.branch}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <select
                                  value={app.status}
                                  onChange={(e) =>
                                    handleUpdateApplicationStatus(
                                      app.id,
                                      e.target.value
                                    )
                                  }
                                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="applied">Applied</option>
                                  <option value="shortlisted">Shortlisted</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="selected">Selected</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
