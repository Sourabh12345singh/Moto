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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white dark:bg-slate-955 text-neutral-800 dark:text-slate-100 min-h-[85vh] transition-colors duration-200">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">KYC Administration</h1>
        <p className="text-neutral-500 dark:text-slate-400 mt-2 font-medium">Review and verify pending KYC submissions</p>
      </div>

      {/* Status Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-semibold border ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-955/20 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20 bg-neutral-50 dark:bg-slate-900 rounded-2xl border border-neutral-100 dark:border-slate-800">
          <svg className="animate-spin h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-3 text-neutral-500 dark:text-slate-400 font-semibold text-sm">Loading pending submissions...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <p className="text-rose-600 dark:text-rose-400 font-semibold mb-4">{error}</p>
          <button
            onClick={fetchPending}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && submissions.length === 0 && (
        <div className="bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl p-16 text-center">
          <svg className="w-16 h-16 text-neutral-350 dark:text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Pending Submissions</h3>
          <p className="text-neutral-500 dark:text-slate-400 text-sm font-medium">All KYC submissions have been reviewed. Check back later.</p>
          <button
            onClick={fetchPending}
            className="mt-6 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm text-sm"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Submissions List */}
      {!loading && !error && submissions.length > 0 && (
        <div className="space-y-6">
          <p className="text-sm text-neutral-500 dark:text-slate-400 font-semibold">
            {submissions.length} pending submission{submissions.length !== 1 ? "s" : ""}
          </p>

          {submissions.map((sub) => (
            <div key={sub.userId} className="bg-white dark:bg-slate-900 border border-neutral-250 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {/* Card Header */}
              <div className="bg-neutral-50 dark:bg-slate-850 px-6 py-4 border-b border-neutral-150 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{sub.name}</h3>
                    <p className="text-sm text-neutral-500 dark:text-slate-400 font-medium mt-0.5">
                      User ID: {sub.userId} &middot; {sub.email} &middot; {sub.phoneNo}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 uppercase">
                    PENDING
                  </span>
                </div>
              </div>

              {/* Card Body - Documents */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Selfie */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 dark:text-slate-450 uppercase tracking-wider mb-2">Selfie</label>
                    <div
                      className="w-full h-48 bg-neutral-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all border border-neutral-200 dark:border-slate-700"
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
                      <div className="hidden w-full h-full items-center justify-center text-neutral-400 dark:text-slate-500 text-sm font-semibold">
                        Image failed to load
                      </div>
                    </div>
                  </div>

                  {/* Licence */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 dark:text-slate-450 uppercase tracking-wider mb-2">Driving Licence</label>
                    <div
                      className="w-full h-48 bg-neutral-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all border border-neutral-200 dark:border-slate-700"
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
                      <div className="hidden w-full h-full items-center justify-center text-neutral-400 dark:text-slate-500 text-sm font-semibold">
                        Image failed to load
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAN & Aadhaar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-50 dark:bg-slate-850 border border-neutral-150 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-xs text-neutral-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">PAN Number</p>
                    <p className="text-sm font-mono font-bold text-neutral-900 dark:text-white">{sub.panNo}</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-slate-855 border border-neutral-150 dark:border-slate-800 rounded-xl p-4">
                    <p className="text-xs text-neutral-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Aadhaar Number</p>
                    <p className="text-sm font-mono font-bold text-neutral-900 dark:text-white">{sub.aadhaarNo}</p>
                  </div>
                </div>

                {/* Reject Reason Textarea */}
                {rejectTarget === sub.userId && (
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Rejection Reason (optional)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2.5}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-250 dark:border-slate-700 focus:border-rose-500 text-neutral-850 dark:text-white outline-none rounded-xl text-sm font-semibold resize-none"
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(sub.userId)}
                    disabled={actionLoading === sub.userId}
                    className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all duration-205 flex items-center justify-center text-sm active:scale-95 disabled:opacity-50"
                  >
                    {actionLoading === sub.userId ? (
                      <Spinner />
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Approve KYC
                      </>
                    )}
                  </button>

                  {rejectTarget === sub.userId ? (
                    <>
                      <button
                        onClick={() => handleReject(sub.userId)}
                        disabled={actionLoading === sub.userId}
                        className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all duration-205 flex items-center justify-center text-sm active:scale-95 disabled:opacity-50"
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
                        className="px-5 py-3 bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setRejectTarget(sub.userId)}
                      disabled={actionLoading === sub.userId}
                      className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all duration-205 flex items-center justify-center text-sm active:scale-95 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Reject KYC
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
          className="fixed inset-0 bg-black/95 z-55 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 text-white">
              <p className="text-sm font-bold">{imageModal.label}</p>
              <button
                onClick={() => setImageModal(null)}
                className="text-white hover:text-rose-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img
              src={imageModal.url}
              alt={imageModal.label}
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminKyc;
