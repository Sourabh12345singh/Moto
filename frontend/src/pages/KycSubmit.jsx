import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { kycAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { uploadToCloudinary } from "../utils/cloudinary";

// KYC submission page - uploads documents to Cloudinary, sends URLs to backend
function KycSubmit() {
  const { user, updateUser, refreshStatus } = useAuth();
  const navigate = useNavigate();

  // Refresh user status from DB on mount so kycStatus is current
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

  // Show status if KYC already submitted
  if (user?.kycStatus === "PENDING") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Under Review</h2>
          <p className="text-gray-600 mb-6">Your documents are being reviewed. This usually takes 24-48 hours.</p>
          <button onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-primary-600 text-white rounded-lg">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (user?.kycStatus === "APPROVED") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verified</h2>
          <p className="text-gray-600 mb-6">Your KYC has been verified. You have full access.</p>
          <button onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-primary-600 text-white rounded-lg">
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

    // Validate files
    if (!formData.selfieFile || !formData.licenceFile) {
      setError("Please select both selfie and licence photos");
      return;
    }

    // Validate PAN format
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo.toUpperCase())) {
      setError("Invalid PAN format (e.g., ABCDE1234F)");
      return;
    }

    // Validate Aadhaar
    if (!/^[0-9]{12}$/.test(formData.aadhaarNo)) {
      setError("Aadhaar must be 12 digits");
      return;
    }

    // Check userId exists (from JWT token)
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-gray-600 mt-2">Complete verification to access all features</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
        {success && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}
        {uploadProgress && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center">
            <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {uploadProgress}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selfie Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selfie Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                {previews.selfie ? (
                  <img src={previews.selfie} alt="Selfie" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">No file</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("selfieFile", e)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700"
              />
            </div>
          </div>

          {/* Licence Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Driving Licence Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                {previews.licence ? (
                  <img src={previews.licence} alt="Licence" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">No file</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("licenceFile", e)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700"
              />
            </div>
          </div>

          {/* PAN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number</label>
            <input
              name="panNo"
              type="text"
              required
              maxLength={10}
              value={formData.panNo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
              placeholder="ABCDE1234F"
            />
          </div>

          {/* Aadhaar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
            <input
              name="aadhaarNo"
              type="text"
              required
              maxLength={12}
              value={formData.aadhaarNo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="123456789012"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? uploadProgress || "Submitting..." : success ? "KYC Submitted" : "Submit KYC"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default KycSubmit;
