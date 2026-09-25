import { getAuthHeaders } from "./authHeaders.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const headers = () => getAuthHeaders(true);

export const fetchProjectTypes = async () => {
  const res = await fetch(`${BASE_URL}/project-types`, { headers: headers() });
  if (!res.ok) throw new Error();
  return res.json();
};

export const createProjectType = async (data) => {
  const res = await fetch(`${BASE_URL}/project-types`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error();
};

export const updateProjectType = async (id, data) => {
  const res = await fetch(`${BASE_URL}/project-types/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error();
};

export const deleteProjectType = async (id) => {
  const res = await fetch(`${BASE_URL}/project-types/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error();
};
