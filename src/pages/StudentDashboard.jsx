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
  Clock, XCircle, Award, ChevronRight, FileText, MapPin, Calendar, Upload, Download
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
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Profile Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {studentProfile?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your applications and find your next big opportunity.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Current CGPA</p>
              <p className="text-2xl font-bold text-slate-900">{studentProfile?.cgpa || 'N/A'}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Branch</p>
              <p className="text-xl font-bold text-slate-900 truncate max-w-[150px]">{studentProfile?.branch || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Applications</p>
              <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
            </div>
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Resume</h3>
                <p className="text-xs text-slate-500">Upload your resume for company viewing</p>
              </div>
            </div>
          </div>

          {studentProfile?.resume_url ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Resume Uploaded</p>
                  <p className="text-xs text-emerald-600">Your resume is ready for companies to view</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => window.open(studentProfile.resume_url, '_blank')}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  View
                </button>
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 transition-all cursor-pointer">
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
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group relative">
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
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Upload your resume</p>
                  <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-400">PDF, DOC, DOCX • Max 5MB</p>
              </div>
              {resumeUploading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                    <p className="text-xs font-medium text-slate-600">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* Shadcn-style Segmented Control Tabs */}
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500">
              <button
                onClick={() => setTab('available')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  tab === 'available'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                Available Jobs
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${tab === 'available' ? 'bg-slate-100 text-slate-900' : 'bg-slate-200 text-slate-500'}`}>
                  {jobs.length}
                </span>
              </button>
              <button
                onClick={() => setTab('applications')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  tab === 'applications'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                My Applications
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${tab === 'applications' ? 'bg-slate-100 text-slate-900' : 'bg-slate-200 text-slate-500'}`}>
                  {applications.length}
             </span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Available Jobs Tab */}
            {tab === 'available' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Briefcase className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No active drives</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm">
                      There are currently no job drives available. Please check back later when TNP approves new companies.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Note: Ensure your JobCard component is also updated with slate colors/borders to match */}
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
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No applications yet</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm">
                      You haven't applied to any job drives. Head over to the Available Jobs tab to start applying.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all hover:shadow-sm gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Building2 className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 text-base">
                              {app.job_drives.title}
                            </h3>
                            <p className="text-slate-600 font-medium text-sm mt-0.5">
                              {app.job_drives.companies.company_name}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center">
                                <CalendarDays className="w-3.5 h-3.5 mr-1" />
                                Applied: {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                          {getStatusBadge(app.status)}
                          <button 
                            onClick={() => setSelectedApplication(app)}
                            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center group-hover:underline"
                          >
                            View Details <ChevronRight className="w-4 h-4 ml-0.5" />
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

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedApplication.job_drives.title}</h2>
                  <p className="text-slate-300 mt-1">{selectedApplication.job_drives.companies.company_name}</p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6">
                
                {/* Application Status */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Current Status</p>
                      <div className="mt-2">
                        {getStatusBadge(selectedApplication.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Applied Date</p>
                      <p className="text-lg font-semibold text-slate-900 mt-2">
                        {new Date(selectedApplication.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Job Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Package</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-2">₹{selectedApplication.job_drives.package} LPA</p>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</p>
                      <p className="text-lg font-semibold text-slate-900 mt-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {selectedApplication.job_drives.location}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Min CGPA</p>
                      <p className="text-lg font-semibold text-slate-900 mt-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-500" />
                        {selectedApplication.job_drives.eligibility}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deadline</p>
                      <p className="text-lg font-semibold text-rose-600 mt-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedApplication.job_drives.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                {selectedApplication.job_drives.description && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-slate-900">Job Description</h3>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedApplication.job_drives.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                  >
                    Close
                  </button>
                  <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1">
                    Download Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;