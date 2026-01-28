import axios from "axios";
import { toast } from "react-toastify";

// Create the instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle tenant inactive globally
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data?.errorCode === "TENANT_INACTIVE"
    ) {
      toast.error("Your tenant is inactive. You have been logged out.");
      try {
        await api.post("/auth/logout", {}, { withCredentials: true });
        toast.success("Logged out successfully");
      } catch (logoutError) {
        toast.error(logoutError?.response?.data?.message || "Error logging out");
      } finally {
        setTimeout(() => {
          window.location.href = "/";
        }, 2000); // 1.2 seconds
      }
      return Promise.reject(error);
    }
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data?.errorCode === "USER_INACTIVE"
    ) {
      toast.error("Your account is inactive. Please contact support.");
      window.location.href = "/users/login";
      return Promise.reject(error);
    }

    // Handle token expiration
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.errorCode === "TOKEN_INVALID"
    ) {
      toast.error("Session expired or token invalid. Please log in again.");
      window.location.href = "/users/login";
      return Promise.reject(error);
    }

    // Other errors
    return Promise.reject(error);
  }
);

export default api;
