import { useState, useEffect } from "react";
import "./admincss/WorkCategories.css";
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave } from "react-icons/fi";
import {
  fetchWorkCategories,
  createWorkCategory,
  updateWorkCategory,
  deleteWorkCategory,
} from "../../services/admin/admin.roles.api";

export default function CreateWorkCategories() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Electrical", status: "ACTIVE" },
    { id: 2, name: "Mechanical", status: "INACTIVE" },
  ]);

  const loadCategories = async () => {
    try {
      const data = await fetchWorkCategories();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load work categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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

  const openEditModal = (category) => {
    setIsEdit(true);
    setForm(category);
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete work category "${category.name}"?`)) {
      return;
    }
    try {
      await deleteWorkCategory(category.id);
      loadCategories();
    } catch (err) {
      alert(err.message || "Failed to delete work category");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name.trim()) {
    alert("Work category name is required");
    return;
  }

  try {
    if (isEdit) {
      // Update in DB
      const updated = await updateWorkCategory(form.id, {
        name: form.name,
        status: form.status,
      });

      // Update local state
      setCategories(categories.map(c => (c.id === form.id ? updated : c)));
    } else {
      // Create in DB
      const created = await createWorkCategory({
        name: form.name,
        status: form.status,
      });

      // Add to local state
      setCategories([...categories, created]);
    }

    setShowModal(false);
    setForm({ id: null, name: "", status: "ACTIVE" });
    setIsEdit(false);
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to save work category");
  }
};


  return (
    <div className="work-categories-container">
      {/* HEADER */}
      <div className="work-categories-header">
        <h2 className="work-categories-title">Work Categories Master</h2>

        <button className="primary-btn" onClick={openAddModal}>
          <FiPlus size={16} />
          Add Work Category
        </button>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="work-categories-table">
          <thead>
            <tr>
              <th className="col-name">Work Category</th>
              <th className="col-status">Status</th>
              <th className="col-action center">Action</th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-text">
                  No work categories found
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="col-name">{cat.name}</td>

                  <td className="col-status">
                    <span
                      className={`status-badge ${
                        cat.status === "ACTIVE" ? "active" : "inactive"
                      }`}
                    >
                      {cat.status}
                    </span>
                  </td>

                  <td className="col-action center">
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        onClick={() => openEditModal(cat)}
                        title="Edit Work Category"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleDelete(cat)}
                        title="Delete Work Category"
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
              <h3>{isEdit ? "Edit Work Category" : "Add Work Category"}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="form-label">Work Category Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter work category name"
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
