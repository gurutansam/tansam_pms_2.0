import { getAuthHeaders as getBaseAuthHeaders } from "./authHeaders.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* 🔐 AUTH HEADERS */
const getAuthHeaders = () => getBaseAuthHeaders(true);

/* GET */
export const fetchAssignments = async () => {
  const res = await fetch(`${BASE_URL}/assignments`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
};

/* CREATE */
export const createAssignment = async (data) => {
  const res = await fetch(`${BASE_URL}/assignments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
};

/* UPDATE */
export const updateAssignment = async (id, data) => {
  const res = await fetch(`${BASE_URL}/assignments/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
};

/* DELETE */
export const deleteAssignment = async (id) => {
  const res = await fetch(`${BASE_URL}/assignments/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(), // 🔥 REQUIRED
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
};
