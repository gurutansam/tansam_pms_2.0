import { connectDB } from "../config/db.js";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { createQuotationDocx } from "../utils/QuotationDocx.js";
import { G } from "@react-pdf/renderer";
// Get all quotations

// controllers/quotation.controller.js
// controllers/quotation.controller.js
export const generateQuotationNo = async (req, res) => {
  try {
    const db = await connectDB();

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Financial year logic
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    const financialYear = `${startYear}-${endYear}`;

    const [rows] = await db.query(
      `
      SELECT quotationNo 
      FROM quotations
      WHERE quotationNo LIKE ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [`TANSAM-%/${financialYear}`]
    );

    let nextNumber = 1001;

    if (rows.length > 0) {
      const lastNo = rows[0].quotationNo;
      const match = lastNo.match(/TANSAM-(\d+)\//);
      if (match) nextNumber = Number(match[1]) + 1;
    }

    const quotationNo = `TANSAM-${nextNumber}/${financialYear}`;

    res.json({ quotationNo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate quotation number" });
  }
};


export const getQuotations = async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT * FROM quotations ORDER BY id ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Get Quotations Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add quotation
export const addQuotation = async (req, res) => {
  try {
    const db = await connectDB();
    //const quotationNo = await generateQuotationNo(db);

    const {
      items = [],
      qty,
      unitPrice,
      gst,
      opportunity_id,
      opportunity_name = null,
      quotationNo = null,
      clientName,
      client_type_id,
      client_type_name = null,
      work_category_id,
      work_category_name = null,
      lab_id,
      lab_name = null,
      description = null,
      date,
      quotationStatus = "Draft",
    } = req.body;

    // --- Fetch client_id from opportunities_coordinator ---
    const [[client]] = await db.execute(
      `
      SELECT client_id
      FROM opportunities_coordinator
      WHERE UPPER(client_name) = UPPER(?)
      LIMIT 1
      `,
      [clientName]
    );

    if (!client) {
      return res.status(400).json({ message: "Client not found in opportunities" });
    }

    const client_id = client.client_id;

    // --- Prepare itemDetails array ---
    // --- Normalize items (string | array | empty) ---
    let parsedItems = [];

    if (Array.isArray(items)) {
      parsedItems = items;
    } else if (typeof items === "string") {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        parsedItems = [];
      }
    }

    // --- Prepare itemDetails array ---
    const itemsArray = parsedItems.length
      ? parsedItems.map((item) => {
        const q = Number(item.qty || 0);
        const u = Number(item.unitPrice || 0);
        const g = Number(item.gst || 0);
        const base = q * u;
        const total = base + base * (g / 100);

        return {
          // description: item.description || "",
          qty: q,
          unitPrice: u,
          gst: g,
          total,
        };
      })
      : [
        {

          qty: Number(qty || 0),
          unitPrice: Number(unitPrice || 0),
          gst: Number(gst || 0),
          total:
            Number(qty || 0) *
            Number(unitPrice || 0) *
            (1 + Number(gst || 0) / 100),
        },
      ];

    const itemDetails = JSON.stringify(itemsArray);


    // --- Compute total value from itemDetails ---
    const totalValue = itemsArray.reduce((sum, item) => sum + Number(item.total || 0), 0);

    // --- Normalize IDs ---
    const oppId = opportunity_id ? String(opportunity_id) : null;
    const clientTypeId = client_type_id ? Number(client_type_id) : null;
    const workCategoryId = work_category_id ? Number(work_category_id) : null;
    const labId = lab_id ? String(lab_id) : null;

    // --- Format date for MySQL ---
    const quotationDate = date
      ? new Date(date).toISOString().slice(0, 19).replace("T", " ")
      : new Date().toISOString().slice(0, 19).replace("T", " ");
    // 🔒 Check opportunity stage
    // 🔒 Check opportunity stage (SAFE)
    const oppIds = opportunity_id
      ? String(opportunity_id).split(",").map(id => id.trim())
      : [];

    if (oppIds.length === 0) {
      return res.status(400).json({ message: "Opportunity not selected" });
    }

    // const [oppRows] = await db.execute(
    //   `
    //   SELECT opportunity_id, stage
    //   FROM opportunity_tracker
    //   WHERE opportunity_id IN (${oppIds.map(() => "?").join(",")})
    //   `,
    //   oppIds
    // );

    // // ❗ If ANY opportunity is not WON → block
    // const notWon = oppRows.find(
    //   o => (o.stage || "").trim().toUpperCase() !== "WON"
    // );

    // if (notWon) {
    //   return res.status(403).json({
    //     message: "Quotation can be created only when opportunity stage is WON",
    //   });
    // }

    // --- Debug log (optional) ---
    console.log({
      oppId,
      opportunity_name,
      quotationNo,
      client_id,
      clientName,
      clientTypeId,
      client_type_name,
      workCategoryId,
      work_category_name,
      labId,
      lab_name,
      description,
      totalValue,
      quotationDate,
      quotationStatus,
      itemDetails,
    });

    // --- Insert into quotations ---
    const [result] = await db.execute(
      `
      INSERT INTO quotations (
        opportunity_id,
        opportunity_name,
        quotationNo,
        client_id,
        clientName,
        client_type_id,
        client_type_name,
        work_category_id,
        work_category_name,
        lab_id,
        lab_name,
        description,
        itemDetails,
 
        date,
        quotationStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        oppId,
        opportunity_name,
        quotationNo,
        client_id,
        clientName,
        clientTypeId,
        client_type_name,
        workCategoryId,
        work_category_name,
        labId,
        lab_name,
        description,
        itemDetails,
        // ✅ always calculated from itemsArray
        quotationDate,
        quotationStatus,
      ]
    );
    const oldQuotationValue = null;
const newQuotationValue = totalValue;
const oldPaymentForLog = null;
const newPaymentForLog = req.body.paymentAmount ?? null;
const auditAction = "Quotation created";
await db.execute(
  `
  INSERT INTO audit_log
  (
    quotation_No,
    opportunity_id,
    opportunity_name,
    old_quotation_value,
    new_quotation_value,
    old_payment_value,
    new_payment_value,
    action
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  [
    quotationNo,
   oppId,                 // ✅ comes from req.body
    opportunity_name, 
    oldQuotationValue,
    newQuotationValue,
    oldPaymentForLog,
    newPaymentForLog,
    auditAction
  ]
);

    res.status(201).json({
      id: result.insertId,
      quotationStatus: "Draft",
      message: "Quotation created successfully",
    });
  } catch (error) {
    console.error("Add Quotation Error:", error);
    res.status(500).json({ message: error.message });
  }
};




// Update quotation
// Update quotation
// Update quotation
// Update Quotation
export const updateQuotation = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    // Fetch existing quotation
    const [[existing]] = await db.execute(
      "SELECT * FROM quotations WHERE id = ?",
      [id]
    );

    if (!existing) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const currentStatus = existing.quotationStatus;
    // 🔍 Capture OLD values for audit log (VERY IMPORTANT: before changes)
    const oldItems = existing.itemDetails
      ? JSON.parse(existing.itemDetails)
      : [];


    const oldQuotationValue = oldItems.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
    const oldPaymentValue = Number(existing.paymentAmount || 0);
    const quotationNo = existing.quotationNo;

    // -----------------------------
    // Helper functions
    // -----------------------------
    const sanitizeDecimal = (val) => {
      if (val === '' || val === undefined || val === null) return null;
      return Number(val);
    };

    const sanitizeDate = (val) => {
      if (!val || val.trim() === "") return null;
      return val;
    };

    // -----------------------------
    // Sanitize all fields
    // -----------------------------
    const safeBody = {};
    [
      "opportunity_name",
      "clientName",
      "client_type_name",
      "work_category_name",
      "lab_name",
      "description",
      "date",
      "quotationStatus",
      "project_name",
      "paymentPhase",

      "poNumber",
      "remarks",
      "paymentReceived",
      "paymentReceivedDate",
      "paymentPendingReason",
      "client_id"
    ].forEach((key) => {
      let val = req.body[key] ?? null;
      if (key === "paymentReceivedDate" || key === "date") {
        val = sanitizeDate(val);
      }
      safeBody[key] = val;
    });

    // Numeric fields

    safeBody.paymentAmount = sanitizeDecimal(req.body.paymentAmount);
    safeBody.value = sanitizeDecimal(req.body.value);

  
    const existingItems = existing.itemDetails ? JSON.parse(existing.itemDetails) : [];

    // Normalize items (array | string | empty)
    let parsedItems = [];

    if (Array.isArray(req.body.items)) {
      parsedItems = req.body.items;
    } else if (typeof req.body.items === "string") {
      try {
        parsedItems = JSON.parse(req.body.items);
      } catch (e) {
        parsedItems = [];
      }
    } else if (!req.body.items || req.body.items.length === 0) {
      // Use existing items if no new items are provided
      parsedItems = existingItems;
    }

    // Recalculate totals
    safeBody.itemDetails = JSON.stringify(
      parsedItems.map(item => ({
        // description: item.description || "",
        qty: sanitizeDecimal(item.qty) || 0,
        unitPrice: sanitizeDecimal(item.unitPrice) || 0,
        gst: sanitizeDecimal(item.gst) || 0,
        total:
          (sanitizeDecimal(item.qty) || 0) *
          (sanitizeDecimal(item.unitPrice) || 0) *
          (1 + (sanitizeDecimal(item.gst) || 0) / 100),
      }))
    );

    // Update total value
    safeBody.value = parsedItems.reduce((sum, item) => sum + (item.total || 0), 0);

    safeBody.paymentAmount = sanitizeDecimal(req.body.paymentAmount);

    // ================================
    // 🔍 AUDIT LOG (SAFE POSITION)
    // ================================
    const newQuotationValue = parsedItems.reduce((sum, item) => {
      const qty = sanitizeDecimal(item.qty) || 0;
      const unit = sanitizeDecimal(item.unitPrice) || 0;
      const gst = sanitizeDecimal(item.gst) || 0;
      const base = qty * unit;
      return sum + base * (1 + gst / 100);
    }, 0);

    safeBody.value = newQuotationValue;

    const newPaymentValue =
      safeBody.paymentAmount !== null
        ? Number(safeBody.paymentAmount)
        : oldPaymentValue;

    const quotationValueChanged =
      oldQuotationValue !== newQuotationValue;

    const paymentChanged =
      oldPaymentValue !== newPaymentValue &&
      newPaymentValue !== null;

    let auditAction = null;
    let oldPaymentForLog = null;
    let newPaymentForLog = null;

    if (quotationValueChanged) {
      auditAction = "Quotation updated";
      oldPaymentForLog = null;
      newPaymentForLog = null;
    }

    if (!oldPaymentValue && newPaymentValue) {
      auditAction = "Payment created";
      oldPaymentForLog = oldPaymentValue;
      newPaymentForLog = newPaymentValue;
    }

    if (oldPaymentValue && paymentChanged) {
      auditAction = "Payment updated";
      oldPaymentForLog = oldPaymentValue;
      newPaymentForLog = newPaymentValue;
    }

    if (auditAction) {
await db.execute(
  `
  INSERT INTO audit_log
  (
    quotation_No,
    opportunity_id,
    opportunity_name,
    old_quotation_value,
    new_quotation_value,
    old_payment_value,
    new_payment_value,
    action
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  [
    quotationNo,
   existing.opportunity_id,  // ✅ use existing record
      safeBody.opportunity_name || existing.opportunity_name,
    oldQuotationValue,
    newQuotationValue,
    oldPaymentForLog,
    newPaymentForLog,
    auditAction
  ]
);
    }


    // -----------------------------
    // Determine final status
    // -----------------------------
    const finalStatus = safeBody.quotationStatus ?? currentStatus;

    // Fetch opportunity stage
    // const [oppRows] = await db.execute(
    //   `SELECT stage FROM opportunity_tracker WHERE opportunity_name = ? LIMIT 1`,
    //   [safeBody.opportunity_name]
    // );
    // const opp = oppRows[0];

    // if (!opp) return res.status(400).json({ message: "Opportunity not found" });

    // // Block approval if stage not WON
    // if (safeBody.quotationStatus === "Approved" && opp.stage !== "WON") {
    //   return res.status(403).json({
    //     message: "Quotation can be approved only when opportunity stage is WON",
    //   });
    // }

    // Ensure client_id exists
    // -----------------------------
    let client_id = safeBody.client_id;
    if (!client_id && safeBody.clientName) {
      const [[client]] = await db.execute(
        `SELECT client_id FROM opportunities_coordinator WHERE UPPER(client_name)=UPPER(?) LIMIT 1`,
        [safeBody.clientName]
      );
      if (!client) {
        return res.status(400).json({ message: "Client not found" });
      }
      client_id = client.client_id;
    }

    // -----------------------------
    // Payment data based on status
    // -----------------------------
    const paymentData =
      finalStatus === "Approved"
        ? {
          paymentPhase: safeBody.paymentPhase ?? "Started",

          poNumber: safeBody.poNumber,
          remarks: safeBody.remarks,
          paymentReceived: safeBody.paymentReceived ?? "No",
          paymentAmount: safeBody.paymentAmount,
          paymentReceivedDate: safeBody.paymentReceivedDate, // sanitized
          paymentPendingReason: safeBody.paymentPendingReason
        }
        : {
          paymentPhase: "Not Started",

          poNumber: null,
          remarks: null,
          paymentReceived: "No",
          paymentAmount: null,
          paymentReceivedDate: null,
          paymentPendingReason: null
        };

    // -----------------------------
    // Update quotation
    // -----------------------------
    await db.execute(
      `
      UPDATE quotations
      SET
        opportunity_name = ?,
        clientName = ?,
        client_type_name = ?,
        work_category_name = ?,
        lab_name = ?,
        description = ?,
        itemDetails = ?,
        date = ?,
        quotationStatus = ?,
        paymentPhase = ?,
        poNumber = ?, 
        remarks = ?,   
        paymentReceived = ?,
        paymentAmount = ?,
        paymentReceivedDate = ?,   
        paymentPendingReason = ?,
        client_id = ?
      WHERE id = ?
      `,
      [
        safeBody.opportunity_name,
        safeBody.clientName,
        safeBody.client_type_name,
        safeBody.work_category_name,
        safeBody.lab_name,
        safeBody.description,
        safeBody.itemDetails,

        safeBody.date,
        finalStatus,
        paymentData.paymentPhase,


        paymentData.poNumber,
        paymentData.remarks,
      
        paymentData.paymentReceived,
        paymentData.paymentAmount,
        paymentData.paymentReceivedDate,
        paymentData.paymentPendingReason,
        client_id,
        id
      ]
    );

    // -------------------------------------------------
    // 🔥 ADDED LOGIC: AUTO UPDATE OPPORTUNITY STAGE
    // -------------------------------------------------
    if (finalStatus === "Approved" || finalStatus === "Rejected") {
      const newStage = finalStatus === "Approved" ? "WON" : "LOST";

      await db.execute(
        `
        UPDATE opportunity_tracker
        SET stage = ?
        WHERE opportunity_id = ?
        `,
        [newStage, existing.opportunity_id]
      );
    }

    // -----------------------------
    // Response
    // -----------------------------
    res.json({
      message: "Quotation updated successfully",
      id,
      quotationStatus: finalStatus,
    });

  } catch (error) {
    console.error("Update Quotation Error:", error);
    res.status(500).json({ message: error.message });
  }
};





// Delete quotation
export const deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
    // 🔴 CRITICAL: delete child rows FIRST
    await db.execute(
      "DELETE FROM generated_quotations WHERE quotationId = ?",
      [id]
    );

    // ✅ then delete parent
    await db.execute(
      "DELETE FROM quotations WHERE id = ?",
      [id]
    );

    res.json({
      message: "Quotation and related generated quotations deleted",
      id,
    });
  } catch (error) {
    console.error("Delete Quotation Error:", error);
    res.status(500).json({ message: error.message });
  }
};




export const getQuotationById = async (id) => {
  const db = await connectDB();
  const [rows] = await db.execute("SELECT * FROM quotations WHERE id=?", [id]);
  return rows[0]; // or null if not found
};
//Download Quotation as DOCX
export const downloadQuotationDocx = async (req, res) => {
  const { id } = req.params;
  const quotation = await getQuotationById(id);

  if (!quotation) return res.status(404).send("Quotation not found");

  const buffer = await createQuotationDocx(quotation);

  res.set({
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename=Quotation_${quotation.quotationNo}.docx`,
  });
  res.send(buffer);
};
