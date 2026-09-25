import { getAuthHeaders as getBaseAuthHeaders } from "../authHeaders.js";

// services/generatedQuotation.api.js
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const GENERATED_QUOTATION_URL = `${API_BASE}/generatequotation`;

const getAuthHeaders = () => getBaseAuthHeaders(true);

export const saveGeneratedQuotation = async (quotationFormData) => {
  const res = await fetch(GENERATED_QUOTATION_URL, {
    method: "POST",
    headers: getBaseAuthHeaders(), // includes Bearer token and user info without Content-Type
    body: quotationFormData, // pass FormData directly
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to save quotation");
  }

  return await res.json();
};


export const updateGeneratedQuotation = async (id, formData) => {
  const res = await fetch(`${GENERATED_QUOTATION_URL}/${id}`, {
    method: "PUT",
    headers: getBaseAuthHeaders(), // includes Bearer token and user info without Content-Type
    body: formData, // ✅ FormData
  });

  if (!res.ok) throw new Error("Failed to update quotation");
  return res.json();
};


export const deleteGeneratedQuotation = async (id) => {
  const res = await fetch(`${GENERATED_QUOTATION_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete quotation");
  return res.json();
};

export const getGeneratedQuotationById = async (id) => {
  const res = await fetch(`${GENERATED_QUOTATION_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch quotation by ID");
  return res.json();
};

// Get generated quotation by original quotation id (not by generated row id)
export const getGeneratedQuotationByQuotationId = async (quotationId) => {
  const res = await fetch(
    `${GENERATED_QUOTATION_URL}/by-quotation/${quotationId}`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) throw new Error("Failed to fetch generated quotation");
  return res.json();
};
