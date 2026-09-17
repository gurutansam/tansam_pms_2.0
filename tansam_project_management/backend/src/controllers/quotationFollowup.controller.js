import { connectDB } from "../config/db.js";
// Get all follow-ups
export const getFollowups = async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT * FROM quotation_followups ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add follow-up
export const addFollowup = async (req, res) => {
  try {
       const db = await connectDB();
    const {
      project_name, 
      quoteValue,
      revisedCost,
      poReceived,
      paymentPhase,
      paymentAmount,
      paymentReceived,
      reason,
    } = req.body;

 
    const [result] = await db.execute(
      `INSERT INTO quotation_followups
      (project_name,quoteValue , revisedCost, poReceived, paymentPhase, paymentAmount, paymentReceived, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_name,
        quoteValue,
        revisedCost,
        poReceived,
        paymentPhase,
        paymentAmount,
        paymentReceived,
        reason,
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update follow-up
export const updateFollowup = async (req, res) => {
  try {
       const db = await connectDB();
    const { id } = req.params;
    const {
      project_name,  
      quoteValue,  
      revisedCost,
      poReceived,
      paymentPhase,
      paymentAmount,
      paymentReceived,
      reason,
    } = req.body;

   
    await db.execute(
      `UPDATE quotation_followups SET
        project_name=?,  
        quoteValue=?,   
        revisedCost=?,      
        poReceived=?,
        paymentPhase=?,
        paymentAmount=?,
        paymentReceived=?,
        reason=?
       WHERE id=?`,
      [
        project_name,
        quoteValue,
        revisedCost,
        poReceived,
        paymentPhase,
        paymentAmount,
        paymentReceived,
        reason,
        id,
      ]
    );

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete follow-up
export const deleteFollowup = async (req, res) => {
  try {
    const db = await connectDB();
    await db.execute("DELETE FROM quotation_followups WHERE id=?", [
      req.params.id,
    ]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
