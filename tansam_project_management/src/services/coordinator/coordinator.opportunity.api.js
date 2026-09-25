import { getAuthHeaders as getBaseAuthHeaders } from "../authHeaders.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const BASE_COORDINATOR_URL = `${API_BASE}/coordinator`;

const getAuthHeaders = () => getBaseAuthHeaders(true);

/* ============================
   OPPORTUNITIES
============================ */

// GET
export const fetchOpportunities = async () => {
  const res = await fetch(`${BASE_COORDINATOR_URL}/opportunities`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch opportunities");
  return res.json();
};

// CREATE
export const createOpportunity = async (payload) => {
  const res = await fetch(`${BASE_COORDINATOR_URL}/opportunities`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// UPDATE
export const updateOpportunity = async (opportunityId, payload) => {
  const res = await fetch(
    `${BASE_COORDINATOR_URL}/opportunities/${opportunityId}`,
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

//  DELETE
export const deleteOpportunity = async (opportunityId) => {
  const res = await fetch(
    `${BASE_COORDINATOR_URL}/opportunities/${opportunityId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

/* ============================
   CLIENT CHECK (LIVE)
============================ */

export const checkSimilarClient = async (clientName) => {
  const res = await fetch(
    `${BASE_COORDINATOR_URL}/clients/check?name=${encodeURIComponent(clientName)}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) throw new Error("Failed to check client");
  return res.json(); // returns null or { client_id, client_name }
};
