import { connectDB } from "../config/db.js";
import { sendMail } from "../utils/mail.util.js";
import {
  assignedOpportunityTemplate,
  unassignedOpportunityTemplate,
  opportunityContactUpdatedTemplate,
} from "../utils/mail.template.js";
import { getUserById } from "../utils/user.helper.js";

/* ======================================================
   CONFIG
====================================================== */

const CEO_EMAIL = "ceo@yourcompany.com";

/* ======================================================
   HELPERS
====================================================== */

const ALLOWED_STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const normalizeStage = (stage) => {
  if (!stage) return "NEW";
  const clean = stage.trim().toUpperCase();
  return ALLOWED_STAGES.includes(clean) ? clean : "NEW";
};

const normalize = (v) => (v?.trim() ? v.trim() : null);

const normalizeClientName = (name) =>
  name ? name.trim().replace(/\s+/g, " ").toUpperCase() : null;

const fuzzyKey = (name) => {
  const clean = normalizeClientName(name);
  if (!clean || clean.length < 10) return clean;
  return clean.slice(0, 5) + clean.slice(-5);
};

const normalizeAssignedUsers = (assignedTo) => {
  if (!assignedTo) return null;
  if (Array.isArray(assignedTo)) return assignedTo.map(String).join(",");
  return String(assignedTo);
};

const parseAssignedUsers = (assignedTo) => {
  if (!assignedTo) return [];
  return String(assignedTo)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
};

/* ======================================================
   ID GENERATORS
====================================================== */
const generateOpportunityId = async (db) => {
  const year = new Date().getFullYear();

  const [[row]] = await db.execute(
    `
    SELECT
      MAX(
        CAST(SUBSTRING_INDEX(opportunity_id, '-', -1) AS UNSIGNED)
      ) AS max_seq
    FROM opportunities_coordinator
    WHERE opportunity_id LIKE ?
    `,
    [`OPP-${year}-%`]
  );

  const nextSeq = (row?.max_seq || 0) + 1;

  return `OPP-${year}-${String(nextSeq).padStart(3, "0")}`;
};

const generateClientId = async (db) => {
  const [[row]] = await db.execute(
    `
    SELECT
      MAX(CAST(SUBSTRING(client_id, 7) AS UNSIGNED)) AS max_seq
    FROM opportunities_coordinator
    WHERE client_id LIKE 'CLIENT%'
    `
  );

  const nextSeq = (row?.max_seq || 0) + 1;
  return `CLIENT${String(nextSeq).padStart(3, "0")}`;
};


/* ======================================================
   CREATE OPPORTUNITY
====================================================== */

export const createOpportunity = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      opportunityName,
      clientName,

      labIds,                 // ✅ ARRAY ["1","3"]
      workCategoryId,
      clientTypeId,

      contactPerson,
      contactEmail,
      contactPhone,
      leadSource,
      leadDescription,
      leadStatus,
      assignedTo,
      isNewClient,
    } = req.body;

    if (!opportunityName || !clientName) {
      return res.status(400).json({
        message: "Opportunity name and client name are required",
      });
    }

    const db = await connectDB();
    const normalizedClientName = normalizeClientName(clientName);
    const opportunityId = await generateOpportunityId(db);

    /* ================= CLIENT CHECK ================= */

    const [[exactClient]] = await db.execute(
      `
      SELECT client_id
      FROM opportunities_coordinator
      WHERE UPPER(client_name) = ?
      LIMIT 1
      `,
      [normalizedClientName]
    );

    let clientId;

    if (exactClient) {
      clientId = exactClient.client_id;
    } else {
      const key = fuzzyKey(normalizedClientName);

      const [[similarClient]] = await db.execute(
        `
        SELECT client_id, client_name
        FROM opportunities_coordinator
        WHERE UPPER(CONCAT(LEFT(client_name,5), RIGHT(client_name,5))) = ?
        LIMIT 1
        `,
        [key]
      );

      if (similarClient && !isNewClient) {
        return res.status(409).json({
          code: "SIMILAR_CLIENT_FOUND",
          existingClient: similarClient,
        });
      }

      clientId = await generateClientId(db);
    }

    /* ================= LABS (MULTI – JSON) ================= */

    let labIdsJson = JSON.stringify([]);
    let labNamesJson = JSON.stringify([]);

    if (Array.isArray(labIds) && labIds.length) {
      const placeholders = labIds.map(() => "?").join(",");

      const [labs] = await db.execute(
        `SELECT id, name FROM labs_admin WHERE id IN (${placeholders})`,
        labIds
      );

      labIdsJson = JSON.stringify(labs.map(l => Number(l.id)));
      labNamesJson = JSON.stringify(labs.map(l => l.name));
    }

    /* ================= WORK CATEGORY ================= */

    let workCategoryName = null;
    if (workCategoryId) {
      const [[wc]] = await db.execute(
        `SELECT name FROM work_categories WHERE id = ?`,
        [workCategoryId]
      );
      workCategoryName = wc?.name || null;
    }

    /* ================= CLIENT TYPE ================= */

    let clientTypeName = null;
    if (clientTypeId) {
      const [[ct]] = await db.execute(
        `SELECT name FROM client_types_admin WHERE id = ?`,
        [clientTypeId]
      );
      clientTypeName = ct?.name || null;
    }

    /* ================= ASSIGNMENT ================= */

    const assignedStr = normalizeAssignedUsers(assignedTo);

    /* ================= INSERT ================= */

    await db.execute(
      `
      INSERT INTO opportunities_coordinator (
        opportunity_id,
        opportunity_name,
        client_id,
        client_name,

        lab_id,
        lab_name,
        work_category_id,
        work_category_name,
        client_type_id,
        client_type_name,

        contact_person,
        contact_email,
        contact_phone,
        lead_source,
        lead_description,
        lead_status,
        assigned_to,
        created_by,
        created_by_name,
        created_by_role
      )
      VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      `,
      [
        opportunityId,
        normalize(opportunityName),
        clientId,
        normalizedClientName,

        labIdsJson,            //  JSON
        labNamesJson,          //  JSON
        workCategoryId || null,
        workCategoryName,
        clientTypeId || null,
        clientTypeName,

        normalize(contactPerson),
        normalize(contactEmail),
        normalize(contactPhone),
        leadSource || null,
        leadDescription || null,
        leadStatus || "NEW",
        assignedStr,
        req.user.id,
        req.user.name || req.user.username,
        req.user.role,
      ]
    );

    /* ================= MAIL ================= */

    const assignor = await getUserById(db, req.user.id);
    const userIds = parseAssignedUsers(assignedStr);
    const emails = [];

    for (const id of userIds) {
      const u = await getUserById(db, id);
      if (u?.email) emails.push(u.email);
    }

    if (emails.length) {
      await sendMail({
        to: [...new Set([...emails, CEO_EMAIL])],
        subject: `New Opportunity Assigned - ${opportunityName}`,
        html: assignedOpportunityTemplate({
          userName: "Team",
          opportunityId,
          opportunityName,
          clientName: normalizedClientName,
          stage: leadStatus || "NEW",
          assignedBy: assignor?.name || "Coordinator",
          contactPerson,
          contactEmail,
          contactPhone,
        }),
      });
    }

    res.status(201).json({
      opportunity_id: opportunityId,
      client_id: clientId,
      message: "Opportunity created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create opportunity" });
  }
};

export const checkSimilarClient = async (req, res) => {
  const { name } = req.query;
  if (!name || name.length < 3) return res.json(null);

  const db = await connectDB();
  const normalize = (v) =>
    v.trim().replace(/\s+/g, " ").toUpperCase();

  const fuzzyKey = (n) => {
    const clean = normalize(n);
    if (clean.length < 10) return clean;
    return clean.slice(0, 5) + clean.slice(-5);
  };

  const key = fuzzyKey(name);

  const [[row]] = await db.execute(
    `
    SELECT client_id, client_name
    FROM opportunities_coordinator
    WHERE UPPER(CONCAT(LEFT(client_name,5), RIGHT(client_name,5))) = ?
    LIMIT 1
    `,
    [key]
  );

  res.json(row || null);
};


/* ======================================================
   GET OPPORTUNITIES
====================================================== */
export const getOpportunities = async (req, res) => {
  const db = await connectDB();
  let sql = `SELECT * FROM opportunities_coordinator`;
  const params = [];

  if (req.user.role === "COORDINATOR") {
    sql += ` WHERE created_by = ?`;
    params.push(req.user.id);
  }

  sql += ` ORDER BY id DESC`;
  const [rows] = await db.execute(sql, params);
  res.json(rows);
};

/* ======================================================
   UPDATE OPPORTUNITY (ALL MAILS)
====================================================== */
export const updateOpportunity = async (req, res) => {
  try {
    const { opportunity_id } = req.params;
    const opportunityId = req.params.opportunity_id.trim();

    const {
      opportunityName,
      clientName,

      labIds,                 // ✅ ARRAY ["1","3"]
      workCategoryId,
      clientTypeId,

      contactPerson,
      contactEmail,
      contactPhone,
      leadSource,
      leadDescription,
      leadStatus,
      assignedTo,
      isNewClient,
      client_id,
    } = req.body;

    const db = await connectDB();
    /* ================= FETCH OLD DATA ================= */

    const [[oldOpp]] = await db.execute(
      `SELECT * FROM opportunities_coordinator WHERE opportunity_id = ?`,
      [opportunity_id]
    );

    if (!oldOpp) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    /* ================= CLIENT LOGIC ================= */

    let finalClientId = oldOpp.client_id;
    let finalClientName = oldOpp.client_name;

    if (clientName && !client_id) {
      const normalizedClientName = normalizeClientName(clientName);

      if (normalizedClientName !== oldOpp.client_name) {
        const key = fuzzyKey(normalizedClientName);

        const [[similarClient]] = await db.execute(
          `
          SELECT client_id, client_name
          FROM opportunities_coordinator
          WHERE UPPER(CONCAT(LEFT(client_name,5), RIGHT(client_name,5))) = ?
            AND client_id != ?
          LIMIT 1
          `,
          [key, oldOpp.client_id]
        );

        if (similarClient && !isNewClient) {
          return res.status(409).json({
            code: "SIMILAR_CLIENT_FOUND",
            existingClient: similarClient,
          });
        }

        await db.execute(
          `UPDATE opportunities_coordinator SET client_name = ? WHERE client_id = ?`,
          [normalizedClientName, oldOpp.client_id]
        );

        finalClientName = normalizedClientName;
      }
    }

    if (client_id && client_id !== oldOpp.client_id) {
      const [[row]] = await db.execute(
        `SELECT client_name FROM opportunities_coordinator WHERE client_id = ? LIMIT 1`,
        [client_id]
      );

      if (!row) {
        return res.status(400).json({ message: "Invalid client selected" });
      }

      finalClientId = client_id;
      finalClientName = row.client_name;
    }

    /* ================= LABS (MULTI – JSON) ================= */

    let finalLabIds = oldOpp.lab_id;
    let finalLabNames = oldOpp.lab_name;

    if (Array.isArray(labIds)) {
      if (labIds.length === 0) {
        finalLabIds = JSON.stringify([]);
        finalLabNames = JSON.stringify([]);
      } else {
        const placeholders = labIds.map(() => "?").join(",");

        const [labs] = await db.execute(
          `SELECT id, name FROM labs_admin WHERE id IN (${placeholders})`,
          labIds
        );

        finalLabIds = JSON.stringify(labs.map(l => Number(l.id)));
        finalLabNames = JSON.stringify(labs.map(l => l.name));
      }
    }

    /* ================= WORK CATEGORY ================= */

    let finalWorkCategoryName = oldOpp.work_category_name;

    if (workCategoryId) {
      const [[wc]] = await db.execute(
        `SELECT name FROM work_categories WHERE id = ?`,
        [workCategoryId]
      );
      finalWorkCategoryName = wc?.name || null;
    }

    /* ================= CLIENT TYPE ================= */

    let finalClientTypeName = oldOpp.client_type_name;

    if (clientTypeId) {
      const [[ct]] = await db.execute(
        `SELECT name FROM client_types_admin WHERE id = ?`,
        [clientTypeId]
      );
      finalClientTypeName = ct?.name || null;
    }

    /* ================= ASSIGNMENT ================= */

    const assignedStr = normalizeAssignedUsers(assignedTo);

    const oldAssigned = parseAssignedUsers(oldOpp.assigned_to);
    const newAssigned = parseAssignedUsers(assignedStr);

        const addedUsers = newAssigned.filter(
      id => !oldAssigned.includes(id)
      );


      const removedUsers = oldAssigned.filter(
      id => !newAssigned.includes(id)
      );
    /* ================= CONTACT CHANGE ================= */

    const contactChanged =
      (oldOpp.contact_person || "") !== (contactPerson || "") ||
      (oldOpp.contact_email || "") !== (contactEmail || "") ||
      (oldOpp.contact_phone || "") !== (contactPhone || "");

    /* ================= UPDATE ================= */

    await db.execute(
      `
      UPDATE opportunities_coordinator
      SET
        opportunity_name   = COALESCE(?, opportunity_name),
        client_id          = ?,
        client_name        = ?,

        lab_id             = ?,
        lab_name           = ?,
        work_category_id   = COALESCE(?, work_category_id),
        work_category_name = ?,
        client_type_id     = COALESCE(?, client_type_id),
        client_type_name   = ?,

        contact_person     = COALESCE(?, contact_person),
        contact_email      = COALESCE(?, contact_email),
        contact_phone      = COALESCE(?, contact_phone),
        lead_source        = COALESCE(?, lead_source),
        lead_description   = COALESCE(?, lead_description),
        lead_status        = COALESCE(?, lead_status),
        assigned_to        = COALESCE(?, assigned_to)
      WHERE opportunity_id = ?
      `,
      [
        normalize(opportunityName),
        finalClientId,
        finalClientName,

        finalLabIds,
        finalLabNames,
        workCategoryId || null,
        finalWorkCategoryName,
        clientTypeId || null,
        finalClientTypeName,

        normalize(contactPerson),
        normalize(contactEmail),
        normalize(contactPhone),
        leadSource || null,
        leadDescription || null,
        leadStatus || null,
        assignedStr,
        opportunity_id,
      ]
    );

    /* ================= MAILS ================= */
/* ================= MAILS ================= */

const assignor = await getUserById(db, req.user.id);

/* ================= NEW ASSIGNEES ================= */
if (addedUsers.length) {
  const emails = [];

  for (const id of addedUsers) {
    const u = await getUserById(db, id);
    if (u?.email) emails.push(u.email);
  }

  if (emails.length) {
    await sendMail({
      to: [...new Set([...emails, CEO_EMAIL])],
      subject: "New Opportunity Assigned",
      html: assignedOpportunityTemplate({
        userName: "Team",
        opportunityId,
        opportunityName: opportunityName || oldOpp.opportunity_name,
        clientName: finalClientName,
        stage: leadStatus || oldOpp.lead_status,
        assignedBy: assignor?.name || "Coordinator",
        contactPerson,
        contactEmail,
        contactPhone,
      }),
    });
  }
}

/* ================= REMOVED ASSIGNEES ================= */
if (removedUsers.length) {
  const emails = [];

  for (const id of removedUsers) {
    const u = await getUserById(db, id);
    if (u?.email) emails.push(u.email);
  }

  if (emails.length) {
    await sendMail({
      to: emails,
      subject: "Opportunity Reassigned",
      html: unassignedOpportunityTemplate({
        userName: "Team",
        opportunityId,
        opportunityName: oldOpp.opportunity_name,
        clientName: oldOpp.client_name,
        reassignedTo: "Another team member",
      }),
    });
  }
}

/* ================= CONTACT UPDATE ================= */
if (contactChanged && !addedUsers.length && oldOpp.assigned_to) {
  const emails = [];

  for (const id of oldAssigned) {
    const u = await getUserById(db, id);
    if (u?.email) emails.push(u.email);
  }

  if (emails.length) {
    await sendMail({
      to: [...new Set([...emails, CEO_EMAIL])],
      subject: "Opportunity Contact Details Updated",
      html: opportunityContactUpdatedTemplate({
        userName: "Team",
        opportunityId,
        opportunityName: opportunityName || oldOpp.opportunity_name,
        clientName: finalClientName,
        assignedBy: assignor?.name || "Coordinator",
        oldContact: {
          contactPerson: oldOpp.contact_person,
          contactEmail: oldOpp.contact_email,
          contactPhone: oldOpp.contact_phone,
        },
        newContact: {
          contactPerson,
          contactEmail,
          contactPhone,
        },
      }),
    });
  }

    }

    res.json({ message: "Opportunity updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ======================================================
   DELETE OPPORTUNITY
====================================================== */
export const deleteOpportunity = async (req, res) => {
  const { opportunity_id } = req.params;
  const db = await connectDB();

  const [result] = await db.execute(
    `
    DELETE FROM opportunities_coordinator
    WHERE opportunity_id = ?
      AND created_by = ?
    `,
    [opportunity_id, req.user.id]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: "Opportunity not found" });
  }

  res.json({ message: "Opportunity deleted successfully" });
};


/* ======================================================
   OPPORTUNITY TRACKER
====================================================== */
export const createOpportunityTracker = async (req, res) => {
  const {
    opportunity_id,
    stage,
    next_followup_date,
    next_action,
    remarks,
  } = req.body;

  const db = await connectDB();

  const [[opp]] = await db.execute(
    `
    SELECT opportunity_name, client_id, client_name, assigned_to
    FROM opportunities_coordinator
    WHERE opportunity_id = ?
    `,
    [opportunity_id]
  );

  if (!opp) {
    return res.status(404).json({ message: "Opportunity not found" });
  }

  await db.execute(
    `
    INSERT INTO opportunity_tracker (
      opportunity_id,
      opportunity_name,
      client_id,
      client_name,
      assigned_to,
      stage,
      next_followup_date,
      next_action,
      remarks,
      created_by,
      created_by_name,
      created_by_role
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      opportunity_id,
      opp.opportunity_name,
      opp.client_id,
      opp.client_name,
      opp.assigned_to,
      normalizeStage(stage),
      next_followup_date || null,
      normalize(next_action),
      normalize(remarks),
      req.user.id,
      req.user.name || req.user.username,
      req.user.role,
    ]
  );

  res.status(201).json({ message: "Opportunity tracker created successfully" });
};

/* ======================================================
   GET OPPORTUNITY TRACKERS
====================================================== */
export const getOpportunityTrackers = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const db = await connectDB();
    let query = `
      SELECT t.*
      FROM opportunity_tracker t
      INNER JOIN (
        SELECT opportunity_id, MAX(id) AS latest_id
        FROM opportunity_tracker
        GROUP BY opportunity_id
      ) latest
        ON latest.latest_id = t.id
    `;

    const params = [];

    // 🔐 Coordinator → only their opportunities
    if (req.user.role === "COORDINATOR") {
      query += ` WHERE t.created_by = ?`;
      params.push(req.user.id);
    }

    query += ` ORDER BY t.id DESC`;

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Get tracker error:", err);
    res.status(500).json({ message: "Failed to fetch opportunity trackers" });
  }
};


/* ======================================================
   UPDATE OPPORTUNITY TRACKER
====================================================== */
export const updateOpportunityTracker = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const db = await connectDB();

    /* ---------- STEP 1: FETCH TRACKER ---------- */
      const [[tracker]] = await db.execute(
        `
        SELECT opportunity_id, created_by, stage
        FROM opportunity_tracker
        WHERE id = ?
        `,
        [id]
      );

      if (!tracker) {
        return res.status(404).json({ message: "Tracker not found" });
      }

      // 🔒 LOCK STAGE
      if (tracker.stage === "WON" || tracker.stage === "LOST") {
        return res.status(403).json({
          message: `Opportunity is already ${tracker.stage} and cannot be edited`
        });
      }

    /* ---------- STEP 2: FETCH QUOTATION ---------- */
    let finalStage = normalizeStage(req.body.stage);

    const [[quotation]] = await db.execute(
      `
      SELECT quotationStatus
      FROM quotationS
      WHERE opportunity_id = ?
      ORDER BY updated_at DESC
      LIMIT 1
      `,
      [tracker.opportunity_id]
    );

    if (quotation) {
      const qStatus = quotation.quotationStatus?.trim().toUpperCase();

      if (qStatus === "APPROVED") {
        finalStage = "WON";
      } else if (qStatus === "REJECTED") {
        finalStage = "LOST";
      }
    }

    /* ---------- STEP 3: PERMISSION LOGIC ---------- */
    const isOwner = Number(tracker.created_by) === Number(req.user.id);
    const isFinance = req.user.role === "FINANCE"; // adjust role name

    if (!isOwner && !isFinance) {
      return res.status(403).json({
        message: "You are not allowed to update this opportunity"
      });
    }

    /* ---------- STEP 4: UPDATE ---------- */
   const [result] = await db.execute(
  `
  UPDATE opportunity_tracker
  SET
    stage = ?,
    next_followup_date = CASE WHEN ? THEN COALESCE(?, next_followup_date) ELSE next_followup_date END,
    next_action = CASE WHEN ? THEN COALESCE(?, next_action) ELSE next_action END,
    remarks = CASE WHEN ? THEN COALESCE(?, remarks) ELSE remarks END
  WHERE id = ?
  `,
  [
    finalStage,
    isOwner, req.body.next_followup_date,
    isOwner, normalize(req.body.next_action),
    isOwner, normalize(req.body.remarks),
    id
  ]
);


    res.json({
      message: "Opportunity tracker updated successfully",
      stage: finalStage
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update opportunity tracker" });
  }
};




/* ======================================================
   DELETE OPPORTUNITY TRACKER
====================================================== */
export const deleteOpportunityTracker = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const db = await connectDB();

    const [result] = await db.execute(
      `
      DELETE FROM opportunity_tracker
      WHERE id = ?
        AND created_by = ?
      `,
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tracker not found" });
    }

    res.json({ message: "Opportunity tracker deleted successfully" });
  } catch (err) {
    console.error("Delete tracker error:", err);
    res.status(500).json({ message: "Failed to delete opportunity tracker" });
  }
};
