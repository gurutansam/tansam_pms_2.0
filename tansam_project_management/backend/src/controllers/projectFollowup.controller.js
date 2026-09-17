import { connectDB } from "../config/db.js";
/* ================= GET PROJECT FOLLOW UPS ================= */
export const getProjectFollowups = async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(`
  SELECT
    p.id AS projectId,
    p.project_name AS projectName,
    p.client_name AS clientName,
    p.quotation_number AS quotationCode,
    p.status,
    p.po_file AS poFile,

    COUNT(DISTINCT a.id) AS teamMembers,

    f.id AS followupId,
    f.progress,
    f.next_milestone AS nextMilestone,
    f.milestone_due_date AS milestoneDueDate,
    f.issue_description AS issueDescription,
    f.created_at AS createdAt,
    f.updated_at AS updatedAt

  FROM projects p
  LEFT JOIN project_team_assignments a
    ON a.project_id = p.id
  LEFT JOIN project_followups f
    ON f.project_id = p.id

  GROUP BY
    p.id,
    p.project_name,
    p.client_name,
    p.quotation_number,
    p.status,
    p.po_file,
    f.id,
    f.progress,
    f.next_milestone,
    f.milestone_due_date,
    f.issue_description,
    f.created_at,
    f.updated_at

  ORDER BY COALESCE(f.updated_at, f.created_at) DESC
`);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* ================= CREATE / INIT FOLLOWUP ================= */
// export const createProjectFollowup = async (req, res) => {
//   try {
//     const db = await connectDB();

//     const {
//       projectId,
//       progress,
//       nextMilestone,
//       milestoneDueDate,
//       criticalIssues,
//     } = req.body;

//     await db.execute(
//       `INSERT INTO project_followups
//        (project_id, progress, next_milestone, milestone_due_date, critical_issues)
//        VALUES (?, ?, ?, ?, ?)`,
//       [
//         projectId,
//         progress || 0,
//         nextMilestone || null,
//         milestoneDueDate || null,
//         criticalIssues || 0,
//       ]
//     );

//     res.status(201).json({ message: "Follow-up created" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

/* ================= UPDATE FOLLOWUP ================= */
/* ================= UPDATE FOLLOWUP ================= */
export const updateProjectFollowup = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      status,
      progress,
      nextMilestone,
      milestoneDueDate,
      issueDescription,
    } = req.body;

    const db = await connectDB();

    // 🔁 UPSERT FOLLOWUP
    await db.execute(
      `
      INSERT INTO project_followups
        (project_id, progress, next_milestone, milestone_due_date, issue_description)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        progress = VALUES(progress),
        next_milestone = VALUES(next_milestone),
        milestone_due_date = VALUES(milestone_due_date),
        issue_description = VALUES(issue_description),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        projectId,
        progress || 0,
        nextMilestone || null,
        milestoneDueDate || null,
        issueDescription || null,
      ]
    );

    // 🔄 Update project status separately
    if (status) {
      await db.execute(
        `UPDATE projects SET status = ? WHERE id = ?`,
        [status, projectId]
      );
    }

    res.json({ message: "Follow-up updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
