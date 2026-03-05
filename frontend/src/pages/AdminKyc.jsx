import { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

function AdminKyc() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // userId currently being acted on
  const [rejectTarget, setRejectTarget] = useState(null); // userId showing reject textarea
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imageModal, setImageModal] = useState(null); // { url, label } for full-screen view

  // Fetch pending KYC submissions on mount
  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminAPI.getPendingKyc();
      setSubmissions(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending KYC submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    setMessage({ type: "", text: "" });
    try {
      await adminAPI.verifyKyc(userId);
      setSubmissions((prev) => prev.filter((s) => s.userId !== userId));
      setMessage({ type: "success", text: `KYC approved for User ID: ${userId}` });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || `Failed to approve KYC for User ${userId}`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    setMessage({ type: "", text: "" });
    try {
      await adminAPI.rejectKyc(userId, rejectReason);
      setSubmissions((prev) => prev.filter((s) => s.userId !== userId));
      setRejectTarget(null);
      setRejectReason("");
      setMessage({ type: "success", text: `KYC rejected for User ID: ${userId}` });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || `Failed to reject KYC for User ${userId}`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Spinner component
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">KYC Administration</h1>
        <p className="text-gray-600 mt-2">Review and verify pending KYC submissions</p>
      </div>

      {/* Status Message */}
      {message.text && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-3 text-gray-600">Loading pending submissions...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && submissions.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Submissions</h3>
          <p className="text-gray-500">All KYC submissions have been reviewed. Check back later.</p>
          <button
            onClick={fetchPending}
            className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Submissions List */}
      {!loading && !error && submissions.length > 0 && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            {submissions.length} pending submission{submissions.length !== 1 ? "s" : ""}
          </p>

          {submissions.map((sub) => (
            <div key={sub.userId} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Card Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{sub.name}</h3>
                    <p className="text-sm text-gray-500">
                      User ID: {sub.userId} &middot; {sub.email} &middot; {sub.phoneNo}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    PENDING
                  </span>
                </div>
              </div>

              {/* Card Body - Documents */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Selfie */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Selfie</p>
                    <div
                      className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                      onClick={() => setImageModal({ url: sub.selfieUrl, label: `${sub.name} - Selfie` })}
                    >
                      <img
                        src={sub.selfieUrl}
                        alt={`${sub.name} selfie`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-gray-400 text-sm">
                        Image failed to load
                      </div>
                    </div>
                  </div>

                  {/* Licence */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Driving Licence</p>
                    <div
                      className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                      onClick={() => setImageModal({ url: sub.licenceUrl, label: `${sub.name} - Licence` })}
                    >
                      <img
                        src={sub.licenceUrl}
                        alt={`${sub.name} licence`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-gray-400 text-sm">
                        Image failed to load
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAN & Aadhaar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">PAN Number</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">{sub.panNo}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Aadhaar Number</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">{sub.aadhaarNo}</p>
                  </div>
                </div>

                {/* Reject Reason Textarea (shown when reject button is clicked) */}
                {rejectTarget === sub.userId && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason (optional)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(sub.userId)}
                    disabled={actionLoading === sub.userId}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {actionLoading === sub.userId ? (
                      <Spinner />
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Approve
                      </>
                    )}
                  </button>

                  {rejectTarget === sub.userId ? (
                    <>
                      <button
                        onClick={() => handleReject(sub.userId)}
                        disabled={actionLoading === sub.userId}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {actionLoading === sub.userId ? (
                          <Spinner />
                        ) : (
                          "Confirm Reject"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setRejectTarget(null);
                          setRejectReason("");
                        }}
                        className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setRejectTarget(sub.userId)}
                      disabled={actionLoading === sub.userId}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {imageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">{imageModal.label}</p>
              <button
                onClick={() => setImageModal(null)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img
              src={imageModal.url}
              alt={imageModal.label}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminKyc;
