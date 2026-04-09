import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';
import { getCompanyJobDrives, createJobDrive, getJobApplicants, updateApplicationStatus } from '../services/jobService';
import { getCompanyProfile } from '../services/authService';
import toast from 'react-hot-toast';
import { 
  Building2, MapPin, IndianRupee, GraduationCap, 
  CalendarDays, Users, Plus, Briefcase, 
  CheckCircle2, XCircle, Clock, FileText, Check
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 pb-16">
      <Navbar />

      {/* Blur Backdrop - Full Screen */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 animate-in fade-in duration-300"></div>
      )}

      {/* Modal Form - Centered */}
      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 py-8 pointer-events-none">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-2xl p-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 pointer-events-auto max-h-[90vh] overflow-y-auto">
            <div className="mb-8 pb-6 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Create New Job Drive</h2>
                  <p className="text-slate-600 mt-2 text-sm font-medium">Fill out the details below to publish a new placement drive to eligible students.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleCreateJob} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-blue-500" />
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="flex h-11 w-full rounded-lg border-2 border-slate-200 bg-linear-to-r from-white to-blue-50 px-4 py-2.5 pl-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:ring-offset-1 transition-all shadow-sm hover:border-blue-300 hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <input
                      type="text"
                      placeholder="e.g. Pune, Bangalore, Remote"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="flex h-11 w-full rounded-lg border-2 border-slate-200 bg-linear-to-r from-white to-blue-50 px-4 py-2.5 pl-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:ring-offset-1 transition-all shadow-sm hover:border-blue-300 hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                {/* Package */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Package (LPA)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <input
                      type="number"
                      placeholder="e.g. 12.5"
                      step="0.1"
                      value={formData.package}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="flex h-11 w-full rounded-lg border-2 border-slate-200 bg-linear-to-r from-white to-blue-50 px-4 py-2.5 pl-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:ring-offset-1 transition-all shadow-sm hover:border-blue-300 hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                {/* Eligibility */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Min CGPA</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                    <input
                      type="number"
                      placeholder="e.g. 7.5"
                      step="0.1"
                      value={formData.eligibility}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      className="flex h-11 w-full rounded-lg border-2 border-slate-200 bg-linear-to-r from-white to-blue-50 px-4 py-2.5 pl-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:ring-offset-1 transition-all shadow-sm hover:border-blue-300 hover:shadow-md"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Job Description</label>
                <textarea
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[120px] w-full rounded-lg border-2 border-slate-200 bg-linear-to-r from-white to-blue-50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:ring-offset-1 transition-all shadow-sm hover:border-blue-300 hover:shadow-md resize-none"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Application Deadline</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="flex h-11 w-full rounded-lg border-2 border-slate-200 bg-linear-to-r from-white to-blue-50 px-4 py-2.5 pl-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:ring-offset-1 transition-all shadow-sm hover:border-blue-300 hover:shadow-md"
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8 mt-8 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
                >
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="h-24 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
          </div>
          <div className="px-6 pb-6">
            <div className="relative flex justify-between items-end -mt-8 mb-4">
              <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="h-16 w-16 bg-linear-to-br from-blue-50 to-slate-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-slate-600" />
                </div>
              </div>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-5 py-2 bg-linear-to-r from-slate-900 to-slate-800 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:from-slate-800 hover:to-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Drive
                </button>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {companyProfile?.company_name || 'Company Profile'}
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
                {companyProfile?.description || 'Manage your campus placement drives and track student applications efficiently.'}
              </p>
            </div>
          </div>
        </div>

        {/* Job Drives List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Active Drives</h2>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
              {jobs.length} Total
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 border-dashed p-8 text-center flex flex-col items-center">
              <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Briefcase className="h-5 w-5 text-slate-400" />
              </div>
              <h3 className="text-base font-medium text-slate-900">No drives found</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                You haven't created any job drives yet. Click the button above to publish your first campus drive.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-slate-200 duration-300">
                  
                  {/* Job Header Info */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{job.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-semibold"><MapPin className="w-3.5 h-3.5 text-blue-500" />{job.location}</span>
                          <span className="flex items-center gap-1 font-semibold"><IndianRupee className="w-3.5 h-3.5 text-green-500" />₹{job.package} LPA</span>
                        </div>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-linear-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-100 shadow-xs">
                      <div className="hover:bg-white p-2 rounded-lg transition duration-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Min CGPA</p>
                        <p className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-emerald-500" />
                          {job.eligibility}
                        </p>
                      </div>
                      <div className="hover:bg-white p-2 rounded-lg transition duration-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Deadline</p>
                        <p className="text-sm font-bold text-rose-600 flex items-center gap-1">
                          <CalendarDays className="w-4 h-4 text-rose-500" />
                          {new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="md:col-span-2 flex items-end justify-end">
                        <button
                          onClick={() => selectedJobApplicants === job.id ? setSelectedJobApplicants(null) : handleViewApplicants(job.id)}
                          className="inline-flex items-center px-4 py-2 bg-linear-to-r from-slate-900 to-slate-800 text-white text-xs font-semibold rounded-lg hover:shadow-md hover:from-slate-800 hover:to-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                        >
                          <Users className="w-3.5 h-3.5 mr-1" />
                          {selectedJobApplicants === job.id ? 'Hide Applicants' : `View Applicants (${applicants.length})`}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Applicants Section */}
                  {selectedJobApplicants === job.id && (
                    <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50 to-slate-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="space-y-3">
                        {/* Header with Selection Controls */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900">
                            Applicants <span className="ml-2 text-xs bg-white text-slate-700 px-2 py-0.5 rounded-full font-semibold shadow-sm border border-slate-200">{applicants.length}</span>
                          </h4>
                          {applicants.length > 0 && (
                            <button
                              onClick={toggleSelectAll}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${selectedApplicants.size === applicants.length ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                            >
                              {selectedApplicants.size === applicants.length ? 'Deselect All' : 'Select All'}
                            </button>
                          )}
                        </div>

                        {/* Bulk Actions Bar */}
                        {selectedApplicants.size > 0 && (
                          <div className="bg-white border border-blue-200 rounded-lg p-3 flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-700">
                              {selectedApplicants.size} selected
                            </span>
                            <select
                              value={bulkStatus}
                              onChange={(e) => setBulkStatus(e.target.value)}
                              className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
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
                              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Apply
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {applicants.length === 0 ? (
                        <div className="text-center py-6">
                          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 font-semibold">No students have applied to this drive yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 mt-3">
                          {applicants.map((app) => (
                            <div key={app.id} className={`bg-white rounded-lg border p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all shadow-xs ${selectedApplicants.has(app.id) ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'}`}>
                              
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Checkbox */}
                                <input
                                  type="checkbox"
                                  checked={selectedApplicants.has(app.id)}
                                  onChange={() => toggleApplicantSelection(app.id)}
                                  className="w-4 h-4 rounded border-2 border-slate-300 text-blue-600 cursor-pointer flex-shrink-0"
                                />
                                {/* Avatar */}
                                <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-500 to-slate-600 flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                                  {app.students.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    {app.students.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-medium flex-wrap">
                                    <span className="truncate">{app.students.users.email}</span>
                                    <span className="flex items-center gap-0.5 text-emerald-600">{app.students.cgpa}</span>
                                    <span className="bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 text-xs font-semibold">{app.students.branch}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Resume Button */}
                                {app.students.resume_url && (
                                  <button
                                    onClick={() => window.open(app.students.resume_url, '_blank')}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all"
                                    title="Open Resume"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    Resume
                                  </button>
                                )}

                                {/* Status Select */}
                                <select
                                  value={app.status}
                                  onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                                  className="appearance-none bg-linear-to-r from-white to-blue-50 border border-slate-200 text-slate-900 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-semibold hover:border-blue-300 transition-all shadow-sm"
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
      </main>
    </div>
  );
};

export default CompanyDashboard;
