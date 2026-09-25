/**
 * Standardized Auth Headers helper for API requests
 * Supports JWT Bearer authorization and backwards-compatible user headers.
 */
export const getAuthHeaders = (options = {}) => {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  let headers = {};
  if (options === true) {
    headers["Content-Type"] = "application/json";
  } else if (typeof options === "object" && options !== null) {
    headers = { ...options };
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (user) {
    if (user.id) headers["x-user-id"] = String(user.id);
    if (user.role) headers["x-user-role"] = String(user.role);
    if (user.username || user.name) {
      headers["x-user-name"] = String(user.username || user.name);
    }
  }

  return headers;
};
