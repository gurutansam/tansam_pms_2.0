import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Editor } from "@tinymce/tinymce-react";
import ToggleSwitch from "./toggleSwitch";
import "./CSS/terms.css";
import {
  addTerms,
  getTerms,
  updateTerms,
  deleteTerms,
} from "../../services/quotation/terms.api";

const Terms = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const INITIAL_CONTENT = "<p>Enter description here...</p>";

  const [termsList, setTermsList] = useState([]);
  const [currentTerm, setCurrentTerm] = useState(null);
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [isActive, setIsActive] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  /* ---------------- FETCH TERMS ---------------- */
  const fetchTerms = async () => {
    try {
      const data = await getTerms();

      // ✅ ensure array
      setTermsList(Array.isArray(data) ? data : []);
    } catch (err) {
      alert("Failed to fetch terms");
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  /* ---------------- ENABLE SAVE ONLY WHEN TEXT EXISTS ---------------- */
  useEffect(() => {
    const plainText = content.replace(/<[^>]*>/g, "").trim();
    setIsSaveEnabled(plainText.length > 0);
  }, [content]);

  /* ---------------- SAVE / UPDATE ---------------- */
  const handleSave = async () => {
    const htmlContent = editorRef.current?.getContent() || "";

    if (!htmlContent.replace(/<[^>]*>/g, "").trim()) {
      alert("Please enter valid content");
      return;
    }

    try {
      if (currentTerm) {
        await updateTerms(currentTerm.id, {
          content: htmlContent,
          status: isActive ? "Active" : "In-Active",
        });
      } else {
        await addTerms({
          content: htmlContent,
          status: isActive ? "Active" : "In-Active",
        });
      }

      await fetchTerms();
      handleCancel();
    } catch {
      alert("Save failed");
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (term) => {
    setCurrentTerm(term);
    setContent(term.content);
    setIsActive(term.status === "Active");
    setShowEditor(true);

    setTimeout(() => {
     setContent(term.content);

    }, 0);
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (window.confirm("Delete this term?")) {
      await deleteTerms(id);
      fetchTerms();
    }
  };

  /* ---------------- CANCEL ---------------- */
  const handleCancel = () => {
    setCurrentTerm(null);
    setContent(INITIAL_CONTENT);
    setIsActive(false);
    setShowEditor(false);
  };

  /* ---------------- STYLES ---------------- */
  const thStyle = {
    textAlign: "left",
    padding: "12px",
    fontSize: "14px",
    fontWeight: 600,
    background: "#f1f5f9",
  };

  const tdStyle = {
    padding: "12px",
    fontSize: "14px",
    verticalAlign: "top",
    lineHeight: "1.5",
    whiteSpace: "normal",
  };

  return (
    <div className="terms-container">
      {/* TOP HEADER NAVIGATION */}
      <div className="terms-header">
        <button
          type="button"
          onClick={() => navigate("/finance")}
          className="secondary-btn"
        >
          <FaArrowLeft /> Back to Finance
        </button>

        {!showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            className="primary-btn"
          >
            + Add Terms
          </button>
        )}
      </div>

      {/* EDITOR */}
      {showEditor && (
        <div className="terms-editor-card">
          <h3>{currentTerm ? "Edit Terms" : "Add Terms"}</h3>

          <Editor
            apiKey="gdoyqtp9jm9j8qwtbigjgmhk2kpvrufyklno8ms7ug62qw3t"
            onInit={(evt, editor) => (editorRef.current = editor)}
            value={content}
            onEditorChange={setContent}
            init={{
              height: 260,
              menubar: false,
              toolbar:
                "undo redo | bold italic underline | bullist numlist | link",
            }}
          />

          <div className="terms-actions-bar">
            <ToggleSwitch
              isOn={isActive}
              onToggle={() => setIsActive((prev) => !prev)}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSave}
                disabled={!isSaveEnabled}
                className="primary-btn"
              >
                {currentTerm ? "Update" : "Save"}
              </button>

              <button
                onClick={handleCancel}
                className="secondary-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>Existing Terms</h3>

      <div className="terms-table-card">
        <table className="terms-table">
          <thead>
            <tr>
              <th>Term Preview</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {termsList.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>
                  No terms available
                </td>
              </tr>
            ) : (
              termsList.map((term) => (
                <tr key={term.id}>
                  <td>
                    {term.content
                      .replace(/<[^>]*>/g, "")
                      .slice(0, 150)}
                    …
                  </td>

                  <td>
                    <span
                      className={`term-status-badge ${term.status === "Active" ? "active" : "inactive"}`}
                    >
                      {term.status}
                    </span>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => handleEdit(term)}
                      className="secondary-btn"
                      style={{ marginRight: "8px", padding: "6px 12px", fontSize: "12px" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(term.id)}
                      className="reset-btn"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Terms;
