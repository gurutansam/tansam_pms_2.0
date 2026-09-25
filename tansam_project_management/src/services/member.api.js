import { getAuthHeaders } from "./authHeaders.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchMembers = async () => {
  const res = await fetch(`${BASE_URL}/members`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
};

export const createMember = async (member) => {
  const res = await fetch(`${BASE_URL}/members`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(member),
  });

  if (!res.ok) throw new Error("Create failed");
  return res.json();
};
export const updateMember = async (id, member) => {
  const res = await fetch(`${BASE_URL}/members/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(member),
  });
  return res.json();
};


export const deleteMember = async (id) => {
  const res = await fetch(`${BASE_URL}/members/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
};
