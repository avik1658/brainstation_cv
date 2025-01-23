import axiosInstance from "@/axios";

export const updateToken = async () => {
  try {
    const refreshToken = localStorage.getItem("localRefreshToken");

    if (!refreshToken) {
      console.error("No refresh token found");
      throw new Error("No refresh token available");
    }

    const response = await axiosInstance.post("/api/v1/token/refresh/", {
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
    logoutUser();
    throw error;
  }
};

// Function to get the access token from localStorage
export const getAccessToken = () => {
  return localStorage.getItem("localAccessToken");
};

// Function to log out the user by clearing stored tokens and redirecting
export const logoutUser = () => {
  localStorage.removeItem("localAccessToken");
  localStorage.removeItem("localRefreshToken");
  window.location.href = "/";  // Redirect to home or login page
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};
