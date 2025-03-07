import {axiosInstance1} from "@/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const updateToken = async () => {
  
  try {
    const refreshToken = localStorage.getItem("localRefreshToken");
    console.log(`update token function`)
    console.log("Refresh Token:", refreshToken);
    if (!refreshToken) {
      console.error("No refresh token found");
      throw new Error("No refresh token available");
    }

    const response = await axiosInstance1.post("/api/token/refresh/", {
      refresh: refreshToken,
    });

    const { access, refresh } = response.data;

    if (access) {
      localStorage.setItem("localAccessToken", access);
    }

    if (refresh) {
      localStorage.setItem("localRefreshToken", refresh);
    }

    return { access, refresh };
  } catch (error) {
    console.error("Failed to refresh tokens:", error);
    setTimeout(() => {
      window.location.href = "/"; // Redirect after delay
    }, 500);
    throw error;
  }
};

export const getAccessToken = () => {
  console.log(`access token function`)
  return localStorage.getItem("localAccessToken"); 
};

export const logoutUser = async () => {
  console.log("Log out user function");
  const refreshToken = localStorage.getItem("localRefreshToken");

  try {
    if (refreshToken) {
      await axiosInstance1.post("/api/v1/logout/", {
        refresh: refreshToken,
      });
    }
    } catch (error) {
      const err = error as AxiosError;
      console.error(err);
      toast.error(`Failed to Logout`);
  }
  
  localStorage.removeItem("localAccessToken");
  localStorage.removeItem("localRefreshToken");
  localStorage.removeItem("editAccessToken");
  localStorage.removeItem("role");

  // Redirect to home page after a short delay
  setTimeout(() => {
    window.location.href = "/"; // Redirect after delay
    toast.success("Logged out successfully");
  }, 500);

};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};

export const getUserRole = () => {
  return localStorage.getItem("role") || ""; // Ensure it always returns a string
};
