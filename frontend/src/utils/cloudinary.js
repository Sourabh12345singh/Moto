/**
 * cloudinary.js - Utility for uploading images to Cloudinary.
 *
 * Cloudinary is a cloud-based image hosting service.
 * We use it to store KYC documents (selfie, driving licence) and get URLs.
 *
 * How it works:
 * 1. User selects an image file in the browser
 * 2. We send the file directly to Cloudinary's upload API
 * 3. Cloudinary stores the image and returns a URL
 * 4. We save this URL in our backend database
 *
 * We use "unsigned upload" which means:
 * - No API secret needed on frontend (safe!)
 * - Requires an "upload preset" configured in Cloudinary dashboard
 * - Upload preset defines allowed file types, folder, transformations, etc.
 *
 * SETUP REQUIRED in Cloudinary Dashboard:
 * 1. Go to Settings > Upload > Upload presets
 * 2. Click "Add upload preset"
 * 3. Set name to: motoshare_kyc
 * 4. Set signing mode to: Unsigned
 * 5. Optionally set folder to: kyc_documents
 * 6. Save
 */

// Get Cloudinary config from environment variables
// VITE_ prefix is required for Vite to expose env vars to frontend
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Cloudinary upload endpoint
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload an image file to Cloudinary.
 *
 * @param {File} file - The image file from input[type="file"]
 * @param {string} folder - Optional folder name in Cloudinary (e.g., "selfies", "licences")
 * @returns {Promise<string>} - The URL of the uploaded image
 * @throws {Error} - If upload fails
 *
 * Usage example:
 * const file = event.target.files[0];
 * const url = await uploadToCloudinary(file, 'selfies');
 * console.log('Image URL:', url);
 */
export async function uploadToCloudinary(file, folder = "kyc_documents") {
  // Validate that we have the required config
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration missing. Check your .env file.");
  }

  // Validate file exists
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type (only images allowed)
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  // Validate file size (max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > MAX_SIZE) {
    throw new Error("File size must be less than 10MB");
  }

  // Create FormData for the upload
  // FormData is used because we're sending a file (binary data)
  const formData = new FormData();
  formData.append("file", file); // The actual image file
  formData.append("upload_preset", UPLOAD_PRESET); // Tells Cloudinary which preset to use
  formData.append("folder", folder); // Organizes files in Cloudinary

  try {
    // Send the file to Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
      // No Content-Type header needed - browser sets it automatically for FormData
    });

    // Check if upload was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData)
      throw new Error(errorData.error?.message || "Upload failed");
    }

    // Parse the response
    const data = await response.json();

    // Return the secure URL (HTTPS)
    // data.secure_url is the permanent URL to access the image
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Upload multiple images to Cloudinary.
 *
 * @param {File[]} files - Array of image files
 * @param {string} folder - Optional folder name
 * @returns {Promise<string[]>} - Array of URLs for uploaded images
 *
 * Usage example:
 * const files = [selfieFile, licenceFile];
 * const urls = await uploadMultipleToCloudinary(files, 'kyc');
 */
export async function uploadMultipleToCloudinary(
  files,
  folder = "kyc_documents",
) {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
}

export default uploadToCloudinary;
