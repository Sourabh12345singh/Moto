import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { kycAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { uploadToCloudinary } from "../utils/cloudinary";

function KycSubmit() {
  const { user, updateUser, refreshStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshStatus();
  }, []);

  const [formData, setFormData] = useState({
    selfieFile: null,
    licenceFile: null,
    panNo: "",
    aadhaarNo: "",
  });

  const [previews, setPreviews] = useState({ selfie: null, licence: null });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  if (user?.kycStatus === "PENDING") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 bg-white dark:bg-slate-950 text-neutral-800 dark:text-slate-100 min-h-[85vh] transition-colors duration-200">
        <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">KYC Under Review</h2>
          <p className="text-neutral-600 dark:text-slate-400 mb-6 font-medium">Your documents are being reviewed. This usually takes 24-48 hours.</p>
          <button onClick={() => navigate("/dashboard")} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm text-sm">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (user?.kycStatus === "APPROVED") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 bg-white dark:bg-slate-955 text-neutral-800 dark:text-slate-100 min-h-[85vh] transition-colors duration-200">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">KYC Verified</h2>
          <p className="text-neutral-600 dark:text-slate-400 mb-6 font-medium">Your KYC has been verified. You have full access.</p>
          <button onClick={() => navigate("/dashboard")} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm text-sm">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be less than 10MB");
      return;
    }

    setError("");
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    const previewKey = fieldName === "selfieFile" ? "selfie" : "licence";
    setPreviews((prev) => ({ ...prev, [previewKey]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.selfieFile || !formData.licenceFile) {
      setError("Please select both selfie and licence photos");
      return;
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      setError("Invalid PAN format (e.g., ABCDE1234F)");
      return;
    }

    if (!/^[0-9]{12}$/.test(formData.aadhaarNo)) {
      setError("Aadhaar must be 12 digits");
      return;
    }

    if (!user?.userId) {
      setError("Session error. Please logout and login again.");
      return;
    }

    setLoading(true);

    try {
      setUploadProgress("Uploading selfie...");
      const selfieUrl = await uploadToCloudinary(formData.selfieFile, "kyc/selfies");

      setUploadProgress("Uploading licence...");
      const licenceUrl = await uploadToCloudinary(formData.licenceFile, "kyc/licences");

      setUploadProgress("Submitting KYC...");
      await kycAPI.submitKyc(user.userId, {
        selfieUrl,
        licenceUrl,
        panNo: formData.panNo.toUpperCase(),
        aadhaarNo: formData.aadhaarNo,
      });

      updateUser({ kycStatus: "PENDING" });
      setUploadProgress("");
      setSuccess("KYC submitted successfully!");
    } catch (err) {
      console.error("KYC error:", err);
      setError(err.message || "Failed to submit KYC");
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 bg-white dark:bg-slate-950 text-neutral-850 dark:text-slate-100 min-h-[85vh] transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">KYC Verification</h1>
        <p className="text-neutral-500 dark:text-slate-400 mt-2 font-medium">Complete verification to access all features</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
        {user?.kycStatus === "REJECTED" && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-semibold">
            <p className="font-bold">Your previous KYC was rejected.</p>
            <p className="text-xs mt-1.5 font-medium">Please resubmit your documents with correct information.</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-xl text-sm font-semibold">
            {success}
          </div>
        )}
        
        {uploadProgress && (
          <div className="mb-6 p-3.5 bg-blue-50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-400 rounded-xl text-sm font-semibold flex items-center">
            <svg className="animate-spin w-5 h-5 mr-2.5 flex-shrink-0 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {uploadProgress}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selfie Upload */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-3">Selfie Photo</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-neutral-300 dark:border-slate-700 rounded-xl overflow-hidden flex items-center justify-center bg-neutral-50 dark:bg-slate-800 flex-shrink-0">
                {previews.selfie ? (
                  <img src={previews.selfie} alt="Selfie" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-neutral-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">No file</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("selfieFile", e)}
                className="block w-full text-xs text-neutral-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-rose-50 dark:file:bg-rose-955/20 file:text-rose-600 dark:file:text-rose-400 file:font-bold file:cursor-pointer hover:file:bg-rose-100 dark:hover:file:bg-rose-900/20 file:transition-colors"
              />
            </div>
          </div>

          {/* Licence Upload */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-3">Driving Licence Photo</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-neutral-300 dark:border-slate-700 rounded-xl overflow-hidden flex items-center justify-center bg-neutral-50 dark:bg-slate-800 flex-shrink-0">
                {previews.licence ? (
                  <img src={previews.licence} alt="Licence" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-neutral-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">No file</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("licenceFile", e)}
                className="block w-full text-xs text-neutral-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-rose-50 dark:file:bg-rose-955/20 file:text-rose-600 dark:file:text-rose-400 file:font-bold file:cursor-pointer hover:file:bg-rose-100 dark:hover:file:bg-rose-900/20 file:transition-colors"
              />
            </div>
          </div>

          {/* PAN */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">PAN Card Number</label>
            <input
              name="panNo"
              type="text"
              required
              maxLength={10}
              value={formData.panNo}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-250 dark:border-slate-700 focus:border-rose-500 rounded-xl text-neutral-850 dark:text-white outline-none transition-colors text-sm font-semibold uppercase placeholder-neutral-400 dark:placeholder-slate-500"
              placeholder="ABCDE1234F"
            />
          </div>

          {/* Aadhaar */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-2">Aadhaar Number</label>
            <input
              name="aadhaarNo"
              type="text"
              required
              maxLength={12}
              value={formData.aadhaarNo}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-neutral-250 dark:border-slate-700 focus:border-rose-500 rounded-xl text-neutral-855 dark:text-white outline-none transition-colors text-sm font-semibold placeholder-neutral-450 dark:placeholder-slate-500"
              placeholder="123456789012"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-colors duration-200 active:scale-95"
          >
            {loading ? uploadProgress || "Submitting..." : success ? "KYC Submitted" : "Submit KYC"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default KycSubmit;
