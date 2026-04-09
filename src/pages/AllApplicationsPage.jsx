import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';
import { getCompanyJobDrives, getJobApplicants } from '../services/jobService';
import { getCompanyProfile } from '../services/authService';
import { FileStack, Filter, Download, Eye, Briefcase, Search, ChevronDown } from 'lucide-react';

const AllApplicationsPage = () => {
  const { user } = useAuth();
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('applied_at');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get company profile first
        const companyProfile = await getCompanyProfile(user.id);
        
        if (!companyProfile || !companyProfile.id) {
          console.error('Could not find company profile');
          setAllApplications([]);
          return;
        }
        
        // Fetch all job drives for the company using actual company ID
        const jobsResult = await getCompanyJobDrives(companyProfile.id);
        if (jobsResult.success) {
          setJobs(jobsResult.data);
          
          // Fetch all applications for each job
          const allApps = [];
          for (const job of jobsResult.data) {
            const appsResult = await getJobApplicants(job.id);
            if (appsResult.success) {
              appsResult.data.forEach((app) => {
                allApps.push({
                  ...app,
                  jobTitle: job.title,
                  jobId: job.id,
                  jobDeadline: job.deadline,
                  jobPackage: job.package,
                });
              });
            }
          }
          
          setAllApplications(allApps);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Filter and sort applications
  const filteredApplications = allApplications
    .filter((app) => {
      const matchesStatus = filterStatus === '' || app.status === filterStatus;
      const matchesSearch =
        searchTerm === '' ||
        app.students.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.students.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'applied_at') {
        return new Date(b.applied_at) - new Date(a.applied_at);
      } else if (sortBy === 'name') {
        return a.students.name.localeCompare(b.students.name);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-50 text-blue-700 border-blue-200',
      shortlisted: 'bg-amber-50 text-amber-700 border-amber-200',
      selected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      applied: '📝',
      shortlisted: '⭐',
      selected: '✅',
      rejected: '❌',
    };
    return icons[status] || '○';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-8 w-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></div>
            <p className="text-slate-500 text-sm font-medium">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileStack className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">All Applications</h1>
              <p className="text-sm text-slate-600 mt-1">View and manage all student applications</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg border border-slate-100 p-3 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{allApplications.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-100 p-3 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{allApplications.filter((a) => a.status === 'applied').length}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-100 p-3 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</p>
              <p className="text-xl font-bold text-amber-600 mt-1">{allApplications.filter((a) => a.status === 'shortlisted').length}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-100 p-3 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selected</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{allApplications.filter((a) => a.status === 'selected').length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
              />
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Status</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative min-w-[150px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="applied_at">Recent</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <Briefcase className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No applications found</h3>
            <p className="mt-1 text-sm text-slate-500">No applications match your filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-4 hover:border-blue-200">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  {/* Student Info */}
                  <div className="flex gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {app.students.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">{app.students.name}</p>
                        <span className="text-xs text-slate-500 font-medium">{app.students.users.email}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 flex-wrap">
                        <span className="flex gap-1.5 items-center">
                          <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                          {app.jobTitle}
                        </span>
                        <span>CGPA: <span className="font-semibold text-emerald-600">{app.students.cgpa}</span></span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">{app.students.branch}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-3 justify-end flex-shrink-0">
                    {/* Resume Button */}
                    {app.students.resume_url && (
                      <button
                        onClick={() => window.open(app.students.resume_url, '_blank')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all"
                        title="Open Resume"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Resume
                      </button>
                    )}

                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold border ${getStatusColor(app.status)}`}>
                      <span className="mr-1.5">{getStatusIcon(app.status)}</span>
                      {app.status}
                    </span>

                    {/* Date */}
                    <span className="text-xs text-slate-500 font-medium min-w-fit">
                      {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllApplicationsPage;
