// Authentication utility functions

/**
 * Get the auth token from localStorage
 */
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Set the auth token in localStorage
 */
export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

/**
 * Remove the auth token from localStorage
 */
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

/**
 * Decode JWT token (client-side only)
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Get user data from token
 */
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
};

/**
 * Logout user
 */
export const logout = () => {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};
