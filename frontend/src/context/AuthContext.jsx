import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, userAPI } from "../services/api";

// Auth context for managing user authentication state
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved session on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response;
  };

  // Login and decode JWT to get user info including userId
  const login = async (email, password) => {
    const jwtToken = await authAPI.login(email, password);

    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(jwtToken.split(".")[1]));
    console.log("JWT Payload:", payload); // Debug

    // Extract user data from JWT - userId is needed for KYC submission
    const userData = {
      userId: payload.userId,
      email: payload.sub,
      role: payload.role,
      name: payload.name || email.split("@")[0],
      kycStatus: payload.kycStatus || "NOT_SUBMITTED",
    };

    console.log("User data:", userData); // Debug

    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);

    return userData;
  };

  // Refresh user status from the database without re-login
  // Fetches fresh kycStatus, role, name from GET /api/users/me/status
  const refreshStatus = async () => {
    try {
      const freshData = await userAPI.getMyStatus();
      const updatedUser = {
        ...user,
        kycStatus: freshData.kycStatus,
        role: freshData.role,
        name: freshData.name,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error("Failed to refresh user status:", err);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
        updateUser,
        refreshStatus,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
