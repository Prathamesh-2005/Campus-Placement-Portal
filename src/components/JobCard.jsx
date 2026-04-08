const JobCard = ({ job, onApply, isApplied = false, isCompanyView = false, onStatusUpdate = null }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            <p className="text-gray-600 text-sm">{job.companies?.company_name}</p>
          </div>
          <div className="ml-4">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold rounded-full">
              ₹ {job.package}
            </span>
          </div>
        </div>

        {/* Location & Deadline */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Location</p>
            <p className="font-semibold text-gray-900">{job.location}</p>
          </div>
          <div>
            <p className="text-gray-500">Deadline</p>
            <p className="font-semibold text-gray-900">{new Date(job.deadline).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Eligibility */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm">Minimum CGPA: <span className="font-semibold text-gray-900">{job.eligibility}</span></p>
        </div>

        {/* Description */}
        {job.description && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm line-clamp-3">{job.description}</p>
          </div>
        )}

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
            job.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : job.status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
          </span>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          {isCompanyView ? (
            <div className="flex gap-2">
              {onStatusUpdate && (
                <>
                  <button
                    onClick={() => onStatusUpdate(job.id, 'approved')}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onStatusUpdate(job.id, 'rejected')}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onApply}
              disabled={isApplied}
              className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition ${
                isApplied
                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isApplied ? '✓ Applied' : 'Apply Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
