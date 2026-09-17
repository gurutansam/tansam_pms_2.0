import { connectDB } from "../config/db.js";
/* GET ALL DEPARTMENTS */
export const getDepartments = async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT id, name FROM departments ORDER BY name"
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* CREATE DEPARTMENT */
export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const db = await connectDB();
    await db.execute(
      "INSERT INTO departments (name) VALUES (?)",
      [name]
    );

    res.status(201).json({ message: "Department created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE DEPARTMENT */
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    await db.execute("DELETE FROM departments WHERE id = ?", [id]);
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
