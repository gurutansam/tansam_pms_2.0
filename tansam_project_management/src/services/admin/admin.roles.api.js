import { getAuthHeaders as getBaseAuthHeaders } from "../authHeaders.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const BASE_ADMIN_URL = `${API_BASE}/admin`;

const getAuthHeaders = () => getBaseAuthHeaders(true);

/* =====================================================
   ROLES
===================================================== */

export const fetchRoles = async () => {
  const res = await fetch(`${BASE_ADMIN_URL}/roles`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
};

export const createRole = async (name) => {
  const res = await fetch(`${BASE_ADMIN_URL}/roles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updateRole = async (id, payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/roles/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const deleteRole = async (id) => {
  const res = await fetch(`${BASE_ADMIN_URL}/roles/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

/* =====================================================
   LABS
===================================================== */

export const fetchLabs = async () => {
  const res = await fetch(`${BASE_ADMIN_URL}/labs`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch labs");
  return res.json();
};

export const createLab = async (payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/labs`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const updateLab = async (id, payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/labs/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const deleteLab = async (id) => {
  const res = await fetch(`${BASE_ADMIN_URL}/labs/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
/* =====================================================
   Project Types
===================================================== */
// 🔹 GET project types
export const fetchProjectTypes = async () => {
  const res = await fetch(`${BASE_ADMIN_URL}/project-types`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch project types");
  return res.json();
};

// 🔹 CREATE project type
export const createProjectType = async (payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/project-types`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// 🔹 UPDATE project type
export const updateProjectType = async (id, payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/project-types/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// 🔹 DELETE project type
export const deleteProjectType = async (id) => {
  const res = await fetch(`${BASE_ADMIN_URL}/project-types/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
/* =====================================================
   Work Categories
===================================================== */
// 🔹 GET work categories
export const fetchWorkCategories = async () => {
  const res = await fetch(`${BASE_ADMIN_URL}/work-categories`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch work categories");
  return res.json();
};

// 🔹 CREATE work category
export const createWorkCategory = async (payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/work-categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// 🔹 UPDATE work category
export const updateWorkCategory = async (id, payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/work-categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// 🔹 DELETE work category
export const deleteWorkCategory = async (id) => {
  const res = await fetch(`${BASE_ADMIN_URL}/work-categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
/* =====================================================
   User
===================================================== */
// 🔹 GET users
export const fetchUsers = async () => {
  const res = await fetch(`${BASE_ADMIN_URL}/users`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

// 🔹 CREATE user
export const createUser = async (payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// 🔹 UPDATE user
export const updateUser = async (id, payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
/* =====================================================
   Client Types
===================================================== */

// 🔹 GET client types
export const fetchClientTypes = async () => {
  const res = await fetch(`${BASE_ADMIN_URL}/client-types`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch client types");
  return res.json();
};

// 🔹 CREATE client type
export const createClientType = async (payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/client-types`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// 🔹 UPDATE client type
export const updateClientType = async (id, payload) => {
  const res = await fetch(`${BASE_ADMIN_URL}/client-types/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// 🔹 DELETE client type
export const deleteClientType = async (id) => {
  const res = await fetch(`${BASE_ADMIN_URL}/client-types/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

export const fetchAdminDashboardCounts = async () => {
  const res = await fetch(`${BASE_ADMIN_URL}/dashboard-counts`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch dashboard counts");
  return res.json();
};