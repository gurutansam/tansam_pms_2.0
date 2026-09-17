import { connectDB } from "../config/db.js";
import { sendMail } from "../utils/mail.util.js";
import {
  assignedProjectTeamTemplate,
  clientDetailsTeamTemplate,
} from "../utils/mail.template.js";



/* CREATE ASSIGNMENT */
export const assignTeamMember = async (req, res) => {
  try {
    const {
      projectId,
      memberName,
      role,
      departmentId,
      startDate,
      endDate,
    } = req.body;

    const db = await connectDB();
    /* 1️⃣ INSERT ASSIGNMENT */
await db.execute(
  `INSERT INTO project_team_assignments
   (project_id, member_name, role, department_id, start_date, end_date)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [
    projectId,
    memberName,
    role,
    departmentId,
    startDate,
    endDate,
  ]
);


    /* 2️⃣ FETCH PROJECT + CLIENT DETAILS */
    const [[project]] = await db.execute(`
      SELECT 
        p.project_name,
        p.project_type,
        p.client_name,
        o.contact_person,
        o.contact_email,
        o.contact_phone
      FROM projects p
      LEFT JOIN opportunities_coordinator o
        ON p.opportunity_id = o.opportunity_id
      WHERE p.id = ?
    `, [projectId]);

  /* 3️⃣ FETCH MEMBER EMAIL */
const [[member]] = await db.execute(
  `SELECT name, email FROM members WHERE name = ?`,
  [memberName]
);


    /* 4️⃣ SEND MAIL */
    if (member?.email && project) {
      const leadName = req.user?.name || "Team Lead";
      const leadEmail = req.user?.email || "";

 await sendMail({
  to: member.email,
  subject: `You are assigned to project: ${project.project_name}`,
  html: assignedProjectTeamTemplate({
    memberName: member.name,
    projectName: project.project_name,
    projectType: project.project_type,
    clientName: project.client_name,
    assignedBy: leadName,
    assignedByEmail: leadEmail,
    startDate,
    endDate,
    projectId,
  }),
});


      // await sendMail({
      //   to: member.email,
      //   subject: `Client Contact Details – ${project.project_name}`,
      //   html: clientDetailsTeamTemplate({
      //     memberName: member.name,
      //     projectName: project.project_name,
      //     clientName: project.client_name,
      //     contactPerson: project.contact_person,
      //     contactEmail: project.contact_email,
      //     contactPhone: project.contact_phone,
      //     assignedBy: leadName,
      //   }),
      // });
    }

    /* 5️⃣ RESPONSE */
    res.status(201).json({ message: "Team member assigned & mail sent" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* GET ASSIGNMENTS */
export const getAssignments = async (req, res) => {
  try {
    const db = await connectDB();
const [rows] = await db.execute(`
  SELECT
    a.id,
    a.project_id AS projectId,
    p.project_name AS projectName,
    a.member_name AS memberName,
    a.role,
    a.department_id AS departmentId,
    d.name AS department,
    a.start_date AS startDate,
    a.end_date AS endDate
  FROM project_team_assignments a
  JOIN projects p ON p.id = a.project_id
  JOIN departments d ON d.id = a.department_id
  ORDER BY a.id DESC
`);


    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* UPDATE ASSIGNMENT */
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      projectId,
      memberName,
      role,
      departmentId,
      // effort,
      startDate,
      endDate,
    } = req.body;

    const db = await connectDB();

  await db.execute(
  `UPDATE project_team_assignments
   SET project_id = ?,
       member_name = ?,
       role = ?,
       department_id = ?,
       start_date = ?,
       end_date = ?
   WHERE id = ?`,
  [
    projectId,
    memberName,
    role,
    departmentId,
    startDate,
    endDate,
    id,
  ]
);


    res.json({ message: "Assignment updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* DELETE ASSIGNMENT */
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    await db.execute(
      `DELETE FROM project_team_assignments WHERE id = ?`,
      [id]
    );

    res.json({ message: "Assignment removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
