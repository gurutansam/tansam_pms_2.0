import { connectDB } from "../config/db.js";
/* ===========================
   GET ALL TERMS
=========================== */
export const getTerms = async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT * FROM terms_conditions ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error("Get Terms Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   ADD TERMS
=========================== */
export const addTerms = async (req, res) => {
  try {
    const db = await connectDB();
    const { content, status } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const [result] = await db.execute(
      `INSERT INTO terms_conditions (content, status)
       VALUES (?, ?)`,
      [content, status || "In-Active"]
    );

    res.status(201).json({
      id: result.insertId,
      content,
      status: status || "In-Active",
    });
  } catch (error) {
    console.error("Add Terms Error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ===========================
   UPDATE TERMS
=========================== */
export const updateTerms = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const { content, status } = req.body;

    await db.execute(
      `UPDATE terms_conditions
       SET content = ?, status = ?
       WHERE id = ?`,
      [content, status, id]
    );

    res.json({ id, content, status });
  } catch (error) {
    console.error("Update Terms Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ===========================
   DELETE TERMS
=========================== */
export const deleteTerms = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    await db.execute(
      "DELETE FROM terms_conditions WHERE id=?",
      [id]
    );

    res.json({ message: "Terms deleted", id });
  } catch (error) {
    console.error("Delete Terms Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   GET ACTIVE TERMS (USED IN QUOTATION)
=========================== */
export const getActiveTerms = async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(`
      SELECT * FROM terms_conditions
      WHERE status='Active'
      ORDER BY id DESC
    `);

    res.json(rows); // return the full array
  } catch (error) {
    console.error("Get Active Terms Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
