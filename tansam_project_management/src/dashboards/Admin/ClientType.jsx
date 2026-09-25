import { useEffect, useState } from "react";
import "./admincss/ClientType.css";
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";

import {
  fetchClientTypes,
  createClientType,
  updateClientType,
  deleteClientType,
} from "../../services/admin/admin.roles.api";

export default function ClientType() {
  const [clientTypes, setClientTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    id: null,
    name: "",
    status: "ACTIVE",
  });

  const loadClientTypes = async () => {
    try {
      const data = await fetchClientTypes();
      setClientTypes(data || []);
    } catch {
      toast.error("Failed to load client types");
    }
  };

useEffect(() => {
  let mounted = true;

  const load = async () => {
    try {
      const data = await fetchClientTypes();
      if (mounted) {
        setClientTypes(data || []);
      }
    } catch {
      toast.error("Failed to load client types");
    }
  };

  load();

  return () => {
    mounted = false;
  };
}, []);


  const openAddModal = () => {
    setIsEdit(false);
    setForm({ id: null, name: "", status: "ACTIVE" });
    setShowModal(true);
  };

  const openEditModal = (type) => {
    setIsEdit(true);
    setForm(type);
    setShowModal(true);
  };

  const handleDelete = async (type) => {
    if (!window.confirm(`Are you sure you want to delete client type "${type.name}"?`)) {
      return;
    }
    try {
      await deleteClientType(type.id);
      toast.success("Client type deleted successfully");
      loadClientTypes();
    } catch (err) {
      toast.error(err.message || "Failed to delete client type");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.warn("Client type name is required");
      return;
    }

    try {
      if (isEdit) {
        await updateClientType(form.id, {
          name: form.name.trim(),
          status: form.status,
        });
        toast.success("Client type updated");
      } else {
        await createClientType({
          name: form.name.trim(),
          status: form.status,
        });
        toast.success("Client type created");
      }

      setShowModal(false);
      loadClientTypes();
    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  };

  return (
    <div className="client-types-container">
      <ToastContainer autoClose={1500} />

      <div className="client-types-header">
        <h2 className="client-types-title">Client Types Master</h2>
        <button className="primary-btn" onClick={openAddModal}>
          <FiPlus size={16} /> Add Client Type
        </button>
      </div>

      <div className="table-wrapper">
        <table className="client-types-table">
          <thead>
            <tr>
              <th className="col-name">Client Type</th>
              <th className="col-status">Status</th>
              <th className="col-action center">Action</th>
            </tr>
          </thead>
          <tbody>
            {clientTypes.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-text">
                  No client types found
                </td>
              </tr>
            ) : (
              clientTypes.map((type) => (
                <tr key={type.id}>
                  <td className="col-name">{type.name}</td>
                  <td className="col-status">
                    <span
                      className={`status-badge ${
                        type.status === "ACTIVE" ? "active" : "inactive"
                      }`}
                    >
                      {type.status}
                    </span>
                  </td>
                  <td className="col-action center">
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        onClick={() => openEditModal(type)}
                        title="Edit Client Type"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleDelete(type)}
                        title="Delete Client Type"
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEdit ? "Edit Client Type" : "Add Client Type"}</h3>
              <button
                className="icon-btn"
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="form-label">Client Type Name</label>
              <input
                className="form-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter client type"
                required
              />

              {isEdit && (
                <>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <FiSave size={16} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
