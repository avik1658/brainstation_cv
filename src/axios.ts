import axios from "axios";
import { getAccessToken, updateToken, logoutUser } from "./utils/auth";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 1000,
});

// Request Interceptor: Attach token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      console.log(`Access logic called`);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log(`Refresh Instance`)
    // If the error is due to an invalid refresh token, log out the user
    if (
      error.response?.status === 401 &&
      error.response?.data?.detail === "Token is invalid or expired"
    ) {
      console.error("Refresh token is invalid or expired. Logging out...");
      logoutUser();
      return Promise.reject(error); // Stop retrying
    }

    // If the error is due to an invalid access token, try to refresh the token
    if (error.response?.status === 401 && 
      error.response?.data?.detail === "Given token not valid for any token type" && 
      !originalRequest._retry) {

      originalRequest._retry = true; // Mark request as retried
      try {
        const { access } = await updateToken();
        console.log(`Refresh logic called`);

        // Update global default Authorization header
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return axiosInstance(originalRequest); // Retry the failed request
      } catch {
        console.log("Token refresh failed. Logging out...");
        logoutUser(); 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
