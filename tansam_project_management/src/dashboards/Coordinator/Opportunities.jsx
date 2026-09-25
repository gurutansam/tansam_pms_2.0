import { useEffect, useState, useRef } from "react";
import RichTextEditor from "../../components/RichTextEditor";
import {
  fetchOpportunities,
  createOpportunity,
  updateOpportunity,
  // deleteOpportunity,
} from "../../services/coordinator/coordinator.opportunity.api";
import {
  fetchOpportunityTrackers,
  createOpportunityTracker,
  updateOpportunityTracker,
} from "../../services/coordinator/coordinator.tracker.api";
import {
  fetchUsers, fetchLabs,
  fetchWorkCategories,
  fetchClientTypes,
} from "../../services/admin/admin.roles.api.js";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";
import "./CSS/Opportunities.css";
import ProgressTracker from "./Tracker.jsx";

const STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export default function Opportunities() {
  const [showModal, setShowModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [labs, setLabs] = useState([]);
  const [workCategories, setWorkCategories] = useState([]);
  const [clientTypes, setClientTypes] = useState([]);
  const [trackers, setTrackers] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [originalAssignedTo, setOriginalAssignedTo] = useState(null);
  const [clientConflict, setClientConflict] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [originalClientName, setOriginalClientName] = useState("");
  const [originalContact, setOriginalContact] = useState({
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
  });

  const ITEMS_PER_PAGE = 10; // change to 5 / 20 if needed

  const [currentPage, setCurrentPage] = useState(1);

  //  Toast state
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
    position: "top",
  });

  //  Toast helper
  const showToast = ({
    message,
    type = "success",
    position = "top",
    duration = 3000,
  }) => {
    setToast({ open: true, message, type, position });

    setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
    }, duration);
  };

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    source: "",
  });

  /* ================= FORM STATE (Add/Edit) ================= */
  const [form, setForm] = useState({
    opportunity_id: null,
    opportunityName: "",
    clientName: "",

    labIds: [],
    workCategoryId: "",
    clientTypeId: "",

    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    leadSource: "",
    leadDescription: "",
    status: "NEW",
    stage: "NEW",

    assignedTo: [], // 👈 ARRAY now

    next_followup_date: "",
    next_action: "",
  });

  /* ================= LOAD ================= */
  useEffect(() => {
    loadAll();
  }, []);
  const loadAll = async () => {
    try {
      setLoading(true);
      const [
        oppData,
        trackerData,
        usersData,
        labsData,
        workCatsData,
        clientTypesData,
      ] = await Promise.all([
        fetchOpportunities(),
        fetchOpportunityTrackers(),
        fetchUsers(),
        fetchLabs(),
        fetchWorkCategories(),
        fetchClientTypes(),
      ]);

      setUsers(usersData || []);
      setLabs(labsData || []);
      setWorkCategories(workCatsData || []);
      setClientTypes(clientTypesData || []);
      setOpportunities(oppData || []);
      setTrackers(trackerData || []);
    } finally {
      setLoading(false);
    }
  };

  const getTrackerForOpportunity = (oppId) =>
    trackers.find((t) => t.opportunity_id === oppId) || {};

  const getUserById = (id) =>
    users.find((u) => String(u.id) === String(id));

  const assignableUsers = users.filter(
    (u) => u.role !== "COORDINATOR"
  );

  //   const handleMultiSelect = (e) => {
  //   const values = Array.from(e.target.selectedOptions).map(
  //     (opt) => opt.value
  //   );
  //   setForm({ ...form, assignedTo: values });
  // };
  /* ================= HANDLERS ================= */
  const resetForm = () => {
    setForm({
      opportunity_id: null,
      opportunityName: "",
      clientName: "",

      labIds: [],
      workCategoryId: "",
      clientTypeId: "",

      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      leadSource: "",
      leadDescription: "",
      status: "NEW",
      stage: "NEW",

      assignedTo: [], // ✅ MUST be array

      next_followup_date: "",
      next_action: "",
    });
  };

  const openAddModal = () => {
    setIsEdit(false);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (row) => {
    const tracker = getTrackerForOpportunity(row.opportunity_id);

    setIsEdit(true);
    setOriginalAssignedTo(row.assigned_to);

    setOriginalClientName(row.client_name);
    setOriginalContact({
      contactPerson: row.contact_person || "",
      contactEmail: row.contact_email || "",
      contactPhone: row.contact_phone || "",
    });

    setForm({
      opportunity_id: row.opportunity_id,
      opportunityName: row.opportunity_name,
      clientName: row.client_name,

      labIds: (() => {
        if (!row.lab_id) return [];

        // If MySQL driver already parsed JSON
        if (Array.isArray(row.lab_id)) return row.lab_id;

        // If it comes as JSON string
        try {
          const parsed = JSON.parse(row.lab_id);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })(),

      workCategoryId: row.work_category_id || "",
      clientTypeId: row.client_type_id || "",

      contactPerson: row.contact_person || "",
      contactEmail: row.contact_email || "",
      contactPhone: row.contact_phone || "",
      leadSource: row.lead_source || "",
      leadDescription: row.lead_description || "",
      status: row.lead_status || "NEW",
      stage: tracker.stage || row.lead_status || "NEW",

      assignedTo: row.assigned_to ? row.assigned_to.split(",") : [],

      next_followup_date: tracker.next_followup_date?.slice(0, 10) || "",
      next_action: tracker.next_action || "",
    });

    setShowModal(true);
  };


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let opportunityPayload;
    try {
      setLoading(true);

      const isReassign =
        isEdit &&
        JSON.stringify(
          (originalAssignedTo || "").split(",").sort()
        ) !== JSON.stringify(
          [...form.assignedTo].sort()
        );
      const clientChanged =
        isEdit && form.clientName !== originalClientName;

      const contactChanged =
        isEdit &&
        (
          form.contactPerson !== originalContact.contactPerson ||
          form.contactEmail !== originalContact.contactEmail ||
          form.contactPhone !== originalContact.contactPhone
        );


      // 🔔 PRE-TOAST
      if (!isEdit) {
        showToast({
          message: "Creating opportunity & sending mail...",
          type: "info",
          position: "top",
        });
      } else if (isReassign) {
        showToast({
          message: "Reassigning opportunity & sending mail...",
          type: "info",
          position: "top",
        });
      }

      let opportunityId;

      // 🔹 OPPORTUNITY PAYLOAD
      opportunityPayload = {
        opportunityName: form.opportunityName,
        clientName: form.clientName,

        labIds: form.labIds,
        workCategoryId: form.workCategoryId || null,
        clientTypeId: form.clientTypeId || null,

        contactPerson: form.contactPerson,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        leadSource: form.leadSource,
        leadDescription: form.leadDescription,
        leadStatus: form.status,

        assignedTo: form.assignedTo, // 👈 ARRAY
      };

      delete opportunityPayload.status;
      delete opportunityPayload.next_followup_date;
      delete opportunityPayload.next_action;
      delete opportunityPayload.stage;

      // 🔹 CREATE / UPDATE OPPORTUNITY
      if (isEdit) {
        await updateOpportunity(form.opportunity_id, opportunityPayload);
        opportunityId = form.opportunity_id;
      } else {
        const created = await createOpportunity(opportunityPayload);
        opportunityId = created.opportunity_id;
      }

      // 🔹 TRACKER
      const tracker = getTrackerForOpportunity(opportunityId);
      const trackerPayload = {
        ...tracker,
        opportunity_id: opportunityId,
        stage: form.stage,
        next_followup_date: form.next_followup_date || null,
        next_action: form.next_action || "",
        remarks: tracker.remarks || "",
      };

      if (tracker.id) {
        await updateOpportunityTracker(tracker.id, trackerPayload);
      } else {
        await createOpportunityTracker(trackerPayload);
      }

      // 🔔 SUCCESS TOAST
      if (!isEdit) {
        showToast({
          message: "Opportunity created & mail sent successfully",
          type: "success",
        });
      } else if (isReassign) {
        showToast({
          message: "Opportunity reassigned & mail sent successfully",
          type: "success",
        });
      } else if (contactChanged) {
        showToast({
          message: "Contact details updated & mail sent successfully",
          type: "success",
        });
      } else if (clientChanged) {
        showToast({
          message: "Client name updated successfully",
          type: "success",
        });
      } else {
        showToast({
          message: "Opportunity updated successfully",
          type: "success",
        });
      }

      setTimeout(() => {
        setShowModal(false);
        setIsPreview(false);
        resetForm();
        loadAll();
      }, 800);
    } catch (err) {
      console.error(err);

      // 🔒 LOCKED OPPORTUNITY (WON / LOST)
      if (err?.response?.status === 403) {
        showToast({
          message:
            err.response?.data?.message ||
            "This opportunity is locked and cannot be edited",
          type: "error",
          position: "top",
        });

        setLoading(false); // 🔴 STOP LOADER
        return; // 🔴 STOP EXECUTION
      }

      // CLIENT CONFLICT (already exists)
      if (
        err?.response?.status === 409 &&
        err?.response?.data?.code === "SIMILAR_CLIENT_FOUND"
      ) {
        setClientConflict(err.response.data);
        setPendingPayload(opportunityPayload);
        setLoading(false);
        return;
      }

      showToast({
        message: "Operation failed. Please try again.",
        type: "error",
        position: "top",
      });

      setLoading(false); // 🔴 STOP LOADER
    }


  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm("Delete this opportunity?")) return;
  //   try {
  //     await deleteOpportunity(id);
  //     loadAll();
  //   } catch (err) {
  //     alert(err.message);
  //   }
  // };


  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.status, filters.source]);

  /* ================= FILTER LOGIC ================= */
  const filteredOpportunities = opportunities.filter((item) => {
    const searchMatch =
      !filters.search ||
      item.opportunity_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.client_name?.toLowerCase().includes(filters.search.toLowerCase());

    const statusMatch = !filters.status || item.lead_status === filters.status;
    const sourceMatch = !filters.source || item.lead_source === filters.source;

    return searchMatch && statusMatch && sourceMatch;
  });

  const totalPages = Math.ceil(
    filteredOpportunities.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOpportunities = filteredOpportunities.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const formatLabs = (lab) => {
    if (!lab) return "—";

    if (Array.isArray(lab)) return lab.join(", ");

    if (typeof lab === "string") {
      try {
        const parsed = JSON.parse(lab);
        return Array.isArray(parsed) ? parsed.join(", ") : lab;
      } catch {
        return lab;
      }
    }

    return "—";
  };
  function MultiSelectChips({
    options,
    value,
    onChange,
    placeholder,
    labelKey = "name",
  }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggle = (id) => {
      if (value.includes(id)) {
        onChange(value.filter((v) => v !== id));
      } else {
        onChange([...value, id]);
      }
    };

    const remove = (id) => {
      onChange(value.filter((v) => v !== id));
    };

    return (
      <div className="multi-select" ref={containerRef}>
        <div
          className="multi-select-input"
          onClick={() => setOpen(!open)}
        >
          {value.length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            <div className="chips">
              {value.map((id) => {
                const opt = options.find((o) => String(o.id) === String(id));
                return (
                  <span className="chip" key={id}>
                    {opt?.[labelKey] || opt?.username}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(id);
                      }}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <span className="arrow">▾</span>
        </div>

        {open && (
          <div className="multi-select-dropdown">
            {options.map((opt) => (
              <div
                key={opt.id}
                className={`option ${value.includes(opt.id) ? "selected" : ""
                  }`}
                onClick={() => toggle(opt.id)}
              >
                {opt[labelKey] || opt.username}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }



  /* ================= UI ================= */
  return (
    <div className="opportunity-wrapper">
      <h2 className="opportunity-title">New Opportunities</h2>

      <div className="opportunity-actions">
        <button onClick={openAddModal}>+ Add Opportunity</button>
      </div>

      {/* FILTER BAR */}
      <div className="opportunity-filters">
        <input
          placeholder="Search Opportunity / Client"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="NEW">NEW</option>
          <option value="EXISTING">EXISTING</option>
        </select>

        <select
          value={filters.source}
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
        >
          <option value="">All Sources</option>
          <option value="WEBSITE">Website</option>
          <option value="REFERRAL">Referral</option>
          <option value="CALL">Call</option>
          <option value="EMAIL">Email</option>
        </select>

        <button
          className="reset-btn"
          onClick={() => setFilters({ search: "", status: "", source: "" })}
        >
          Reset
        </button>
      </div>

      {/* MAIN TABLE */}
      <div className="opportunity-table-wrapper">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="opportunity-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Opportunity</th>
                <th>Client</th>
                <th>Source</th>
                <th>Assigned To</th>
                <th>Stage</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    No opportunities found
                  </td>
                </tr>
              ) : (
                paginatedOpportunities.map((item, index) => {
                  const tracker = getTrackerForOpportunity(item.opportunity_id);
                  return (
                    <tr key={item.opportunity_id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{item.opportunity_name}</td>
                      <td>{item.client_name}</td>
                      <td>{item.lead_source || "-"}</td>
                      <td>
                        {item.assigned_to
                          ? item.assigned_to
                            .split(",")
                            .map(
                              (id) =>
                                getUserById(id)?.name ||
                                getUserById(id)?.username,
                            )
                            .filter(Boolean)
                            .join(", ")
                          : "-"}
                      </td>
                      <td>
                        <span
                          className={`status ${tracker.stage?.toLowerCase() || "new"}`}
                        >
                          {tracker.stage || "NEW"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status ${item.lead_status?.toLowerCase() || "new"}`}
                        >
                          {item.lead_status || "NEW"}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="table-action view-action"
                          onClick={() => setViewData(item)}
                        >
                          View
                        </button>
                        <button
                          className="icon-btn edit"
                          onClick={() => openEditModal(item)}
                        >
                          <FiEdit />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL - Now with both Stage and Status */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{isEdit ? "Edit Opportunity" : "Add Opportunity"}</h3>

            <form onSubmit={handleSubmit} className="opportunity-form">
              <div className="form-group">
                <label>Opportunity Name</label>
                <input
                  name="opportunityName"
                  value={form.opportunityName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Client Name</label>
                <input
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Person</label>
                <input
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Labs</label>

                <MultiSelectChips
                  options={labs}
                  value={form.labIds}
                  onChange={(ids) => setForm({ ...form, labIds: ids })}
                  placeholder="Select labs"
                />
              </div>

              <div className="form-group">
                <label>Work Category</label>
                <select
                  name="workCategoryId"
                  value={form.workCategoryId}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {workCategories.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Client Type</label>
                <select
                  name="clientTypeId"
                  value={form.clientTypeId}
                  onChange={handleChange}
                >
                  <option value="">Select Client Type</option>
                  {clientTypes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned To</label>

                <MultiSelectChips
                  options={assignableUsers}
                  value={form.assignedTo}
                  onChange={(ids) => setForm({ ...form, assignedTo: ids })}
                  placeholder="Select users"
                  labelKey="name"
                />
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Source</label>
                <select
                  name="leadSource"
                  value={form.leadSource}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="WEBSITE">Website</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>

              {/* Status (NEW / EXISTING) */}
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="NEW">NEW</option>
                  <option value="EXISTING">EXISTING</option>
                </select>
              </div>

              {/* Stage (full pipeline) */}
              <div className="form-group">
                <label>
                  Stage{" "}
                  {["WON", "LOST"].includes(form.stage) && (
                    <span style={{ color: "red", fontSize: "12px", marginLeft: "6px" }}>
                      (Locked)
                    </span>
                  )}
                </label>

                <select
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  disabled={["WON", "LOST"].includes(form.stage)}
                >
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
              {/* Next Follow-up Date */}
              <div className="form-group">
                <label>Next Follow-up Date</label>
                <input
                  type="date"
                  name="next_followup_date"
                  value={form.next_followup_date}
                  onChange={handleChange}
                />
              </div>

              {/* Next Action */}
              <div className="form-group full-width">
                <label>Next Action</label>
                <textarea
                  name="next_action"
                  value={form.next_action}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <div className="modal-description-box">
                  {!isPreview ? (
                    <RichTextEditor
                      value={form.leadDescription}
                      onChange={(v) => setForm({ ...form, leadDescription: v })}
                    />
                  ) : (
                    <div
                      className="preview-content"
                      dangerouslySetInnerHTML={{
                        __html: form.leadDescription || "<p>No description</p>",
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="preview-btn"
                  onClick={() => setIsPreview(!isPreview)}
                >
                  {isPreview ? "Back to Edit" : "Preview"}
                </button>
                <button type="submit">
                  Save
                  {loading && (
                    <div className="global-loader">
                      <div className="spinner"></div>
                      <p>Processing request & sending mail…</p>
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    resetForm();
                    setIsPreview(false);
                    setShowModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewData && (
        <div className="modal-overlay" onClick={() => setViewData(null)}>
          <div className="view-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="view-header">
              <div>
                <h3 className="view-title">{viewData.opportunity_name}</h3>
                <p className="view-subtitle">
                  <strong>Client Name:</strong> {viewData.client_name || "—"}
                </p>
              </div>
              <div className="view-header-right">
                <span
                  className={`status-badge ${viewData.lead_status?.toLowerCase()}`}
                >
                  {viewData.lead_status}
                </span>
                <button className="close-btn" onClick={() => setViewData(null)}>
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Contact Details - 3x3 Grid */}
            {/* DETAILS GRID */}
            <div className="contact-grid">
              <div className="grid-item">
                <label>Contact Person</label>
                <p>{viewData.contact_person || "—"}</p>
              </div>

              <div className="grid-item">
                <label>Assigned To</label>
                <p>
                  {viewData.assigned_to
                    ? viewData.assigned_to
                      .split(",")
                      .map((id) => {
                        const u = getUserById(id);
                        return u
                          ? `${u.name || u.username} (${u.role})`
                          : null;
                      })
                      .filter(Boolean)
                      .join(", ")
                    : "—"}
                </p>
              </div>

              <div className="grid-item">
                <label>Email</label>
                <p>{viewData.contact_email || "—"}</p>
              </div>

              <div className="grid-item">
                <label>Phone</label>
                <p>{viewData.contact_phone || "—"}</p>
              </div>

              <div className="grid-item">
                <label>Source</label>
                <p>{viewData.lead_source || "—"}</p>
              </div>

              {/* ✅ NEW FIELDS */}
              <div className="grid-item">
                <label>Client Type</label>
                <p>{viewData.client_type_name || "—"}</p>
              </div>

              <div className="grid-item">
                <label>Work Category</label>
                <p>{viewData.work_category_name || "—"}</p>
              </div>

              <div className="grid-item">
                <label>Labs</label>
                <p>{formatLabs(viewData.lab_name)}</p>
              </div>
              <div className="grid-item empty"></div>
            </div>

            {/* Tracker Information */}
            <div className="tracker-section">
              <h4>Tracker Information</h4>
              <div className="tracker-info">
                <div className="info-item full-width">
                  <label>Stage</label>
                  <div className="stage-progress-wrapper">
                    <span
                      className={`status ${(getTrackerForOpportunity(viewData.opportunity_id).stage || "NEW").toLowerCase()}`}
                    >
                      {getTrackerForOpportunity(viewData.opportunity_id)
                        .stage || "NEW"}
                    </span>
                    <ProgressTracker
                      currentStage={
                        getTrackerForOpportunity(viewData.opportunity_id)
                          .stage || "NEW"
                      }
                    />
                  </div>
                </div>

                <div className="info-item">
                  <label>Next Follow-up Date</label>
                  <p>
                    {getTrackerForOpportunity(viewData.opportunity_id)
                      .next_followup_date
                      ? getTrackerForOpportunity(
                        viewData.opportunity_id,
                      ).next_followup_date.slice(0, 10)
                      : "—"}
                  </p>
                </div>

                <div className="info-item">
                  <label>Next Action</label>
                  <p>
                    {getTrackerForOpportunity(viewData.opportunity_id)
                      .next_action || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="description-section">
              <label>Description</label>
              <div
                className="description-content"
                dangerouslySetInnerHTML={{
                  __html:
                    viewData.lead_description ||
                    "<p>No description available</p>",
                }}
              />
            </div>
          </div>
        </div>
      )}
      {clientConflict && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Client Already Exists</h3>

            <p>
              A client with a similar name already exists:
              <br />
              <b>{clientConflict.existingClient.client_name}</b>
            </p>

            <p>What would you like to do?</p>

            <div className="modal-actions">
              <button
                onClick={async () => {
                  // 👉 Use existing client
                  await createOpportunity({
                    ...pendingPayload,
                    client_id: clientConflict.existingClient.client_id,
                  });

                  setClientConflict(null);
                  setPendingPayload(null);
                  setShowModal(false);
                  loadAll();
                }}
              >
                Use Existing Client
              </button>

              <button
                className="danger"
                onClick={async () => {
                  // 👉 Force new client creation
                  await createOpportunity({
                    ...pendingPayload,
                    isNewClient: true,
                  });

                  setClientConflict(null);
                  setPendingPayload(null);
                  setShowModal(false);
                  loadAll();
                }}
              >
                Create New Client
              </button>

              <button
                className="cancel-btn"
                onClick={() => {
                  setClientConflict(null);
                  setPendingPayload(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.open && (
        <div className={`toast toast-${toast.type} toast-${toast.position}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}