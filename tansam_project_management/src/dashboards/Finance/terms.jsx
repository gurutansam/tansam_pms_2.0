import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Editor } from "@tinymce/tinymce-react";
import ToggleSwitch from "./toggleSwitch";
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
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      {/* TOP HEADER NAVIGATION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
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

        {!showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            style={{
              padding: "10px 18px",
              borderRadius: 6,
              background: "linear-gradient(135deg, #00646e, #008a94)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0, 100, 110, 0.25)",
            }}
          >
            + Add Terms
          </button>
        )}
      </div>

      {/* EDITOR */}
      {showEditor && (
        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 10,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            marginBottom: 30,
          }}
        >
          <h3>{currentTerm ? "Edit Terms" : "Add Terms"}</h3>

          <Editor
            apiKey="gdoyqtp9jm9j8qwtbigjgmhk2kpvrufyklno8ms7ug62qw3t"
            onInit={(evt, editor) => (editorRef.current = editor)}
         value={content}   // ✅ controlled editor

            onEditorChange={setContent}
            init={{
              height: 260,
              menubar: false,
              toolbar:
                "undo redo | bold italic underline | bullist numlist | link",
            }}
          />

          <div
            style={{
              marginTop: 15,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ToggleSwitch
              isOn={isActive}
              onToggle={() => setIsActive((prev) => !prev)}
            />

            <div>
              <button
                onClick={handleSave}
                disabled={!isSaveEnabled}
                style={{
                  marginRight: 10,
                  padding: "8px 16px",
                  background: isSaveEnabled ? "linear-gradient(135deg, #00646e, #008a94)" : "#94a3b8",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  fontWeight: "600",
                  cursor: isSaveEnabled ? "pointer" : "not-allowed",
                }}
              >
                {currentTerm ? "Update" : "Save"}
              </button>

              <button
                onClick={handleCancel}
                style={{
                  padding: "8px 16px",
                  borderRadius: 5,
                  border: "1px solid #ccc",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <h3>Existing Terms</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          borderRadius: 8,
          overflow: "hidden",
          tableLayout: "auto", // ✅ IMPORTANT FIX
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Term Preview</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {termsList.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ padding: 15, textAlign: "center" }}>
                No terms available
              </td>
            </tr>
          ) : (
            termsList.map((term) => (
              <tr key={term.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={tdStyle}>
                  {term.content
                    .replace(/<[^>]*>/g, "")
                    .slice(0, 150)}
                  …
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: 12,
                      background:
                        term.status === "Active" ? "#dcfce7" : "#fee2e2",
                      color:
                        term.status === "Active" ? "#166534" : "#991b1b",
                    }}
                  >
                    {term.status}
                  </span>
                </td>

                <td style={tdStyle}>
                  <button
                    onClick={() => handleEdit(term)}
                    style={{ marginRight: 10 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(term.id)}
                    style={{ color: "red" }}
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
  );
};

export default Terms;
