import axios from "axios";
import { getAccessToken, updateToken, logoutUser } from "./utils/auth";
import { useLocation } from "react-router-dom";

const useAxios = () => {
  const location = useLocation();
  return location.pathname.startsWith("/admin-edit") ? axiosInstance2 : axiosInstance1;
};


const axiosInstance1 = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 1000,
});

const axiosInstance2 = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 1000,
});

// Request Interceptor: Attach token to requests
axiosInstance1.interceptors.request.use(
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

// Request Interceptor: Attach token to requests
axiosInstance2.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("editAccessToken");
    if (token) {
      console.log(`Access logic called`);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor: Handle token refresh on 401 errors
axiosInstance1.interceptors.response.use(
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
        axiosInstance1.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return axiosInstance1(originalRequest); // Retry the failed request
      } catch {
        console.log("Token refresh failed. Logging out...");
        logoutUser(); 
      }
    }
    return Promise.reject(error);
  }
);

export {useAxios,axiosInstance1,axiosInstance2};
