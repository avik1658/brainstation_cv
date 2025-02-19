import {axiosInstance1} from "@/axios";

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
    console.error("Failed to logout", error);
    throw error;
  }
  
  localStorage.removeItem("localAccessToken");
  localStorage.removeItem("localRefreshToken");

  // Redirect to home page after a short delay
  setTimeout(() => {
    window.location.href = "/"; // Redirect after delay
  }, 500);
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};
