import axios from "axios";
import { getAccessToken, updateToken, logoutUser } from "./utils/auth";
import { useLocation } from "react-router-dom";

const useAxios = () => {
  const location = useLocation();
  return location.pathname.startsWith("/admin-edit") ? axiosInstance2 : axiosInstance1;
};

const url = "http://172.16.230.59:8080";
const normalTimeout = 5000;
const pdfTimeout = 10000;
const excelTimeout = 10000;

const axiosInstance1 = axios.create({
  baseURL: url,
  timeout: normalTimeout,
});

const axiosInstance2 = axios.create({
  baseURL: url,
  timeout: normalTimeout,
});

// Static variables for token refresh management
let isRefreshing = false;
let refreshQueue: ((newToken: string) => void)[] = []; // Explicitly typed queue


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

//Always show fresh data
axiosInstance1.defaults.headers.get['Cache-Control'] = 'no-cache, no-store, must-revalidate';
axiosInstance1.defaults.headers.get['Pragma'] = 'no-cache';
axiosInstance1.defaults.headers.get['Expires'] = '0';

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


axiosInstance1.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the refresh token is invalid, log out
    if (
      error.response?.status === 401 &&
      error.response?.data?.detail === "Token is invalid or expired"
    ) {
      console.error("Refresh token is invalid or expired. Logging out...");
      logoutUser();
      return Promise.reject(error);
    }

    // If the access token is expired, try refreshing it
    if (
      error.response?.status === 401 &&
      error.response?.data?.detail === "Given token not valid for any token type" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // If refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(axiosInstance1(originalRequest));
          });
        });
      }

      // Begin refreshing the token
      isRefreshing = true;

      try {
        const { access } = await updateToken();
        isRefreshing = false;

        // Update all queued requests with the new token
        axiosInstance1.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        refreshQueue.forEach((callback) => callback(access));
        refreshQueue = []; // Clear queue

        // Retry the original request with the new token
        originalRequest.headers["Authorization"] = `Bearer ${access}`;
        return axiosInstance1(originalRequest);
      } catch (err) {
        console.log("Token refresh failed. Logging out...");
        logoutUser();
        isRefreshing = false;
        refreshQueue = []; // Clear queue if refresh fails
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export {useAxios,axiosInstance1,axiosInstance2,url,pdfTimeout,excelTimeout};
