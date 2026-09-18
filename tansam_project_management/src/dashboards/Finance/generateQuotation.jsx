import { useState, useEffect } from "react";
import tnlogo from "../../assets/tansam/tnlogo.png";
import tansamoldlogo from "../../assets/tansam/tansamoldlogo.png";
import siemens from "../../assets/tansam/siemens.png";
import tidco from "../../assets/tansam/tidcologo.png";
import "./CSS/generateQuotation.css";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { getActiveTerms } from "../../services/quotation/terms.api";
import {
  saveGeneratedQuotation,
  getGeneratedQuotationByQuotationId,
} from "../../services/quotation/generatedQuotation.api";
import QuotationPDF from "./QuotationPdf.jsx";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

// ✅ EditableQuotationTable Component (UNCHANGED)
export const EditableQuotationTable = ({ quotation, setQuotation }) => {
  const handleRowChange = (index, field, value) => {
    const updatedItems = [...quotation.items];
    updatedItems[index][field] = value;

    const qty = parseFloat(updatedItems[index].qty) || 0;
    const unitPrice = parseFloat(updatedItems[index].unitPrice) || 0;
    const tax = parseFloat(updatedItems[index].tax) || 0; // % (for info only)

    const baseAmount = qty * unitPrice;

    // OPTIONAL: calculate tax separately (do NOT add)
    const taxAmount = baseAmount * (tax / 100);

    updatedItems[index].total = baseAmount.toFixed(2);

    setQuotation({ ...quotation, items: updatedItems });
  };

  const addRow = () => {
    const newRow = { description: "", qty: "", unitPrice: "", total: "0.00" };
    setQuotation({ ...quotation, items: [...quotation.items, newRow] });
  };

  const removeRow = (index) => {
    const updatedItems = [...quotation.items];
    updatedItems.splice(index, 1);
    setQuotation({ ...quotation, items: updatedItems });
  };

  const totalServiceValue = quotation.items
    .reduce((acc, item) => {
      const base = parseFloat(item.total || 0);
      const taxPercent = parseFloat(item.tax || 0);
      const taxAmount = base * (taxPercent / 100);
      return acc + base + taxAmount;
    }, 0)
    .toFixed(2);

  return (
    <div style={{ marginBottom: "30px" }}>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Sl. No
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  width: "30%",
                }}
              >
                Product Description
              </th>

              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Unit Price
              </th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>Qty</th>
              <th style={{ border: "1px solid #000", padding: "4px" }}>TAX</th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Total price
              </th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {index + 1}
                </td>
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleRowChange(index, "description", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "4px",
                    }}
                  />
                </td>

                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleRowChange(index, "unitPrice", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "4px",
                      boxSizing: "border-box",
                    }}
                  />
                </td>
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      handleRowChange(index, "qty", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "4px",
                      boxSizing: "border-box",
                    }}
                  />
                </td>
                <td style={{ border: "1px solid #000", padding: "8px" }}>
                  <input
                    type="number"
                    value={item.tax || ""}
                    onChange={(e) =>
                      handleRowChange(index, "tax", e.target.value)
                    }
                    style={{
                      width: "50%",
                      padding: "2px",
                      boxSizing: "border-box",
                    }}
                  />
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "right",
                  }}
                >
                  {(() => {
                    const baseTotal = Number(item.total || 0);
                    const taxPercent = Number(item.tax || 0);
                    const taxAmount = baseTotal * (taxPercent / 100);
                    return (baseTotal + taxAmount).toFixed(2);
                  })()}
                </td>

                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => removeRow(index)}
                    style={{ padding: "4px 8px", fontSize: "12px" }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addRow}
        style={{
          marginBottom: "10px",
          padding: "8px 16px",
          background: "linear-gradient(135deg, #00646e, #008a94)",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Add Row
      </button>
      <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "16px" }}>
        Total Service Value with Tax: ₹ {totalServiceValue}
      </div>
    </div>
  );
};

// ✅ FIXED FinanceDocument WITH Loading/Error States + ALL PROPS
const FinanceDocument = ({
  quotation,
  setQuotation,
  refNo,
  setRefNo,
  date,
  setDate,
  showPreview,
  setShowPreview,
  savedQuotation,
  handleSaveQuotation,
  handleBack,
  showTermsModal,
  setShowTermsModal,
  termsList,
  selectedTerms,
  toggleTermSelection,
  applySelectedTerms,
  termsLoading,
  termsError,
  termsContent,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        padding: "20px 16px 40px 16px",
        margin: 0,
        backgroundColor: "#f1f5f9",
      }}
    >
      {/* ⬅ Top Back Navigation Bar */}
      <div
        style={{
          width: "1200px",
          maxWidth: "95%",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            fontSize: "14px",
            fontWeight: "700",
            color: "#0f172a",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e2e8f0";
            e.currentTarget.style.transform = "translateX(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.transform = "translateX(0)";
          }}
          aria-label="Back to Finance"
          title="Back to Finance"
        >
          <FaArrowLeft /> Back to Finance
        </button>

        <span
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#64748b",
          }}
        >
          {refNo ? `Quotation: ${refNo}` : "Generate Quotation"}
        </span>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "1200px",
          maxWidth: "95%",
          margin: "0 auto",
        }}
      >
        {/* Header - UNCHANGED */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div>
            <img src={tnlogo} alt="Left Logo" style={{ maxHeight: "60px" }} />
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <img
              src={tansamoldlogo}
              alt="Center Logo 1"
              style={{ maxHeight: "60px" }}
            />
            <img
              src={siemens}
              alt="Center Logo 2"
              style={{ maxHeight: "60px" }}
            />
          </div>
          <div>
            <img src={tidco} alt="Right Logo" style={{ maxHeight: "60px" }} />
          </div>
        </div>

        <h2 style={{ textAlign: "center" }}>
          Tamil Nadu Smart and Advanced Manufacturing Centre
        </h2>
        <p style={{ textAlign: "center" }}>
          (A Government of Tamil Nadu Enterprise wholly owned by TIDCO)
        </p>
        <h1 style={{ textAlign: "center" }}>Quotation</h1>

        {/* Ref No & Date - UNCHANGED */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <div>
            <strong>Quotation No:</strong>{" "}
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              style={{
                fontSize: "14px",
                border: "1px solid #ccc",
                padding: "4px",
              }}
            />
          </div>
          <div>
            <strong>Date:</strong>{" "}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                fontSize: "14px",
                border: "1px solid #ccc",
                padding: "4px",
              }}
            />
          </div>
        </div>

        {/* Client Info - UNCHANGED */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "12px" }}>
            <strong>TO </strong>{" "}
          </label>
          <textarea
            rows={3} // Default shows 3 lines
            value={quotation.clientName || ""}
            onChange={(e) =>
              setQuotation({ ...quotation, clientName: e.target.value })
            }
            placeholder="Enter Client Name/institution details  and Address "
            style={{
              width: "100%",
              minHeight: "48px", // ~ half to one line minimum
              padding: "8px",
              fontSize: "14px",
              lineHeight: "1.4",
              resize: "none", // ❌ no manual resize
              overflow: "hidden", // ❌ no scrollbar
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />

          <label style={{ display: "block", marginBottom: "12px" }}>
            <strong>Kind Attn </strong>{" "}
          </label>
          <textarea
            rows={2}
            value={quotation.kindAttn || ""}
            onChange={(e) =>
              setQuotation({ ...quotation, kindAttn: e.target.value })
            }
            placeholder="e.g., "
            style={{
              width: "40%",
              padding: "10px",
              fontSize: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              resize: "vertical",
              minHeight: "50px",
              lineHeight: "1.4",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block" }}>
            <strong>Subject:</strong>
            <textarea
              rows={8}
              value={quotation.subject || ""}
              onChange={(e) =>
                setQuotation({ ...quotation, subject: e.target.value })
              }
              placeholder="e.g., Quote offer for Industrial Visit 2.5 hours at TANSAM Centre"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                lineHeight: "1.0",
                border: "1px solid #ccc",
                borderRadius: "4px",
                resize: "vertical",
              }}
            />
          </label>
        </div>

        {/* Editable Table - UNCHANGED */}
        <EditableQuotationTable
          quotation={quotation}
          setQuotation={setQuotation}
        />
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ textDecoration: "underline", marginBottom: "10px" }}>
            Terms & Conditions
          </h3>

          <textarea
            rows={8}
            value={quotation.termsContent || ""}
            onChange={(e) =>
              setQuotation({ ...quotation, termsContent: e.target.value })
            }
            placeholder="Enter terms & conditions here..."
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              lineHeight: "1.0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              resize: "vertical",
            }}
          />
        </div>

        {/* ✅ FIXED TERMS & CONDITIONS WITH LOADING/ERROR */}
        <div style={{ marginTop: "30px" }}>
          <p style={{ fontSize: "14px", marginBottom: "6px" }}>
            Applicable Terms & Conditions are available at:
          </p>
          {/* ✅ LOADING STATE */}
          {termsLoading && (
            <div
              style={{
                padding: "10px",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                textAlign: "center",
                color: "#1976d2",
              }}
            >
              🔄 Loading Terms & Conditions...
            </div>
          )}
          {/* ✅ ERROR STATE */}
          {termsError && (
            <div
              style={{
                padding: "10px",
                backgroundColor: "#ffebee",
                borderRadius: "4px",
                color: "#d32f2f",
                borderLeft: "4px solid #d32f2f",
              }}
            >
              ❌ Failed to load terms: {termsError}
              <br />
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: "5px",
                  padding: "4px 8px",
                  background: "#d32f2f",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}
          {/* ✅ BUTTON - NOW WORKS */}
          <button
            onClick={() => setShowTermsModal(true)}
            style={{
              fontSize: "14px",
              color: "#1F4E79",
              fontWeight: "bold",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            View Terms & Conditions
          </button>
        </div>

        {/* Signature & Seal - UNCHANGED */}
        <h3 style={{ marginTop: "40px" }}>Yours Truly,</h3>
        <div
          style={{
            border: "1px solid #000",
            marginTop: "50px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <p>
            <strong>Signature & Seal of Finance Manager</strong>
          </p>
          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            <div style={{ flex: 1 }}>
              <p>Upload Signature</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setQuotation({ ...quotation, signature: e.target.files[0] })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <p>Upload Seal</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setQuotation({ ...quotation, seal: e.target.files[0] })
                }
              />
            </div>
          </div>
          <div style={{ marginTop: "25px" }}>
            <p>
              <strong>Name:</strong>
            </p>
            <input
              type="text"
              value={quotation.financeManagerName || ""}
              onChange={(e) =>
                setQuotation({
                  ...quotation,
                  financeManagerName: e.target.value,
                })
              }
              style={{
                width: "40%",
                padding: "8px",
                fontSize: "16px",
                textAlign: "center",
                border: "1px solid #ccc",
                margin: "0 auto",
                display: "block",
              }}
            />
          </div>
               <div style={{ marginTop: "25px" }}>
            <p>
              <strong> Designation:</strong>
            </p>
            <input
              type="text"
              value={quotation.designation || ""}
              onChange={(e) =>
                setQuotation({
                  ...quotation,
                  designation : e.target.value,
                })
              }
              style={{
                width: "40%",
                padding: "8px",
                fontSize: "16px",
                textAlign: "center",
                border: "1px solid #ccc",
                margin: "0 auto",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* Footer - FIXED LINKS */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#1F4E79",
            color: "#fff",
            fontSize: "13px",
            marginTop: "40px",
            borderTop: "2px solid #1F4E79",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "10px",
              borderRight: "1px solid #ffffff50",
              textAlign: "center",
            }}
          >
            Tel: +91 44 69255700
          </div>
          <div
            style={{
              flex: 1,
              padding: "10px",
              borderRight: "1px solid #ffffff50",
              textAlign: "center",
            }}
          >
            E-Mail: info@tansam.org
          </div>
          <div
            style={{
              flex: 1,
              padding: "10px",
              borderRight: "1px solid #ffffff50",
              textAlign: "center",
            }}
          >
            URL: www.tansam.org
          </div>
          <div style={{ flex: 2, padding: "10px", textAlign: "center" }}>
            C-Wing North, 603, TIDEL Park
            <br />
            No.4, Rajiv Gandhi Salai,
            <br />
            Taramani, Chennai - 600113
          </div>
        </div>

        {/* GST / CIN strip */}
        <div
          style={{
            backgroundColor: "#163A5F",
            color: "#fff",
            fontSize: "12px",
            textAlign: "center",
            padding: "6px",
          }}
        >
          GSTIN:- 33AAJCT2401Q1Z7 | CIN : U91990TN2022NPL150529
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: "16px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              fontSize: "15px",
              fontWeight: "600",
              backgroundColor: "#64748b",
              color: "#fff",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#475569";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#64748b";
            }}
            aria-label="Back to Finance"
          >
            <FaArrowLeft /> Back to Finance
          </button>
          <PDFDownloadLink
            document={
              <QuotationPDF
                refNo={refNo}
                date={date}
                clientName={quotation.clientName}
                kindAttn={quotation.kindAttn}
                subject={quotation.subject}
                items={quotation.items}
                termsContent={quotation.termsContent}
                financeManagerName={quotation.financeManagerName}
                designation={quotation.designation}
                signatureUrl={
                  quotation.signature
                    ? URL.createObjectURL(quotation.signature)
                    : null
                }
                sealUrl={
                  quotation.seal ? URL.createObjectURL(quotation.seal) : null
                }
              />
            }
            fileName={`${refNo || "TANSAM-Quotation"}.pdf`}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              background: "linear-gradient(135deg, #00646e, #008a94)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "600",
              display: "inline-block",
            }}
          >
            {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
          </PDFDownloadLink>
          <button
            onClick={handleSaveQuotation}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              background: "linear-gradient(135deg, #00646e, #008a94)",
              color: "#fff",
              borderRadius: "4px",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Save Quotation
          </button>
        </div>

        {/* ✅ FIXED TERMS MODAL - NOW FULLY FUNCTIONAL */}
        {showTermsModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowTermsModal(false)}
          >
            <div
              style={{
                background: "#fff",
                padding: "30px",
                width: "90%",
                maxWidth: "900px",
                maxHeight: "80%",
                overflowY: "auto",
                borderRadius: "8px",
                position: "relative",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ margin: 0, color: "#1F4E79" }}>
                  Terms & Conditions
                </h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  style={{
                    background: "#00646e",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Close
                </button>
              </div>
              {termsLoading ? (
                <p>Loading...</p>
              ) : termsError ? (
                <p style={{ color: "red" }}>{termsError}</p>
              ) : (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Term Title</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(termsList) && termsList.length > 0 ? (
                        termsList.map((term) => (
                          <tr key={term.id}>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={selectedTerms.some(
                                  (t) => t.id === term.id,
                                )}
                                onChange={() => toggleTermSelection(term)}
                              />
                            </td>
                            <td>{term.title}</td>
                            <td
                              dangerouslySetInnerHTML={{
                                __html: term.description,
                              }}
                            />
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center" }}>
                            No active terms available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div style={{ textAlign: "right", marginTop: "20px" }}>
                    <button
                      onClick={applySelectedTerms}
                      style={{
                        background: "linear-gradient(135deg, #00646e, #008a94)",
                        color: "#fff",
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Apply Selected Terms
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Preview Modal - UNCHANGED */}
        {showPreview && (savedQuotation || quotation) && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                width: "80%",
                height: "90%",
                overflow: "auto",
              }}
            >
              <h2>Quotation Preview</h2>
              <p>
                <strong>Client:</strong>{" "}
                {(savedQuotation || quotation).clientName}
              </p>
              <p>
                <strong>Ref No:</strong> {refNo}
              </p>
              <p>
                <strong>Date:</strong> {date}
              </p>

              <h3>Items</h3>
              {quotation.items?.map((item, idx) => (
                <p key={idx}>
                  {idx + 1}. {item.description} — ₹{item.total}
                </p>
              ))}

              <h3>Terms & Conditions</h3>
              {quotation.terms?.map((t, i) => (
                <p key={i}>
                  {i + 1}. <b>{t.title}</b>: {t.value}
                </p>
              ))}

              <div style={{ textAlign: "right" }}>
                <button
                  onClick={() => setShowPreview(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#00646e",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GenerateQuotation({
  quotation: initialQuotation,
  quotationNo,
  onSaved,
  onBack,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    navigate("/finance");
  };
  const isEditMode =
    !!initialQuotation?.id && initialQuotation?.items?.length > 0;
  const [quotation, setQuotation] = useState(() => ({
    id: initialQuotation?.id || null,
    subject: initialQuotation?.subject || "",
    clientName: initialQuotation?.clientName || "",
    kindAttn: initialQuotation?.kindAttn || "",
   items: initialQuotation?.items || [
    { description: "", qty: "", unitPrice: "", tax: "", total: "0.00" },
  ],
    terms: initialQuotation?.terms || [],
    termsContent: initialQuotation?.termsContent || "",
    financeManagerName: initialQuotation?.financeManagerName || "",
    designation: null,
    signature: null, // new file upload
    seal: null, // new file upload
    existingSignature: initialQuotation?.existingSignature || null, // preview path
    existingSeal: initialQuotation?.existingSeal || null, // preview path
  }));

  useEffect(() => {
    console.log("GenerateQuotation mounted with quotation.id =", quotation.id);
  }, []);
  const [activeTermsList, setActiveTermsList] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState([]);

  // ✅ ALL REQUIRED STATES
const [refNo, setRefNo] = useState(quotationNo || "");

  useEffect(() => {
    if (quotationNo) setRefNo(quotationNo);
  }, [quotationNo]);

  const [date, setDate] = useState(
    initialQuotation?.date || new Date().toISOString().split("T")[0],
  );
  const [showPreview, setShowPreview] = useState(false);
  const [savedQuotation, setSavedQuotation] = useState(null);

  // ✅ TERMS STATES WITH LOADING/ERROR
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState("<p>Loading terms...</p>");
  const [termsLoading, setTermsLoading] = useState(true);
  const [termsError, setTermsError] = useState(null);

  const toggleTermSelection = (term) => {
    setSelectedTerms((prev) => {
      const exists = prev.find((t) => t.id === term.id);
      if (exists) {
        return prev.filter((t) => t.id !== term.id);
      }
      return [...prev, term];
    });
  };
  const htmlToPlainText = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;

    // convert list items into new lines
    const lines = Array.from(div.querySelectorAll("li")).map((li) =>
      li.textContent.trim(),
    );

    // fallback if not a list
    if (lines.length === 0) {
      return div.textContent.replace(/\u00A0/g, " ").trim();
    }

    return lines.map((line, i) => `${i + 1}. ${line}`).join("\n\n");
  };
  const applySelectedTerms = () => {
    const formattedText = selectedTerms
      .map((term) => htmlToPlainText(term.description))
      .join("\n\n");

    setQuotation((prev) => ({
      ...prev,
      terms: selectedTerms,
      termsContent: formattedText, // ✅ textarea content
    }));

    setShowTermsModal(false);
  };

  useEffect(() => {
    if (!quotation.id) return;

    const loadGeneratedQuotation = async () => {
      try {
        const generated = await getGeneratedQuotationByQuotationId(
          quotation.id,
        );

        if (!generated) return;

        setRefNo(generated.refNo || refNo);
        setDate(generated.date || date);
        const rawItems =
          typeof generated.items === "string"
            ? JSON.parse(generated.items)
            : Array.isArray(generated.items)
              ? generated.items
              : [];
        setQuotation((prev) => ({
          ...prev,
          clientName: generated.clientName || "",
          kindAttn: generated.kindAttn || "",
          subject: generated.subject || "",
          financeManagerName: generated.financeManagerName || "",
          designation: generated.designation || "",
          items: rawItems.map((item) => ({
            description: item.description || "",
            unitPrice: item.unitPrice ?? "",
            qty: item.qty ?? "",
            tax: item.gst ?? item.tax ?? "",
            total:
              item.total ??
              (Number(item.qty || 0) * Number(item.unitPrice || 0)).toFixed(2),
          })),

          terms: JSON.parse(generated.terms || "[]"),
          termsContent: generated.termsContent || "",

          // previews from backend
          existingSignature: generated.signature || null,
          existingSeal: generated.seal || null,

          // reset new uploads
          signature: null,
          seal: null,
        }));
      } catch (err) {
        console.error("Failed to load generated quotation", err);
      }
    };

    loadGeneratedQuotation();
  }, [quotation.id]);

  // ✅ FIXED TERMS FETCHING WITH LOADING/ERROR
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setTermsLoading(true);
        const response = await getActiveTerms();
        console.log("TERMS API RESPONSE:", response);

        const list = Array.isArray(response)
          ? response
          : response.data
            ? response.data
            : [response];

        const formatted = list
          .filter((term) => term.status === "Active")
          .map((term) => ({
            id: term.id,
            title: `Term #${term.id}`,
            description: term.content,
          }));

        setActiveTermsList(formatted); // ✅ This is what modal reads
      } catch (err) {
        setTermsError(err.message || "Failed to fetch terms");
      } finally {
        setTermsLoading(false);
      }
    };
    fetchTerms();
  }, []);

  // ✅ FIXED handleSaveQuotation
  const handleSaveQuotation = async () => {
    try {
      if (!quotation.id) {
        alert("Error: No quotation ID found. Cannot save generated version.");
        console.error("Missing id in quotation state:", quotation);
        return;
      }

      console.log("Sending quotation_id =", quotation.id);
      const dataToSend = new FormData();
      dataToSend.append("quotation_id", quotation.id);

     dataToSend.append("quotationNo", refNo);
      dataToSend.append("date", date);
      dataToSend.append("clientName", quotation.clientName);
      dataToSend.append("kindAttn", quotation.kindAttn || "");
      dataToSend.append("subject", quotation.subject);
      dataToSend.append(
        "financeManagerName",
        quotation.financeManagerName || "",
      );
 dataToSend.append(
        "designation",
        quotation.designation || "",
      );
      dataToSend.append("items", JSON.stringify(quotation.items));
      dataToSend.append("terms", JSON.stringify(quotation.terms));
      dataToSend.append("termsContent", quotation.termsContent);
      if (quotation.signature)
        dataToSend.append("signature", quotation.signature);
      if (quotation.seal) dataToSend.append("seal", quotation.seal);

      const saved = await saveGeneratedQuotation(dataToSend);
      setSavedQuotation(saved);
      setShowPreview(true);
      alert("Quotation saved successfully!");
      onSaved && onSaved();
    } catch (err) {
      console.error("Save quotation error:", err);
      alert("Failed to save quotation. Try again.");
    }
  };

  // ✅ PASS ALL REQUIRED PROPS
  return (
    <FinanceDocument
      isEditMode={isEditMode}
      quotation={quotation}
      setQuotation={setQuotation}
      refNo={refNo}
      setRefNo={setRefNo}
      date={date}
      setDate={setDate}
      showPreview={showPreview}
      setShowPreview={setShowPreview}
      savedQuotation={savedQuotation}
      handleSaveQuotation={handleSaveQuotation}
      handleBack={handleBack}
      showTermsModal={showTermsModal}
      setShowTermsModal={setShowTermsModal}
      termsList={activeTermsList}
      selectedTerms={selectedTerms}
      applySelectedTerms={applySelectedTerms} // ✅ add this
      toggleTermSelection={toggleTermSelection}
      termsLoading={termsLoading}
      termsError={termsError}
      termsContent={termsContent}
    />
  );
}
