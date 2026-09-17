import { connectDB } from "../config/db.js";
/* ================= GET ================= */
export const getForecasts = async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT * FROM ceo_forecast ORDER BY created_at DESC"
    );

    res.json(rows);
  } catch (err) {
    console.error("Get Forecast Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= CREATE ================= */
export const createForecast = async (req, res) => {
  try {
    const db = await connectDB();
    const {
      workCategoryId,
      workCategoryName,
      clientName,
      totalValue,
      confidence,
      realizable,
      fy,
      carryover,
      remarks,
    } = req.body;
   const created_by = req.user.id;
   console.log("created_by:", created_by);

    const [result] = await db.execute(
      `
      INSERT INTO ceo_forecast (
        work_category_id,
        work_category_name,
        client_name,
        total_value,
        confidence,
        realizable_value,
        fy,
        carryover,
        remarks,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        workCategoryId,
        workCategoryName,
        clientName,
        totalValue,
        confidence,
        realizable,
        fy,
        carryover,
        remarks,
        req.user.id,
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Create Forecast Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateForecast = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const {
      workCategoryId,
      workCategoryName,
      clientName,
      totalValue,
      confidence,
      realizable,
      fy,
      carryover,
      remarks,
    } = req.body;

    await db.execute(
      `
      UPDATE ceo_forecast SET
        work_category_id = ?,
        work_category_name = ?,
        client_name = ?,
        total_value = ?,
        confidence = ?,
        realizable_value = ?,
        fy = ?,
        carryover = ?,
        remarks = ?
      WHERE id = ?
      `,
      [
        workCategoryId,
        workCategoryName,
        clientName,
        totalValue,
        confidence,
        realizable,
        fy,
        carryover,
        remarks,
        id,
      ]
    );

    res.json({ message: "Forecast updated successfully" });
  } catch (err) {
    console.error("Update Forecast Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */
export const deleteForecast = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    await db.execute(
      "DELETE FROM ceo_forecast WHERE id = ?",
      [id]
    );

    res.json({ message: "Forecast deleted successfully" });
  } catch (err) {
    console.error("Delete Forecast Error:", err);
    res.status(500).json({ message: err.message });
  }
};
