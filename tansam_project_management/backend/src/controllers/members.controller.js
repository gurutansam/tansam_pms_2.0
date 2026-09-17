import { connectDB } from "../config/db.js";
/* GET MEMBERS */
export const getMembers = async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(`
      SELECT
        m.id,
        m.name,
        m.email,
        m.designation,
        m.department_id AS departmentId,
        d.name AS department
      FROM members m
      LEFT JOIN departments d ON d.id = m.department_id
      ORDER BY m.name
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* CREATE MEMBER */
export const createMember = async (req, res) => {
  try {
    const { name, email, designation, departmentId } = req.body;

    const db = await connectDB();
    await db.execute(
      `INSERT INTO members (name, email, designation, department_id)
       VALUES (?, ?, ?, ?)`,
      [
        name,
        email || null,
        designation || null,
        departmentId || null,
      ]
    );

    res.status(201).json({ message: "Member created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateMember = async (req, res) => {
  const { id } = req.params;
  const { name, email, designation, departmentId } = req.body;

  const db = await connectDB();
  await db.execute(
    `UPDATE members SET name=?, email=?, designation=?, department_id=? WHERE id=?`,
    [name, email, designation, departmentId, id]
  );

  res.json({ message: "Member updated" });
};


/* DELETE MEMBER */
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    await db.execute(`DELETE FROM members WHERE id = ?`, [id]);
    res.json({ message: "Member deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
