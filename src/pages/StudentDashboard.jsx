import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import useAuth from '../hooks/useAuth';
import { getJobDrives, getStudentApplications, applyForJob } from '../services/jobService';
import { getStudentProfile } from '../services/authService';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { 
  GraduationCap, BookOpen, Briefcase, 
  CalendarDays, Building2, CheckCircle2, 
  Clock, XCircle, Award, ChevronRight, FileText, MapPin, Calendar, Upload, Download, Edit2, Save, X
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [tab, setTab] = useState('available'); // available, applications
  const [selectedApplication, setSelectedApplication] = useState(null); // For viewing details
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', cgpa: '', branch: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);

      const profile = await getStudentProfile(user.id);
      setStudentProfile(profile);

      const jobsResult = await getJobDrives({ onlyApproved: true });
      if (jobsResult.success) {
        setJobs(jobsResult.data);
      }

      // Use profile.id (student ID from students table), not user.id
      if (profile && profile.id) {
        const applResult = await getStudentApplications(profile.id);
        if (applResult.success) {
          setApplications(applResult.data);
          // Build the set of applied job IDs - use job_id directly from applications table
          const appliedJobIds = new Set();
          applResult.data.forEach((app) => {
            // Try both job_id and job_drives.id to be safe
            const jobId = app.job_id || app.job_drives?.id;
            if (jobId) {
              appliedJobIds.add(jobId);
            }
          });
          console.log('Applied Job IDs:', Array.from(appliedJobIds));
          console.log('Applications:', applResult.data);
          setAppliedJobs(appliedJobIds);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleApply = async (jobId) => {
    if (!studentProfile) {
      toast.error('Please complete your profile first');
      return;
    }

    const loadingToastId = toast.loading('Submitting application...');
    const result = await applyForJob(studentProfile.id, jobId);
    toast.dismiss(loadingToastId);

    // Always refresh applications after attempting to apply - USE STUDENT PROFILE ID, NOT USER ID
    const applResult = await getStudentApplications(studentProfile.id);
    if (applResult.success) {
      setApplications(applResult.data);
      console.log('Refreshed applications:', applResult.data);
      
      // Rebuild the applied jobs set from fresh data
      const appliedJobIds = new Set();
      applResult.data.forEach((app) => {
        const jobId = app.job_id || app.job_drives?.id;
        if (jobId) {
          appliedJobIds.add(jobId);
        }
      });
      
      console.log('Updated Applied Job IDs:', Array.from(appliedJobIds));
      setAppliedJobs(appliedJobIds);
    }

    if (result.success) {
      toast.success('✅ Application submitted successfully! 🎉');
      // Switch to applications tab to show the new application
      setTab('applications');
    } else {
      toast.error(result.error || 'Failed to apply for this job');
      // If already applied, switch to show it in My Applications
      if (result.error?.includes('Already applied')) {
        setTab('applications');
      }
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    if (!studentProfile) {
      toast.error('Please complete your profile first');
      return;
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast.error('Only PDF and document files are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setResumeUploading(true);
      const toastId = toast.loading('Uploading resume...');

      // Use simple file name to allow replacing
      const filePath = `student_${studentProfile.id}_resume`;

      // Upload to Supabase Storage (upsert: true allows replacing existing file)
      const { data, error: uploadError } = await supabase.storage
        .from('Resume')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('Resume')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update student profile with resume URL in database
      const { error: updateError } = await supabase
        .from('students')
        .update({ resume_url: publicUrl })
        .eq('id', studentProfile.id);

      if (updateError) {
        throw updateError;
      }

      setStudentProfile({ ...studentProfile, resume_url: publicUrl });
      setResumeFile(null);

      toast.dismiss(toastId);
      toast.success('Resume uploaded successfully! 📄');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume: ' + (error.message || 'Unknown error'));
    } finally {
      setResumeUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
      shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
      rejected: "bg-rose-50 text-rose-700 border-rose-200",
      applied: "bg-slate-100 text-slate-700 border-slate-200"
    };
    
    const icons = {
      selected: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
      shortlisted: <Award className="w-3.5 h-3.5 mr-1.5" />,
      rejected: <XCircle className="w-3.5 h-3.5 mr-1.5" />,
      applied: <Clock className="w-3.5 h-3.5 mr-1.5" />
    };
    
    const defaultStyle = "bg-amber-50 text-amber-700 border-amber-200";
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${styles[status] || defaultStyle} capitalize`}>
        {icons[status] || <Clock className="w-3.5 h-3.5 mr-1.5" />}
        {status}
      </span>
    );
  };

  const startEditing = () => {
    setEditData({
      name: studentProfile?.name || '',
      cgpa: studentProfile?.cgpa || '',
      branch: ''
    });
    setEditMode(true);
  };

  const cancelEditing = () => {
    setEditMode(false);
    setEditData({ name: '', cgpa: '', branch: '' });
  };

  const saveChanges = async () => {
    if (!editData.name || !editData.cgpa) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setUpdateLoading(true);
      const toastId = toast.loading('Updating profile...');

      const { error } = await supabase
        .from('students')
        .update({
          name: editData.name,
          cgpa: parseFloat(editData.cgpa)
        })
        .eq('id', studentProfile.id);

      if (error) throw error;

      setStudentProfile({
        ...studentProfile,
        name: editData.name,
        cgpa: parseFloat(editData.cgpa)
      });

      toast.dismiss(toastId);
      toast.success('✅ Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-8 w-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></div>
            <p className="text-slate-500 text-sm font-medium">Loading your Dashboard...</p>
          </div>
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
      `}</style>

      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="font-body hero-grid border-b border-slate-200 py-16 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <span className="tag text-slate-400">Dashboard</span>
          <h1 className="font-display text-5xl lg:text-6xl text-slate-900 mt-2 leading-tight">
            Welcome back, {studentProfile?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-slate-600 mt-4 max-w-lg leading-relaxed text-sm">
            Track your applications and find your next big opportunity in campus placements
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-16 py-16 space-y-12 font-body">
        
        {/* ── STATS SECTION ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-slate-900">Profile Information</h2>
              <p className="text-slate-600 text-sm mt-1">Your academic and placement details</p>
            </div>
            {!editMode && (
              <button
                onClick={startEditing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <div className="space-y-5">
              <div>
                <label className="tag text-slate-500 mb-2 block">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="tag text-slate-500 mb-2 block">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={editData.cgpa}
                  onChange={(e) => setEditData({ ...editData, cgpa: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="e.g. 8.5"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={cancelEditing}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 card-hover flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="tag text-slate-400 mb-1">Current CGPA</p>
                  <p className="text-3xl font-bold text-slate-900">{studentProfile?.cgpa || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-6 card-hover flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="tag text-slate-400 mb-1">Branch</p>
                  <p className="text-2xl font-bold text-slate-900">{studentProfile?.branch || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 card-hover flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="tag text-slate-400 mb-1">Applications</p>
                  <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RESUME SECTION ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 card-hover">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-slate-900">Upload Resume</h2>
              <p className="text-slate-600 text-sm mt-1">Make your resume visible to companies</p>
            </div>
          </div>

          {studentProfile?.resume_url ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-emerald-50 border border-emerald-200 rounded-xl gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900">Resume Uploaded</p>
                  <p className="text-sm text-emerald-700 mt-0.5">Your resume is ready for companies to view</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => window.open(studentProfile.resume_url, '_blank')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300 transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Replace
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleResumeUpload(e.target.files[0]);
                      }
                    }}
                    disabled={resumeUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setResumeFile(e.target.files[0]);
                    handleResumeUpload(e.target.files[0]);
                  }
                }}
                disabled={resumeUploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="space-y-3">
                <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-600 transition-colors mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-slate-900">Upload your resume</p>
                  <p className="text-sm text-slate-600 mt-1">PDF, DOC, DOCX • Max 5MB</p>
                </div>
              </div>
              {resumeUploading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                    <p className="text-xs font-medium text-slate-600">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── TABS SECTION ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-8 py-6">
            <div className="flex gap-2">
              <button
                onClick={() => setTab('available')}
                className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all ${
                  tab === 'available'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Available Jobs
                <span className="ml-2 inline-block bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {jobs.length}
                </span>
              </button>
              <button
                onClick={() => setTab('applications')}
                className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all ${
                  tab === 'applications'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                My Applications
                <span className="ml-2 inline-block bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {applications.length}
                </span>
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Available Jobs Tab */}
            {tab === 'available' && (
              <div className="animate-in fade-in">
                {jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Briefcase className="h-14 w-14 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900">No active drives</h3>
                    <p className="text-slate-600 mt-2 max-w-md leading-relaxed">
                      There are currently no job drives available. Please check back later when TNP approves new companies.
                    </p>
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
            )}

            {/* Applications Tab */}
            {tab === 'applications' && (
              <div className="animate-in fade-in">
                {applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FileText className="h-14 w-14 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900">No applications yet</h3>
                    <p className="text-slate-600 mt-2 max-w-md leading-relaxed">
                      You haven't applied to any job drives. Head over to the Available Jobs tab to start applying.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all gap-4 card-hover"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 text-lg">
                              {app.job_drives.title}
                            </h3>
                            <p className="text-slate-600 font-medium text-sm mt-1">
                              {app.job_drives.companies.company_name}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                              <Calendar className="w-3.5 h-3.5" />
                              Applied: {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                          {getStatusBadge(app.status)}
                          <button 
                            onClick={() => setSelectedApplication(app)}
                            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center group-hover:underline"
                          >
                            Details <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── APPLICATION DETAILS MODAL ── */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-body">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-slate-900 to-slate-800 text-white p-8 border-b border-slate-700 flex items-start justify-between">
              <div>
                <h2 className="font-display text-3xl">{selectedApplication.job_drives.title}</h2>
                <p className="text-slate-300 mt-2">{selectedApplication.job_drives.companies.company_name}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-slate-300 hover:text-white transition-colors flex-shrink-0"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              
              {/* Status Info */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="tag text-slate-500 mb-2">Status</p>
                    <div className="mt-2">
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                  </div>
                  <div>
                    <p className="tag text-slate-500 mb-2">Applied Date</p>
                    <p className="text-lg font-semibold text-slate-900 mt-2">
                      {new Date(selectedApplication.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Details Grid */}
              <div>
                <h3 className="font-display text-2xl text-slate-900 mb-4">Job Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border border-slate-200 p-5 card-hover">
                    <p className="tag text-slate-500">Package</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-3">₹{selectedApplication.job_drives.package} LPA</p>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-slate-200 p-5 card-hover">
                    <p className="tag text-slate-500">Location</p>
                    <p className="text-lg font-semibold text-slate-900 mt-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {selectedApplication.job_drives.location}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-5 card-hover">
                    <p className="tag text-slate-500">Min CGPA</p>
                    <p className="text-lg font-semibold text-slate-900 mt-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      {selectedApplication.job_drives.eligibility}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-5 card-hover">
                    <p className="tag text-slate-500">Deadline</p>
                    <p className="text-lg font-semibold text-rose-600 mt-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedApplication.job_drives.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedApplication.job_drives.description && (
                <div>
                  <h3 className="font-display text-2xl text-slate-900 mb-4">Description</h3>
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {selectedApplication.job_drives.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
                {studentProfile?.resume_url && (
                  <button className="flex-1 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;