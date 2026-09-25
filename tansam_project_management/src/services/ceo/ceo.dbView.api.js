import { getAuthHeaders as getBaseAuthHeaders } from "../authHeaders.js";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/ceo/db`;

/* 🔐 AUTH HEADERS */
const getAuthHeaders = () => getBaseAuthHeaders(true);

export const fetchAllDbTables = async () => {
  const res = await fetch(`${BASE_URL}/tables`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch DB tables");
  }

  return res.json();
};

export const fetchTableData = async (tableName) => {
  const res = await fetch(`${BASE_URL}/table/${tableName}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch table data");
  }

  return res.json();
};

export const downloadTableData = async (tableName) => {
  const res = await fetch(
    `${BASE_URL}/table/${tableName}/download`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Download failed");
  }

  return res.json();
};
