import { getAuthHeaders as getBaseAuthHeaders } from "../authHeaders.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const BASE_COORDINATOR_URL = `${API_BASE}/coordinator`;

const getAuthHeaders = () => getBaseAuthHeaders(true);

/* ============================
   OPPORTUNITY TRACKER
============================ */

// ✅ GET ALL TRACKERS
export const fetchOpportunityTrackers = async () => {
  const res = await fetch(`${BASE_COORDINATOR_URL}/opportunity-tracker`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch opportunity trackers");
  return res.json();
};

// ✅ CREATE TRACKER
export const createOpportunityTracker = async (payload) => {
  const res = await fetch(`${BASE_COORDINATOR_URL}/opportunity-tracker`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ✅ UPDATE TRACKER
export const updateOpportunityTracker = async (id, payload) => {
  const res = await fetch(
    `${BASE_COORDINATOR_URL}/opportunity-tracker/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ✅ DELETE TRACKER
export const deleteOpportunityTracker = async (id) => {
  const res = await fetch(
    `${BASE_COORDINATOR_URL}/opportunity-tracker/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
