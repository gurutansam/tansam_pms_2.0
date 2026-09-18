import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/finance.css";

import {
  getFollowups,
  addFollowup,
  updateFollowup,
  deleteFollowup,
} from "../../services/quotation/quotationFollowup.api";
import { FaFileWord, FaEdit, FaTrash, FaPlus, FaArrowLeft } from "react-icons/fa";
import { fetchOpportunities  } from "../../services/coordinator/coordinator.opportunity.api.js";
import { getQuotations } from "../../services/quotation/quotation.api";

export default function QuotationFollowup() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [activePhase, setActivePhase] = useState("followup");
const [quoteMap, setQuoteMap] = useState({});
const [opportunities, setOpportunities] = useState([]);
useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load follow-ups (existing)
        const followups = await getFollowups();
        setData(followups);

        // Load quotations (using your existing getQuotations)
        const quotes = await getQuotations();
        
        // Build lookup map: project_name → value
        const map = {};
        quotes.forEach(q => {
          const key = q.project_name?.trim().toLowerCase();
          if (key && q.value) {
            map[key] = q.value;
          }
        });
        setQuoteMap(map);
      } catch (err) {
        console.error("Data loading error:", err);
      }
    };

    loadAllData();
  }, []);
useEffect(() => {
  const loadOpportunities = async () => {
    try {
      const res = await fetchOpportunities();
      console.log("OPPORTUNITIES RAW:", res);

      // 🔥 Normalize response
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setOpportunities(list);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    }
  };

  loadOpportunities();
}, []);



const [newFollowup, setNewFollowup] = useState({
  project_name: "", 
    quoteValue: "", 
  revisedCost: "",
  poReceived: "No",
  paymentPhase: "Initial",
  paymentReceived: "No",
  paymentAmount: "",
  reason: "",
});
useEffect(() => {
  loadFollowups();
}, []);

const loadFollowups = async () => {
  try {
    const res = await getFollowups();
    setData(res);
  } catch (err) {
    console.error(err);
  }
};

  // Delete a row
 const handleDelete = async (id) => {
  if (!window.confirm("Delete this follow-up?")) return;

  try {
    await deleteFollowup(id);
    await loadFollowups();
  } catch (err) {
    console.error("Delete failed:", err);
  }
};

  // Edit a row
  const handleEdit = followup => {
    setEditId(followup.id);
    setNewFollowup({ ...followup });
    setShowModal(true);
  };

  // Save (Add or Update)
const handleSave = async () => {
  try {
    if (editId) {
      await updateFollowup(editId, newFollowup);
    } else {
      await addFollowup(newFollowup);
    }

    await loadFollowups(); // reload from DB
    setShowModal(false);
    setEditId(null);

    setNewFollowup({
      project_name: "",
      clientResponse: "",
      lastFollowup: "",
      revisedCost: "",
      nextFollowup: "",
      remarks: "",
      status: "",
      poReceived: "No",
      paymentPhase: "Initial",
      paymentReceived: "No",
      paymentAmount: "",
      reason: "",
    });
  } catch (err) {
    console.error("Save failed:", err);
    alert("Failed to save follow-up");
  }
};


  // Pagination logic
  const totalPages = Math.ceil(data.length / pageSize);
  const paginated = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="finance-container">
      {/* Header */}
      <div className="table-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            type="button"
            onClick={() => navigate("/finance")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#1e293b",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <FaArrowLeft /> Back to Finance
          </button>
          <h2>Quotation Follow-up</h2>
        </div>
    <button
  className="btn-add-quotation"
  onClick={() => {
    setNewFollowup({
      project_name: "",
      clientResponse: "",
      lastFollowup: "",
      revisedCost: "",
      nextFollowup: "",
      remarks: "",
      status: "",
      poReceived: "No",
      paymentPhase: "Initial",
      paymentReceived: "No",
      paymentAmount: "",
      reason: "",
    });
    setEditId(null);   // ensure it’s not in edit mode
    setShowModal(true);
  }}
>
  + Add Quotation follow-up
</button>

      </div>
  <div style={{ position: "relative" }}>
<div className="page-size-ui">
  <span>Show</span>

  <select
    value={pageSize}
    onChange={(e) => {
      setPageSize(Number(e.target.value));
      setPage(1);
    }}
  >
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={25}>25</option>
    <option value={50}>50</option>
  </select>

  <span>per page</span>
</div>

  </div>
      {/* Table */}
      <div className="phase-tabs">
      {/* <button
        className={activePhase === "followup" ? "active-tab" : ""}
        onClick={() => setActivePhase("followup")}
      >
        Quotation Follow-up Phase
      </button> */}

      <button
        className={activePhase === "payment" ? "active-tab" : ""}
        onClick={() => setActivePhase("payment")}
      >
        Payment Phase
      </button>
    </div>

      <div className="card-table">
        
   <table>
  <thead>
    <tr>
      <th>Project Name</th>
      <th>Original Quote</th>
      
      <th>Revised Cost</th>
      <th>PO Received</th>
      <th>Payment Phase</th>
      <th>Payment Received</th>
      <th>Payment Amount</th>
      <th>Reason</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {paginated.map(d => (
      <tr key={d.id}>
        <td>{d.project_name}</td>
        <td>₹ {d.quoteValue || "-"}</td>
        <td>₹ {d.revisedCost}</td>
        <td>{d.poReceived}</td>
        <td>{d.paymentPhase}</td>
        <td>{d.paymentReceived}</td>
        <td>{d.paymentReceived === "Yes" ? `₹ ${d.paymentAmount}` : "-"}</td>
        <td>{d.paymentReceived === "No" ? d.reason || "-" : "-"}</td>
        <td>
        
                               <button
              className="btn-edit"
              onClick={() => handleEdit(d)}
              title="Edit"
            >
              <FaEdit />
            </button>  <button
              className="btn-delete"
              onClick={() => handleDelete(d.id)}
              title="Delete"
            >
              <FaTrash />
            </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>


      </div>

      {/* Pagination Controls */}
<div className="pagination" style={{ marginTop: "10px", display: "flex", gap: "15px", alignItems: "center" }}>
  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
  <span>{page} / {totalPages}</span>

  {/* Boxed per-page dropdown */}

</div>


      {/* Add/Edit Modal */}
{/* Add/Edit Modal */}
{showModal && (
  <div className="modal-overlay">
    <div className="modal modal-lg">
      {/* Header */}
      <div className="modal-header">
        <h3>{editId ? "Edit Quotation Follow-up" : "Add Quotation Follow-up"}</h3>
        <span className="modal-close" onClick={() => setShowModal(false)}>
          ✕
        </span>
      </div>

      {/* Body */}
      <div className="modal-body">
        <div className="form-grid">
          {/* Revised Cost */}
          {/* Project Name */}
<div className="form-group">
  <label>Project Name *</label>
<select
  value={newFollowup.project_name}
  onChange={(e) => {
    const selected = e.target.value;
    const key = selected.trim().toLowerCase();

    setNewFollowup({
      ...newFollowup,
      project_name: selected,
      quoteValue: quoteMap[key] || "",
    });
  }}
>
  <option value="">Select project</option>

  {opportunities.map((opp) => {
    const name =
      opp.project_name ||
      opp.projectName ||
      opp.opportunity_name ||
      opp.name;

    return (
      <option key={opp.id} value={name}>
        {name}
      </option>
    );
  })}
</select>


</div>

<div className="form-group">
  <label>Original Quote Value</label>
  <input
    type="number"
    value={newFollowup.quoteValue}
    readOnly
    placeholder="Auto fetched from quotation"
  />
</div>


          <div className="form-group">
            <label>Revised Cost *</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={newFollowup.revisedCost}
              onChange={e =>
                setNewFollowup({ ...newFollowup, revisedCost: e.target.value })
              }
            />
          </div>

          {/* PO Received */}
          <div className="form-group">
            <label>PO Received *</label>
            <select
              value={newFollowup.poReceived}
              onChange={e =>
                setNewFollowup({ ...newFollowup, poReceived: e.target.value })
              }
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>

          {/* Payment Phase */}
          <div className="form-group">
            <label>Payment Phase *</label>
            <select
              value={newFollowup.paymentPhase}
              onChange={e =>
                setNewFollowup({ ...newFollowup, paymentPhase: e.target.value })
              }
            >
              <option>Initial</option>
              <option>Advance</option>
              <option>Partial</option>
              <option>Final</option>
              <option>Completed</option>
            </select>
          </div>

          {/* Payment Received */}
    <div className="form-group">
      <label>Payment Received *</label>
      <select
        value={newFollowup.paymentReceived}
        onChange={e =>
          setNewFollowup({
            ...newFollowup,
            paymentReceived: e.target.value,
            paymentAmount: e.target.value === "No" ? "" : newFollowup.paymentAmount,
            reason: e.target.value === "Yes" ? "" : newFollowup.reason,
          })
        }
      >
        <option>No</option>
        <option>Yes</option>
      </select>
    </div>


          {/* Payment Amount (only if received) */}
       <div className="form-group">
      <label>{newFollowup.paymentReceived === "Yes" ? "Payment Amount *" : "Reason"}</label>
      <input
        type={newFollowup.paymentReceived === "Yes" ? "number" : "text"}
        placeholder={newFollowup.paymentReceived === "Yes" ? "Enter received amount" : "Reason if any"}
        value={newFollowup.paymentReceived === "Yes" ? newFollowup.paymentAmount : newFollowup.reason}
        onChange={e =>
          setNewFollowup({
            ...newFollowup,
            paymentAmount: newFollowup.paymentReceived === "Yes" ? e.target.value : newFollowup.paymentAmount,
            reason: newFollowup.paymentReceived === "No" ? e.target.value : newFollowup.reason,
          })
        }
      />
    </div>
        </div>
      </div>

      {/* Footer */}
      <div className="modal-footer">
        <button className="btn-secondary" onClick={() => setShowModal(false)}>
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={
            newFollowup.paymentReceived === "Yes" &&
            (!newFollowup.paymentAmount || Number(newFollowup.paymentAmount) <= 0)
          }
        >
          {editId ? "Update" : "Save"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}