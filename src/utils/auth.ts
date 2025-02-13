import axiosInstance from "@/axios";

export const updateToken = async () => {
  try {
    const refreshToken = localStorage.getItem("localRefreshToken");
    console.log(`update token function`)
    console.log("Refresh Token:", refreshToken);
    if (!refreshToken) {
      console.error("No refresh token found");
      throw new Error("No refresh token available");
    }

    const response = await axiosInstance.post("/api/token/refresh/", {
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

export const getAccessToken = () => {
  console.log(`access token function`)
  return localStorage.getItem("localAccessToken"); 
};

export const logoutUser = () => {
  console.log("Log out user function")
  localStorage.removeItem("localAccessToken");
  localStorage.removeItem("localRefreshToken");

  setTimeout(() => {
    window.location.href = "/"; // Redirect after delay
  }, 500);
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};
