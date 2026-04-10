import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';
import { getCompanyJobDrives, getJobApplicants } from '../services/jobService';
import { getCompanyProfile } from '../services/authService';
import { FileStack, Eye, Briefcase, Search } from 'lucide-react';

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
          <span className="tag text-slate-400">Applications</span>
          <h1 className="font-display text-5xl lg:text-6xl text-slate-900 mt-2 leading-tight">
            All Applications
          </h1>
          <p className="text-slate-600 mt-4 max-w-lg leading-relaxed text-sm">
            View and manage all student applications across your job drives
          </p>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="font-body py-12 px-6 lg:px-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5 card-hover">
              <p className="tag text-slate-400 mb-2">Total</p>
              <p className="text-3xl font-bold text-slate-900">{allApplications.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5 card-hover">
              <p className="tag text-slate-400 mb-2">Applied</p>
              <p className="text-3xl font-bold text-blue-600">
                {allApplications.filter((a) => a.status === 'applied').length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5 card-hover">
              <p className="tag text-slate-400 mb-2">Shortlisted</p>
              <p className="text-3xl font-bold text-amber-600">
                {allApplications.filter((a) => a.status === 'shortlisted').length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5 card-hover">
              <p className="tag text-slate-400 mb-2">Selected</p>
              <p className="text-3xl font-bold text-emerald-600">
                {allApplications.filter((a) => a.status === 'selected').length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS SECTION ── */}
      <section className="font-body py-12 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 tag mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Name, email, or job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 font-body"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full lg:w-48">
                <label className="text-xs font-semibold text-slate-600 tag mb-2 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field font-body appearance-none pr-10 py-2.5"
                >
                  <option value="">All Status</option>
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Sort */}
              <div className="w-full lg:w-40">
                <label className="text-xs font-semibold text-slate-600 tag mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field font-body appearance-none pr-10 py-2.5"
                >
                  <option value="applied_at">Recent</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center card-hover">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <FileStack className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications found</h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                No applications match your filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden card-hover hover:border-slate-300"
                >
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Student Info */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-slate-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {app.students.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{app.students.name}</p>
                        <p className="text-xs text-slate-600 truncate">{app.students.users.email}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                            {app.jobTitle}
                          </span>
                          <span className="font-semibold text-emerald-600">{app.students.cgpa}</span>
                          <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                            {app.students.branch}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex items-center gap-3 justify-end lg:justify-start flex-shrink-0">
                      {app.students.resume_url && (
                        <a
                          href={app.students.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          Resume
                        </a>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(app.status)}`}
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>

                      {/* Date */}
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        {new Date(app.applied_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllApplicationsPage;
