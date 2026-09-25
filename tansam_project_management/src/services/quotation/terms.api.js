import { getAuthHeaders as getBaseAuthHeaders } from "../authHeaders.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TERMS_URL = `${API_BASE}/terms`;

// Get user headers for authentication
const getAuthHeaders = () => getBaseAuthHeaders(true);

// Add Terms
export const addTerms = async (data) => {
  console.log("→ Sending to backend:", JSON.stringify(data, null, 2));

  const headers = getAuthHeaders();
  console.log("→ Headers:", headers);

  const res = await fetch(TERMS_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  console.log("→ Status:", res.status);

  if (!res.ok) {
    const errText = await res.text();
    console.error("Backend error response:", errText);
    throw new Error(`Failed: ${res.status} - ${errText}`);
  }

  const result = await res.json();
  console.log("→ Success:", result);
  return result;
};
// Get all terms
export const getTerms = async () => {
  const res = await fetch(TERMS_URL, { headers: getAuthHeaders() });
  if (!res.ok) {
    const errText = await res.text();
    console.error("Get Terms Error:", errText);
    throw new Error(`Failed to fetch terms: ${res.status}`);
  }
  return res.json();
};

// Update terms by ID
export const updateTerms = async (id, data) => {
  const res = await fetch(`${TERMS_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Update Terms Error:", errText);
    throw new Error(`Failed to update terms: ${res.status}`);
  }

  return res.json();
};

// Delete terms by ID
export const deleteTerms = async (id) => {
  const res = await fetch(`${TERMS_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Delete Terms Error:", errText);
    throw new Error(`Failed to delete terms: ${res.status}`);
  }

  return res.json();
};

// Get the latest active term
export const getActiveTerms = async () => {
  const res = await fetch(`${TERMS_URL}/active/latest`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Get Active Terms Error:", errText);
    throw new Error(`Failed to fetch active terms: ${res.status}`);
  }

  return res.json();
};
