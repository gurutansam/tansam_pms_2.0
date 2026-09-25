import { getAuthHeaders } from "./authHeaders.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* GET */
export const fetchDepartments = async () => {
  const res = await fetch(`${BASE_URL}/departments`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
};

/* CREATE */
export const createDepartment = async (name) => {
  const res = await fetch(`${BASE_URL}/departments`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Create failed");
  return res.json();
};

/* DELETE */
export const deleteDepartment = async (id) => {
  const res = await fetch(`${BASE_URL}/departments/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Delete failed");
  return res.json();
};
