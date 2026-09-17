import { connectDB } from "../config/db.js";
/* GET PROJECT TYPES (TL) */
export const getProjectTypes = async (req, res) => {
  const db = await connectDB();

  // ✅ REQUIRED
  const [rows] = await db.execute(
    `SELECT id, name, status
     FROM project_types
     ORDER BY name`
  );

  res.json(rows);
};

/* CREATE PROJECT TYPE (TL only) */
export const createProjectType = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  const db = await connectDB();
  await db.execute(
    `INSERT INTO project_types (name, created_by)
     VALUES (?, ?)`,
    [name.trim(), userId]
  );

  res.status(201).json({ message: "Project type created" });
};

/* UPDATE */
export const updateProjectType = async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  const db = await connectDB();
  await db.execute(
    `UPDATE project_types SET name=?, status=? WHERE id=?`,
    [name, status, id]
  );

  res.json({ message: "Project type updated" });
};

/* DELETE */
export const deleteProjectType = async (req, res) => {
  const { id } = req.params;
  const db = await connectDB();
  await db.execute(`DELETE FROM project_types WHERE id=?`, [id]);
  res.json({ message: "Project type deleted" });
};
