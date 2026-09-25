import { useState } from "react";
import "./admincss/Reports.css";
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave } from "react-icons/fi";

export default function Reports() {
  const [reports, setReports] = useState([
    { id: 1, name: "Sales Summary", status: "ACTIVE" },
    { id: 2, name: "Finance Overview", status: "INACTIVE" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    id: null,
    name: "",
    status: "ACTIVE",
  });

  const openAddModal = () => {
    setIsEdit(false);
    setForm({ id: null, name: "", status: "ACTIVE" });
    setShowModal(true);
  };

  const openEditModal = (report) => {
    setIsEdit(true);
    setForm(report);
    setShowModal(true);
  };

  const handleDelete = (report) => {
    if (!window.confirm(`Are you sure you want to delete report "${report.name}"?`)) {
      return;
    }
    setReports(reports.filter((r) => r.id !== report.id));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Report name is required");
      return;
    }

    if (isEdit) {
      setReports(reports.map((r) => (r.id === form.id ? { ...form } : r)));
    } else {
      setReports([
        ...reports,
        { ...form, id: Date.now() },
      ]);
    }

    setShowModal(false);
  };

  return (
    <div className="reports-container">
      {/* HEADER */}
      <div className="reports-header">
        <h2 className="reports-title">Reports Master</h2>

        <button className="primary-btn" onClick={openAddModal}>
          <FiPlus size={16} />
          Add Report
        </button>
      </div>

      {/* DEMO NOTICE */}
      <div className="reports-notice-banner">
        <span className="reports-notice-badge">Simulation Mode</span>
        <span>
          Reports Master is currently running on simulated in-memory data. Backend persistence and dynamic aggregations will be enabled in Phase 2.
        </span>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th className="col-name">Report Name</th>
              <th className="col-status">Status</th>
              <th className="col-action center">Action</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-text">
                  No reports found
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td className="col-name">{report.name}</td>

                  <td className="col-status">
                    <span
                      className={`status-badge ${
                        report.status === "ACTIVE" ? "active" : "inactive"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="col-action center">
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        onClick={() => openEditModal(report)}
                        title="Edit Report"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleDelete(report)}
                        title="Delete Report"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{isEdit ? "Edit Report" : "Add Report"}</h3>
              <button
                className="icon-btn"
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="form-label">Report Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter report name"
              />

              <label className="form-label">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <FiSave size={16} />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}