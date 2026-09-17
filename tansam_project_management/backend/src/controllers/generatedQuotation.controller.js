// controllers/generatedQuotation.controller.js
import { connectDB } from "../config/db.js";
// import { generateQuotationPdf } from "../utils/generateQuotationPdf.js"; // if you want backend PDF generation

// Get all generated quotations
export const getGeneratedQuotations = async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT * FROM generated_quotations ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Get Generated Quotationsa Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a new quotation
// controllers/generatedQuotation.controller.js
// controllers/generatedQuotation.controller.js

export const addGeneratedQuotation = async (req, res) => {
  try {
    const db = await connectDB();
    const quotationId = req.body.quotation_id;
    if (!quotationId) {
      return res.status(400).json({ message: "Missing quotation_id" });
    }

    const {
      quotationNo, date, clientName, kindAttn, subject,
      items, terms, termsContent, financeManagerName, designation,
    } = req.body;

    const signaturePath = req.files?.signature?.[0]
      ? `uploads/po/${req.files.signature[0].filename}`
      : null;

    const sealPath = req.files?.seal?.[0]
      ? `uploads/po/${req.files.seal[0].filename}`
      : null;

    // 🔍 CHECK if generated quotation already exists
    const [existing] = await db.execute(
      "SELECT id, signature, seal FROM generated_quotations WHERE quotationId = ? LIMIT 1",
      [quotationId]
    );

    // ===============================
    // 🔁 UPDATE
    // ===============================
    if (existing.length) {
      const existingRow = existing[0];

      await db.execute(
        `UPDATE generated_quotations
         SET quotationNo=?, date=?, clientName=?, kindAttn=?, subject=?,
             items=?, terms=?, termsContent=?, 
             signature=?, seal=?, financeManagerName=?, designation=?
         WHERE quotationId=?`,
        [
          quotationNo,
          date,
          clientName,
          kindAttn,
          subject,
          items ? JSON.stringify(JSON.parse(items)) : "[]",
          terms ? JSON.stringify(JSON.parse(terms)) : "[]",
          termsContent || null,
          signaturePath || existingRow.signature,
          sealPath || existingRow.seal,
          financeManagerName,
          designation,
          quotationId,
        ]
      );

      return res.json({
        success: true,
        updated: true,
        message: "Generated quotation updated successfully",
      });
    }

    // ===============================
    // ➕ INSERT (first time only)
    // ===============================
    await db.execute(
      `INSERT INTO generated_quotations
       (quotationId, quotationNo, date, clientName, kindAttn, subject,
        items, terms, termsContent, signature, seal, financeManagerName,designation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quotationId,
        quotationNo,
        date,
        clientName,
        kindAttn,
        subject,
        items ? JSON.stringify(JSON.parse(items)) : "[]",
        terms ? JSON.stringify(JSON.parse(terms)) : "[]",
        termsContent || null,
        signaturePath,
        sealPath,
        financeManagerName,
        designation,
      ]
    );

    await db.execute(
      `UPDATE quotations SET isGenerated = 1 WHERE id = ?`,
      [quotationId]
    );

    res.status(201).json({
      success: true,
      inserted: true,
      message: "Generated quotation created successfully",
    });

  } catch (error) {
    console.error("Add/Update Generated Quotation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get quotation by ID
// controllers/generatedQuotation.controller.js
// GET /api/generatequotation/by-quotation/:quotationId
// GET /api/generatequotation/by-quotation/:quotationId
export const getGeneratedQuotationByQuotationId = async (req, res) => {
  const db = await connectDB();
  const { quotationId } = req.params;

  const [rows] = await db.execute(
    "SELECT * FROM generated_quotations WHERE quotationId = ? LIMIT 1",
    [quotationId]
  );

  res.json(rows.length ? rows[0] : null);
};


// Update quotation
export const updateGeneratedQuotation = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const {
      quotationNo,
      date,
      clientName,
      kindAttn,
      subject,
      items,
      terms,

      signature,
      seal,
      financeManagerName,
      designation,
    } = req.body;

    await db.execute(
      `UPDATE generated_quotations
       SET quotationNo,=?, date=?, clientName=?, kindAttn=?, subject=?, items=?, terms=?, signature=?, seal=?, financeManagerName=? designation = ?,
       WHERE id=?`,
      [
        quotationNo,
        date,
        clientName,
        kindAttn,
        subject,
        JSON.stringify(items || []),
        JSON.stringify(terms || []),
        signature || null,
        seal || null,
        financeManagerName || null,
        designation || null,
        id,
      ]
    );

    res.json({ id });
  } catch (error) {
    console.error("Update Generated Quotation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete quotation
export const deleteGeneratedQuotation = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    await db.execute("DELETE FROM generated_quotations WHERE id=?", [id]);
    res.json({ message: "Quotation deleted", id });
  } catch (error) {
    console.error("Delete Generated Quotation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
