import axios from "axios";

/**
 * api.js - Centralized API configuration and service functions.
 *
 * This file:
 * 1. Creates an axios instance with base configuration
 * 2. Adds interceptors for JWT token injection and error handling
 * 3. Provides API functions organized by feature (auth, user, biker, kyc, admin)
 *
 * All API calls in the app should use these functions instead of axios directly.
 * This ensures consistent error handling and automatic token attachment.
 */

// Create axios instance with base configuration.
// Use an absolute default API URL so production builds never silently fall back to same-origin '/api'.
const API_BASE_URL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
  "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json", // All requests send JSON data
  },
});

/**
 * Request Interceptor - Runs before every API request.
 *
 * Purpose: Automatically attach JWT token to all requests.
 *
 * Flow:
 * 1. Get token from localStorage
 * 2. If token exists, add it to Authorization header
 * 3. Backend's JwtAuthFilter will validate this token
 *
 * Without this, every API call would need to manually add the token!
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Add Bearer token to Authorization header
      // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor - Runs after every API response.
 *
 * Purpose: Handle common errors globally, especially 401 Unauthorized.
 *
 * When backend returns 401 (invalid/expired token):
 * 1. Clear localStorage (token and user data)
 * 2. Redirect to login page
 *
 * This ensures user is logged out when their session expires.
 */
api.interceptors.response.use(
  (response) => response, // Success - just return the response
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - clear session and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ============== AUTH APIs ==============
// Public endpoints - no token required

export const authAPI = {
  /**
   * Register a new user account.
   *
   * @param userData { name, email, phoneNo, password, role }
   * @returns Success message string
   *
   * Endpoint: POST /api/auth/register
   */
  register: async (userData) => {
    const response = await api.post("/auth/register", {
      name: userData.name,
      email: userData.email,
      phoneNo: userData.phoneNo,
      password: userData.password,
      role: userData.role, // BIKER or TAKER
    });
    return response.data;
  },

  /**
   * Login with email and password.
   *
   * @param email User's email
   * @param password User's password
   * @returns JWT token string (contains userId, role, name, kycStatus)
   *
   * Endpoint: POST /api/auth/login
   *
   * The returned token should be decoded in AuthContext to get user info.
   */
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data; // Returns JWT token as plain text
  },

  googleLogin: async (code, redirectUri = null, role = null) => {
    const response = await api.post("/auth/google", { code, redirectUri, role });
    return response.data; // Returns JWT token as plain text
  },

  sendOtp: async (email) => {
    const response = await api.post("/auth/send-otp", { email });
    return response.data; // { message, userExists }
  },

  verifyOtp: async (email, otpCode) => {
    const response = await api.post("/auth/verify-otp", { email, otpCode });
    return response.data; // { message, userExists }
  },

  resetPassword: async (email, password) => {
    const response = await api.post("/auth/reset-password", { email, password });
    return response.data; // Success message
  },

};

// ============== USER/TAKER APIs ==============
// Endpoints for users who want to rent bikes

export const userAPI = {
  /**
   * Search for available bikes in a city.
   *
   * @param city City name to search (e.g., "Mumbai", "Delhi")
   * @returns Array of available bikes with their slots
   *
   * Endpoint: GET /api/users/bikes?city=Mumbai
   */
  searchBikes: async (city) => {
    const response = await api.get("/users/bikes", { params: { city } });
    return response.data;
  },

  /**
   * Book a bike for a custom time range within an available slot.
   * Backend gets userId from the JWT token automatically.
   *
   * @param slotId The availability slot ID (UUID)
   * @param startTime Booking start time (ISO string, e.g. "2026-03-05T10:00:00")
   * @param endTime Booking end time (ISO string, e.g. "2026-03-05T12:00:00")
   * @returns Success message string
   *
   * Endpoint: POST /api/users/book
   * Body: { slotId, startTime, endTime }
   *
   * After booking, the backend splits the original slot:
   * - Original slot marked unavailable
   * - Pre-booking remainder becomes a new slot (if >= 1 hour)
   * - Post-booking remainder (after 30-min buffer) becomes a new slot (if >= 1 hour)
   */
  bookBike: async (slotId, startTime, endTime) => {
    const response = await api.post("/users/book", {
      slotId,
      startTime,
      endTime,
    });
    return response.data;
  },

  /**
   * Get current user's fresh status from the database.
   * Used to refresh kycStatus, role, name without re-login.
   *
   * @returns { userId, email, name, role, kycStatus }
   *
   * Endpoint: GET /api/users/me/status
   */
  getMyStatus: async () => {
    const response = await api.get("/users/me/status");
    return response.data;
  },

  /**
   * Get current user's bookings (for TAKER "My Bookings" page).
   *
   * @returns Array of BookingResponseDto objects
   *
   * Endpoint: GET /api/users/my-bookings
   */
  getMyBookings: async () => {
    const response = await api.get("/users/my-bookings");
    return response.data;
  },
};

// ============== BIKER APIs ==============
// Endpoints for users who own bikes and want to rent them out

export const bikerAPI = {
  /**
   * Add a new bike to the platform.
   *
   * @param bikerId The biker's user ID
   * @param bikeData { company, model, ratePerHour, bikeNumber, rcNumber, kms }
   * @returns Created bike object
   *
   * Endpoint: POST /api/biker/{bikerId}/bike
   */
  addBike: async (bikerId, bikeData) => {
    const response = await api.post(`/biker/${bikerId}/bike`, {
      company: bikeData.company,
      model: bikeData.model,
      ratePerHour: bikeData.ratePerHour,
      bikeNumber: bikeData.bikeNumber,
      rcNumber: bikeData.rcNumber,
      kms: bikeData.kms,
      imageUrl: bikeData.imageUrl,
    });
    return response.data;
  },

  /**
   * Add availability slot for a bike.
   * Defines when and where a bike is available for rent.
   *
   * @param bikeId The bike's ID
   * @param slotData { startTime, endTime, pricePerHour, city, pickupLocation }
   * @returns Created slot object
   *
   * Endpoint: POST /api/biker/bike/{bikeId}/slot
   */
  addSlot: async (bikeId, slotData) => {
    const response = await api.post(`/biker/bike/${bikeId}/slot`, {
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      pricePerHour: slotData.pricePerHour,
      city: slotData.city,
      pickupLocation: slotData.pickupLocation,
    });
    return response.data;
  },

  /**
   * Get all bookings for this biker's bikes.
   *
   * @returns Array of BookingResponseDto objects
   *
   * Endpoint: GET /api/biker/my-bookings
   */
  getMyBookings: async () => {
    const response = await api.get("/biker/my-bookings");
    return response.data;
  },

  /**
   * Get all bikes listed by this biker.
   *
   * @returns Array of BikerBikeResponseDto objects
   *
   * Endpoint: GET /api/biker/my-bikes
   */
  getMyBikes: async () => {
    const response = await api.get("/biker/my-bikes");
    return response.data;
  },
};

// ============== KYC APIs ==============
// Endpoints for KYC (Know Your Customer) verification

export const kycAPI = {
  /**
   * Submit KYC documents for verification.
   *
   * @param userId The user's ID (from JWT token - user.userId)
   * @param kycData { selfieUrl, licenceUrl, panNo, aadhaarNo }
   * @returns Success message
   *
   * Endpoint: POST /api/kyc/{userId}
   *
   * IMPORTANT: Backend JWT must include userId in token payload!
   * If your backend JWT doesn't include userId, you need to fix your JWT generation.
   * The backend should add userId to the JWT claims when generating the token.
   *
   * After submission, user's kycStatus changes from NOT_SUBMITTED to PENDING.
   */
  submitKyc: async (userId, kycData) => {
    if (!userId) {
      throw new Error(
        "User ID is required but was not provided. Backend JWT token must include userId.",
      );
    }
    const response = await api.post(`/kyc/${userId}`, {
      selfieUrl: kycData.selfieUrl,
      licenceUrl: kycData.licenceUrl,
      panNo: kycData.panNo,
      aadhaarNo: kycData.aadhaarNo,
    });
    return response.data;
  },
};

// ============== ADMIN APIs ==============
// Endpoints for admin operations (KYC verification)

export const adminAPI = {
  /**
   * Get all pending KYC submissions for admin review.
   *
   * @returns Array of KycReviewDto objects:
   *   { userId, name, email, phoneNo, selfieUrl, licenceUrl, panNo, aadhaarNo }
   *
   * Endpoint: GET /api/admin/kyc/pending
   */
  getPendingKyc: async () => {
    const response = await api.get("/admin/kyc/pending");
    return response.data;
  },

  /**
   * Approve a user's KYC submission.
   *
   * @param userId The user whose KYC to approve
   * @returns Success message
   *
   * Endpoint: POST /api/admin/kyc/verify/{userId}
   *
   * After approval, user's kycStatus changes from PENDING to APPROVED.
   */
  verifyKyc: async (userId) => {
    const response = await api.post(`/admin/kyc/verify/${userId}`);
    return response.data;
  },

  /**
   * Reject a user's KYC submission.
   *
   * @param userId The user whose KYC to reject
   * @param reason Optional rejection reason
   * @returns Success message
   *
   * Endpoint: POST /api/admin/kyc/reject/{userId}?reason=...
   *
   * After rejection, user's kycStatus changes to REJECTED.
   * The KYC record is deleted, allowing user to resubmit.
   */
  rejectKyc: async (userId, reason = "") => {
    const response = await api.post(`/admin/kyc/reject/${userId}`, null, {
      params: reason ? { reason } : {},
    });
    return response.data;
  },
};

export default api;
