import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';
import { getCompanyJobDrives, createJobDrive, getJobApplicants, updateApplicationStatus } from '../services/jobService';
import { getCompanyProfile } from '../services/authService';
import toast from 'react-hot-toast';
import { 
  Building2, MapPin, IndianRupee, GraduationCap, 
  CalendarDays, Users, Plus, Briefcase, 
  CheckCircle2, XCircle, Clock, FileText, Check, ArrowRight
} from 'lucide-react';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');

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
      toast.error('Company profile not loaded. Please refresh the page.');
      return;
    }
    if (!formData.title || !formData.package || !formData.eligibility || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const result = await createJobDrive(companyProfile.id, formData);
    
    if (result.success) {
      if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
        const updatedJobs = await getCompanyJobDrives(companyProfile.id);
        if (updatedJobs.success) setJobs(updatedJobs.data);
      } else {
        const newJob = Array.isArray(result.data) ? result.data[0] : result.data;
        setJobs([newJob, ...jobs]);
      }
      
      setFormData({ title: '', description: '', package: '', location: '', eligibility: '', deadline: '' });
      setShowCreateForm(false);
      toast.success('✅ Job drive created! Waiting for TNP approval.');
    } else {
      toast.error('Error: ' + (result.error || 'Failed to create job drive'));
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
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
    } else {
      toast.error('Error updating status: ' + (result.error || 'Unknown error'));
    }
  };

  const toggleApplicantSelection = (applicationId) => {
    const newSelected = new Set(selectedApplicants);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedApplicants(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedApplicants.size === applicants.length) {
      setSelectedApplicants(new Set());
    } else {
      setSelectedApplicants(new Set(applicants.map((app) => app.id)));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedApplicants.size === 0) return;

    for (const appId of selectedApplicants) {
      await handleUpdateApplicationStatus(appId, bulkStatus);
    }
    setSelectedApplicants(new Set());
    setBulkStatus('');
    toast.success(`✅ Updated ${selectedApplicants.size} applicants to ${bulkStatus}`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      rejected: "bg-rose-50 text-rose-700 border-rose-200"
    };
    const icons = {
      approved: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
      pending: <Clock className="w-3.5 h-3.5 mr-1" />,
      rejected: <XCircle className="w-3.5 h-3.5 mr-1" />
    };
    
    const defaultStyle = "bg-slate-100 text-slate-700 border-slate-200";
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || defaultStyle} capitalize`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></div>
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

      {/* Backdrop */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>
      )}

      {/* ── HERO SECTION ── */}
      <section className="font-body hero-grid border-b border-slate-200 py-16 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="tag text-slate-400">Company Dashboard</span>
              <h1 className="font-display text-5xl lg:text-6xl text-slate-900 mt-2 leading-tight">
                {companyProfile?.company_name || 'Company'}
              </h1>
              <p className="text-slate-600 mt-4 max-w-lg leading-relaxed text-sm">
                {companyProfile?.description || 'Manage your campus placement drives and track student applications.'}
              </p>
            </div>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <Plus className="w-5 h-5" />
                Create Drive
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── ACTIVE DRIVES ── */}
      <section className="font-body py-16 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="tag text-slate-400">Job Drives</span>
              <h2 className="font-display text-3xl lg:text-4xl text-slate-900 mt-1">Active Drives</h2>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 tag px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {jobs.length} {jobs.length === 1 ? 'Drive' : 'Drives'}
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center card-hover">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No drives yet</h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                You haven't created any job drives yet. Click the button above to publish your first campus placement drive.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100 bg-linear-to-r from-white to-slate-50">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div className="flex-1">
                        <h3 className="font-display text-2xl text-slate-900 mb-2">{job.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-emerald-600" />
                            ₹{job.package} LPA
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-linear-to-br from-slate-50 to-blue-50 border-b border-slate-100">
                    <div>
                      <p className="tag text-slate-400 mb-1.5">Min CGPA</p>
                      <p className="text-lg font-semibold text-emerald-600 flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {job.eligibility}
                      </p>
                    </div>
                    <div>
                      <p className="tag text-slate-400 mb-1.5">Deadline</p>
                      <p className="text-lg font-semibold text-rose-600 flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(job.deadline).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="md:col-span-2 flex items-end justify-end">
                      <button
                        onClick={() => selectedJobApplicants === job.id ? setSelectedJobApplicants(null) : handleViewApplicants(job.id)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors group"
                      >
                        <Users className="w-4 h-4" />
                        {selectedJobApplicants === job.id ? 'Hide' : 'View'} Applicants
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold">
                          {applicants.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Applicants Section */}
                  {selectedJobApplicants === job.id && (
                    <div className="border-t border-slate-100 bg-linear-to-b from-slate-50 to-white p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Applicants
                          <span className="text-xs bg-white text-slate-700 px-3 py-1 rounded-full font-bold border border-slate-200">
                            {applicants.length}
                          </span>
                        </h4>
                        {applicants.length > 0 && (
                          <button
                            onClick={toggleSelectAll}
                            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${selectedApplicants.size === applicants.length ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                          >
                            {selectedApplicants.size === applicants.length ? 'Deselect All' : 'Select All'}
                          </button>
                        )}
                      </div>

                      {/* Bulk Actions */}
                      {selectedApplicants.size > 0 && (
                        <div className="bg-white border border-blue-200 rounded-lg p-4 flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-semibold text-slate-700">
                            {selectedApplicants.size} selected
                          </span>
                          <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="text-xs border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                          >
                            <option value="">Change Status...</option>
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="selected">Selected</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <button
                            onClick={handleBulkStatusUpdate}
                            disabled={!bulkStatus}
                            className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <Check className="w-4 h-4" />
                            Apply
                          </button>
                        </div>
                      )}

                      {applicants.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-500 font-semibold">No applications yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {applicants.map((app) => (
                            <div
                              key={app.id}
                              className={`bg-white rounded-lg border p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all card-hover ${
                                selectedApplicants.has(app.id)
                                  ? 'border-blue-400 bg-blue-50'
                                  : 'border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedApplicants.has(app.id)}
                                  onChange={() => toggleApplicantSelection(app.id)}
                                  className="w-4 h-4 rounded border-2 border-slate-300 cursor-pointer"
                                />
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-slate-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {app.students.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-slate-900 truncate">
                                    {app.students.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 flex-wrap">
                                    <span className="truncate">{app.students.users.email}</span>
                                    <span className="text-emerald-600 font-semibold">{app.students.cgpa}</span>
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                                      {app.students.branch}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {app.students.resume_url && (
                                  <a
                                    href={app.students.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all"
                                  >
                                    <FileText className="w-4 h-4" />
                                    Resume
                                  </a>
                                )}
                                <select
                                  value={app.status}
                                  onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                                  className="appearance-none bg-white border border-slate-300 text-slate-900 text-xs rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer font-semibold hover:border-slate-400 transition-all"
                                >
                                  <option value="applied">Applied</option>
                                  <option value="shortlisted">Shortlisted</option>
                                  <option value="selected">Selected</option>
                                  <option value="rejected">Rejected</option>
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
      </section>

      {/* ── CREATE DRIVE MODAL ── */}
      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 py-8 font-body">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="mb-8 pb-6 border-b border-slate-200">
              <h2 className="text-3xl font-display font-bold text-slate-900">Create New Job Drive</h2>
              <p className="text-slate-600 mt-2 text-sm">
                Fill out the details below to publish a new placement drive to eligible students.
              </p>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Job Title</label>
                  <input
                    type="text"
                    placeholder="Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field font-body"
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Location</label>
                  <input
                    type="text"
                    placeholder="Pune, Bangalore, Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field font-body"
                    required
                  />
                </div>

                {/* Package */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Package (LPA)</label>
                  <input
                    type="number"
                    placeholder="12.5"
                    step="0.1"
                    value={formData.package}
                    onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                    className="input-field font-body"
                    required
                  />
                </div>

                {/* Min CGPA */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Min CGPA</label>
                  <input
                    type="number"
                    placeholder="7.5"
                    step="0.1"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    className="input-field font-body"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Job Description</label>
                <textarea
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-[120px] resize-none font-body"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Application Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field font-body"
                  required
                />
              </div>

              {/* Actions */}
              <div className="pt-8 mt-8 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 group"
                >
                  Publish Drive
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
