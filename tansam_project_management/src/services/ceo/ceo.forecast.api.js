import { getAuthHeaders as getBaseAuthHeaders } from "../authHeaders.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// adjust this to your real backend route if needed
const BASE_URL = `${API_BASE}/ceo/forecast`;
/* 🔐 AUTH HEADERS */
const getAuthHeaders = () => getBaseAuthHeaders(true);

/* ================= GET ================= */
export const fetchForecasts = async () => {
  const res = await fetch(BASE_URL, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch forecasts");
  return res.json();
};

/* ================= CREATE ================= */
export const createForecast = async (payload) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Create failed");

  return data;
};

/* ================= UPDATE ================= */
export const updateForecast = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Update failed");

  return data;
};

/* ================= DELETE ================= */
export const deleteForecast = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Delete failed");
  return res.json();
};
