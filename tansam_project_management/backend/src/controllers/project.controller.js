import { connectDB } from "../config/db.js";
/* ======================================================
   CREATE PROJECT
====================================================== */
export const createProject = async (req, res) => {
  try {
    const db = await connectDB();
    // 🔐 USER INFO FROM HEADERS
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    const {
      projectType,
      projectName,
      clientName,
      opportunityId,
      startDate,
      endDate,
      status,
      quotationNumber,
      poNumber,
    } = req.body;

    const poFilePath = req.file ? req.file.path : null;

    const normalizedType = projectType
      ?.toUpperCase()
      .replace(/\s+/g, "_");

    let finalProjectName = projectName;
    let finalClientName = clientName;
    let oppId = null;

    // 🔧 REQUIRED FIELDS
    let lab_id = null;
    let lab_name = null;
    let work_category_id = null;
    let work_category_name = null;
    let client_type_id = null;
    let client_type_name = null;

    /* ================= OPPORTUNITY DATA ================= */
    if (normalizedType === "CUSTOMER" || normalizedType === "CUSTOMER_POC") {
      if (!opportunityId) {
        return res.status(400).json({
          message:
            "Opportunity ID is required for Customer / Customer POC projects",
        });
      }

      const [[opp]] = await db.execute(
        `
        SELECT
          opportunity_id,
          opportunity_name,
          client_name,
          lab_id,
          lab_name,
          work_category_id,
          work_category_name,
          client_type_id,
          client_type_name
        FROM opportunities_coordinator
        WHERE opportunity_id = ?
        `,
        [opportunityId]
      );

      if (!opp) {
        return res.status(400).json({ message: "Invalid opportunity ID" });
      }

      lab_id = opp.lab_id;
      lab_name = opp.lab_name;
      work_category_id = opp.work_category_id;
      work_category_name = opp.work_category_name;
      client_type_id = opp.client_type_id;
      client_type_name = opp.client_type_name;

      finalProjectName ||= opp.opportunity_name;
      finalClientName ||= opp.client_name;
      oppId = opp.opportunity_id;
    }

    /* ================= CUSTOMER VALIDATION ================= */
    if (
      normalizedType === "CUSTOMER" &&
      (!quotationNumber || !poNumber || !poFilePath)
    ) {
      return res.status(400).json({
        message:
          "Quotation Number, PO Number, and PO File are required for Customer projects",
      });
    }

    /* ================= INSERT PROJECT ================= */
    const [result] = await db.execute(
      `
      INSERT INTO projects (
        project_name,
        client_name,
        project_type,
        opportunity_id,

        lab_id,
        lab_name,
        work_category_id,
        work_category_name,
        client_type_id,
        client_type_name,

        start_date,
        end_date,
        status,
        quotation_number,
        po_number,
        po_file,

        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        finalProjectName,
        finalClientName,
        normalizedType,
        oppId,

        lab_id,
        lab_name,
        work_category_id,
        work_category_name,
        client_type_id,
        client_type_name,

        startDate,
        endDate,
        status || "Planned",
        normalizedType === "CUSTOMER" ? quotationNumber : null,
        normalizedType === "CUSTOMER" ? poNumber : null,
        normalizedType === "CUSTOMER" ? poFilePath : null,

        userId, // 🔥 TEAM LEAD ID
      ]
    );

    const projectId = result.insertId;

    /* ================= PROJECT REFERENCE ================= */
    if (normalizedType === "CUSTOMER_POC" && oppId) {
      const projectReference = `${oppId}/prj-${projectId}`;
      await db.execute(
        `UPDATE projects SET project_reference=? WHERE id=?`,
        [projectReference, projectId]
      );
    }

    res.status(201).json({
      message: "Project created successfully",
      projectId,
    });
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET PROJECTS
====================================================== */
export const getProjects = async (req, res) => {
  try {
    const db = await connectDB();

    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    let query = `
      SELECT
        p.id,
        p.project_name AS projectName,
        p.client_name AS clientName,
        p.project_type AS projectType,
        p.opportunity_id AS opportunityId,
        p.lab_id AS labId,
        COALESCE(p.lab_name, o.lab_name) AS labNames,
        p.work_category_id AS workCategoryId,
        COALESCE(p.work_category_name, o.work_category_name) AS workCategory,
        p.start_date AS startDate,
        p.end_date AS endDate,
        p.status,
        COALESCE(p.client_type_name, o.client_type_name) AS clientType,
        p.quotation_number AS quotationNumber,
        p.po_number AS poNumber,
        p.po_file AS poFile,

        -- 🔽 FROM opportunities_coordinator
        o.contact_person AS contactPerson,
        o.contact_email AS contactEmail,
        o.contact_phone AS contactPhone,

        p.created_by
      FROM projects p
      LEFT JOIN opportunities_coordinator o
        ON p.opportunity_id = o.opportunity_id
    `;

    let params = [];

    // 🔐 TEAM LEAD → only own projects
    if (role === "TEAM LEAD") {
      query += ` WHERE p.created_by = ?`;
      params.push(userId);
    }

    query += ` ORDER BY p.id DESC`;

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};


/* ======================================================
   UPDATE PROJECT
====================================================== */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      projectName,
      clientName,
      projectType,
      startDate,
      endDate,
      status,
      quotationNumber,
      poNumber,
    } = req.body;

    const poFilePath = req.file ? req.file.path : null;

    const db = await connectDB();

    await db.execute(
      `
      UPDATE projects SET
        project_name = ?,
        client_name = ?,
        project_type = ?,
        start_date = ?,
        end_date = ?,
        status = ?,
        quotation_number = ?,
        po_number = ?,
        po_file = ?
      WHERE id = ?
      `,
      [
        projectName,
        clientName,
        projectType,
        startDate,
        endDate,
        status,
        quotationNumber || null,
        poNumber || null,
        poFilePath,
        id,
      ]
    );

    res.json({ message: "Project updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   DELETE PROJECT
====================================================== */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    await db.execute(`DELETE FROM projects WHERE id = ?`, [id]);

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
