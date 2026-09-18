import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/finance.css";
import GenerateQuotation from "./generateQuotation";
import {
  getQuotations,
  addQuotation,
  updateQuotation,
  deleteQuotation,
   generateQuotationNo,
} from "../../services/quotation/quotation.api";
import MultiSelectDropdown from "./MultiSelectDropdown";

import { FaFileWord, FaEdit, FaTrash, FaFilePdf } from "react-icons/fa";
import { MdEditDocument } from "react-icons/md";
import { fetchWorkCategories } from "../../services/admin/admin.roles.api";
import { fetchLabs } from "../../services/admin/admin.roles.api";
import { getGeneratedQuotationByQuotationId } from "../../services/quotation/generatedQuotation.api";
import { fetchOpportunities } from "../../services/coordinator/coordinator.opportunity.api.js";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { fetchProjects } from "../../services/project.api.js";
import Select from "react-select";

export default function Quotations() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const SERVER_URL = API_BASE.replace("/api", "");
  const [_workCategories, setWorkCategories] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [labs, setLabs] = useState([]);
  const [activeTab, setActiveTab] = useState("quotation");
  const [showDoc, setShowDoc] = useState(false);
  const [_projects, setProjects] = useState([]);
  // const [selectedProject, setSelectedProject] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedWorkCategories, setSelectedWorkCategories] = useState([]);
  const [selectedLabs, setSelectedLabs] = useState([]);

  const [_showOpportunityDropdown, setShowOpportunityDropdown] =
    useState(false);

  const [_paymentQuotationId, setPaymentQuotationId] = useState(null);

  const clientOptions = [...new Set(data.map((d) => d.clientName))];
  const workCategoryOptions = [
    ...new Set(data.map((d) => d.work_category_name)),
  ];
  const labOptions = labs.map((lab) => lab.name);

  const [showGenerateQuotation, setShowGenerateQuotation] = useState(false);

  const [newQuotation, setNewQuotation] = useState({
    quotationNo: "",
    opportunity_id: "",
    opportunity_name: "",
    client_id: "",
    clientName: "",
    client_type_id: "",
    client_type_name: "",
    work_category_id: "",
    work_category_name: "",
    lab_id: "",
    lab_name: "",
    description: "",
    // "value" | "unit"
    unitPrice: "",
    qty: "",
    gst: "",
    date: "",
    quotationStatus: "Draft",
    revisedCost: "",
    poReceived: "No",
    poNumber: "",
    paymentReceived: "No",
    Remarks: "",
    paymentReceivedDate: "",
    paymentAmount: "",
    paymentPendingReason: "",
    items: [
      { description: "", qty: "", unitPrice: "", gst: "", total: "0.00" },
    ],
  });

  const clearAllFilters = () => {
    setSelectedClients("");
    setSelectedWorkCategories("");
    setSelectedLabs("");
    setPage(1);
  };
  const handleEditGeneratedQuotation = async (originalQuotation) => {
    console.log("Edit clicked for quotation ID:", originalQuotation.id);

    // ─── Define baseQuotation outside try so it's accessible in catch ───
    const baseQuotation = {
      id: originalQuotation.id,
      quotationNo: originalQuotation.quotationNo || "",
      opportunity_name: originalQuotation.opportunity_name || "",
      clientName: originalQuotation.clientName || "",
      kindAttn: "",
      subject: "",
      financeManagerName: "",
      items: [{ description: "", qty: "", unitPrice: "", total: "0.00" }],
      terms: [],
      termsContent: "",
      signature: null,
      seal: null,
      existingSignature: null,
      existingSeal: null,
    };
    // ────────────────────────────────────────────────

    try {
      const generated = await getGeneratedQuotationByQuotationId(
        originalQuotation.id,
      );
      console.log("API returned generated data:", generated);

      let quotationToUse;

      if (!generated || !generated.id) {
        console.warn("No previously generated quotation found for this ID");
        quotationToUse = {
          ...baseQuotation,
          refNo: `TN/SA/${new Date().getFullYear()}/${String(originalQuotation.id).padStart(4, "0")}`,
          date: new Date().toISOString().split("T")[0],
        };
      } else {
        console.log("Loading existing generated quotation data");
        quotationToUse = {
          ...baseQuotation,
          quotationId: originalQuotation.id,
          quotationNo: originalQuotation.quotationNo,
          opportunity_name:
            originalQuotation.opportunity_name ||
            generated.opportunity_name ||
            "",
          clientName: originalQuotation.clientName || "",
          generatedId: generated.id,
          refNo: generated.refNo,
          date: generated.date,
          items: generated.items
            ? JSON.parse(generated.items)
            : baseQuotation.items,
          terms: generated.terms
            ? JSON.parse(generated.terms)
            : baseQuotation.terms,
          termsContent: generated.termsContent || "",
          existingSignature: generated.signature
            ? `${SERVER_URL}/${generated.signature}`
            : null,
          existingSeal: generated.seal
            ? `${SERVER_URL}/${generated.seal}`
            : null,
          signature: null,
          seal: null,
        };
      }

      // Ensure unitPrice, qty, gst are passed to GenerateQuotation
      quotationToUse = {
        ...quotationToUse,

        // ✅ Pass unit pricing as items array
        items: [
          {
            description: originalQuotation.description || "",
            qty: Number(originalQuotation.qty || 0),
            unitPrice: Number(originalQuotation.unitPrice || 0),
            tax: Number(originalQuotation.gst || 0),
            total: (
              Number(originalQuotation.unitPrice || 0) *
              Number(originalQuotation.qty || 0)
            ).toFixed(2),
          },
        ],
      };

      setNewQuotation(quotationToUse);
      setShowGenerateQuotation(true);
    } catch (err) {
      console.error("Error loading generated quotation:", err);
      alert(
        "Could not load previous generated version. Opening with basic data.",
      );

      // Fallback – now baseQuotation is accessible
      setNewQuotation({
        ...baseQuotation,

        date: new Date().toISOString().split("T")[0],
      });
      setShowGenerateQuotation(true);
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      if (!showPaymentForm || !newQuotation.clientName) return;

      try {
        const res = await fetchProjects(); // existing project.api.js
        const filtered = res.filter(
          (p) =>
            p.clientName?.toLowerCase() ===
            newQuotation.clientName?.toLowerCase(),
        );
        setProjects(filtered);
      } catch (err) {
        console.error("Failed to load projects", err);
        setProjects([]);
      }
    };

    loadProjects();
  }, [showPaymentForm, newQuotation.clientName]);

  useEffect(() => {
    const closeDropdowns = () => {
      setShowOpportunityDropdown(false);
    };

    document.addEventListener("click", closeDropdowns);
    return () => document.removeEventListener("click", closeDropdowns);
  }, []);

  useEffect(() => {
    const loadWorkCategories = async () => {
      try {
        const categories = await fetchWorkCategories(); // API from admin.roles.api.js
        setWorkCategories(categories);
      } catch (err) {
        console.error("Failed to fetch work categories:", err);
        alert("Failed to load work categories");
      }
    };

    loadWorkCategories();
  }, []);
// useEffect(() => {
//   setNewQuotation((prev) => {
//     if (prev.quotationStatus === "Approved") {
//       if (prev.paymentPhase === "Started") return prev;

//       return {
//         ...prev,
//         paymentPhase: "Started",
//       };
//     } else {
//       if (prev.paymentPhase === "Not Started") return prev;

//       return {
//         ...prev,
//         paymentPhase: "Not Started",
//         revisedCost: "",
//         poReceived: "No",
//         poNumber: "",
//         remarks: "",
//         paymentReceived: "No",
//         paymentReceivedDate: "",
//         paymentAmount: "",
//         paymentPendingReason: "",
//       };
//     }
//   });
// }, [newQuotation.quotationStatus]);
  const initializePaymentFields = (status, currentData) => {
    if (status === "Approved") {
      return {
        paymentPhase: currentData.paymentPhase || "Started",
        revisedCost: currentData.revisedCost || "",
        poReceived: currentData.poReceived || "No",
        poNumber: currentData.poNumber || "",
        remarks: currentData.Remarks || "",
        paymentReceived: currentData.paymentReceived || "No",
        paymentReceivedDate: currentData.paymentReceivedDate || "",
        paymentAmount: currentData.paymentAmount || "",
        paymentPendingReason: currentData.paymentPendingReason || "",
      };
    } else {
      return {
        paymentPhase: "Not Started",
        revisedCost: "",
        poReceived: "No",
        poNumber: "",
        remarks: "",
        paymentReceived: "No",
        paymentReceivedDate: "",
        paymentAmount: "",
        paymentPendingReason: "",
      };
    }
  };

  useEffect(() => {
    const loadLabs = async () => {
      try {
        const labData = await fetchLabs(); // from admin.roles.api.js
        setLabs(labData);
      } catch (err) {
        console.error("Failed to fetch labs:", err);
        alert("Failed to load labs");
      }
    };

    loadLabs();
  }, []);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const data = await fetchOpportunities(); // API call
        setOpportunities(data);
      } catch (err) {
        console.error("Failed to fetch opportunities:", err);
        alert("Failed to load opportunities");
      }
    };

    loadOpportunities();
  }, []);
const filtered = data.filter((q) => {
  const clientMatch =
    selectedClients.length === 0 ||
    selectedClients.includes(q.clientName);

  const categoryMatch =
    selectedWorkCategories.length === 0 ||
    selectedWorkCategories.includes(q.work_category_name);

  const labNames = Array.isArray(q.lab_name)
    ? q.lab_name
    : (() => {
        try {
          return JSON.parse(q.lab_name || "[]");
        } catch {
          return [];
        }
      })();

  const labMatch =
    selectedLabs.length === 0 ||
    selectedLabs.some((lab) => labNames.includes(lab));

  return clientMatch && categoryMatch && labMatch;
});

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

const handleEdit = (quotation) => {
  setEditId(quotation.id);

  let items = [];
  try {
    items = quotation.itemDetails ? JSON.parse(quotation.itemDetails) : [];
  } catch {
    items = [];
  }

  const firstItem = items[0] || {};

  setNewQuotation({
    ...quotation,

    // safer fallback
    unitPrice: firstItem?.unitPrice ?? "",
    qty: firstItem?.qty ?? "",
    gst: firstItem?.gst ?? "",

    // payment fields
    ...initializePaymentFields(quotation.quotationStatus, quotation),

    paymentPhase: quotation.paymentPhase || "Not Started",
    revisedCost: quotation.revisedCost || "",
    poReceived: quotation.poReceived || "No",
    poNumber: quotation.poNumber || "",
    remarks: quotation.remarks || "",
    paymentReceived: quotation.paymentReceived || "No",
    paymentReceivedDate: quotation.paymentReceivedDate || "",
    paymentAmount: quotation.paymentAmount || "",
    paymentPendingReason: quotation.paymentPendingReason || "",
  });

  setShowModal(true);
};

  useEffect(() => {
    getQuotations().then((res) => setData(res));
  }, []);

  const handleSaveQuotation = async () => {
    try {
      // 🚨 PO NUMBER MANDATORY ONLY FOR UPDATE
      if (
        editId &&
        newQuotation.quotationStatus === "Approved" &&
        !newQuotation.poNumber?.trim()
      ) {
        alert("Purchase Order Number is mandatory when quotation is Approved");
        return;
      }

      if (!newQuotation.client_id) {
  alert("Client Name is required");
  return;
}
 // ✅ ADD HERE 👇
    if (!newQuotation.opportunity_name) {
      alert("Opportunity is required");
      return;
    }

    if (!newQuotation.unitPrice || !newQuotation.qty) {
      alert("Unit price and quantity required");
      return;
    }

      const base =
        Number(newQuotation.unitPrice || "") * Number(newQuotation.qty || "");

      const totalValue = base + (base * Number(newQuotation.gst || "")) / 100;

      const itemsArray = [
        {
          description: newQuotation.description || "",
          qty: Number(newQuotation.qty || ""),
          unitPrice: Number(newQuotation.unitPrice || ""),
          gst: Number(newQuotation.gst || ""),
          total: totalValue,
        },
      ];

      const selectedOpportunities = Array.isArray(newQuotation.opportunity_name)
        ? newQuotation.opportunity_name
        : [newQuotation.opportunity_name]; // convert single string to array if needed

      const matchedOpportunity = opportunities.find(
        (opp) => opp.opportunity_name === selectedOpportunities[0],
      );

      const opportunity_id = matchedOpportunity?.opportunity_id || null;

      const payload = {
        quotationNo: editId
          ? newQuotation.quotationNo
          : newQuotation.quotationNo ,
        opportunity_id,
        opportunity_name: newQuotation.opportunity_name,
        client_id: newQuotation.client_id,
        clientName: newQuotation.clientName,
        client_type_id: newQuotation.client_type_id,
        client_type_name: newQuotation.client_type_name,
        work_category_id: newQuotation.work_category_id,
        work_category_name: newQuotation.work_category_name,
        lab_id: newQuotation.lab_id,
        lab_name: newQuotation.lab_name,
        description: newQuotation.description,

        unitPrice: newQuotation.unitPrice || 0,
        qty: newQuotation.qty || 0,
        gst: newQuotation.gst || 0,
        value: totalValue,
        items: JSON.stringify(itemsArray),
        date: newQuotation.date,
        quotationStatus: newQuotation.quotationStatus,
        // ✅ only include payment fields if Approved
        ...(newQuotation.quotationStatus === "Approved"
          ? {
              paymentPhase: newQuotation.paymentPhase,

              poNumber: newQuotation.poNumber,
              remarks: newQuotation.remarks,
              paymentReceived: newQuotation.paymentReceived,
              paymentReceivedDate: newQuotation.paymentReceivedDate,
              paymentAmount: newQuotation.paymentAmount,
              paymentPendingReason: newQuotation.paymentPendingReason,
            }
          : {}),
      };

      if (editId) {
        await updateQuotation(editId, payload);
      } else {
        await addQuotation(payload);
      }

      const updatedData = await getQuotations();
      setData(updatedData);

      setShowModal(false);
      setEditId(null);
      setNewQuotation({
        quotationNo: "",
        opportunity_name: "",
        clientName: "",
        client_type_name: "",
        work_category_name: "",
        lab_name: "",
        description: "",
        value: "",
        gst: "",
        totalValue: "",
        date: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error saving quotation");
    }
  };

  const deleteRow = async (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await deleteQuotation(id);
        const updatedData = await getQuotations();
        setData(updatedData);
      } catch (err) {
        console.error(err);
        alert("Error deleting quotation");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setNewQuotation({
      quotationNo: "",
      opportunity_name: "",
      clientName: "",
      client_type_name: "",
      work_category_name: "",
      lab_name: "",
      description: "",
      value: "",
      date: "",
    });
  };
  if (showDoc) {
    return (
      <QuotationDocument
        quotation={newQuotation}
        onBack={() => setShowDoc(false)}
      />
    );
  }
  if (showGenerateQuotation) {
    return (
      <GenerateQuotation
        quotation={newQuotation}
        quotationNo={newQuotation.quotationNo}
        onBack={() => {
          setShowGenerateQuotation(false);
          navigate("/finance");
        }}
        onSaved={async () => {
          try {
            const fresh = await getQuotations();
            setData(fresh);
          } catch (err) {
            console.error("Refresh after generate failed", err);
          }
          setShowGenerateQuotation(false);
          navigate("/finance");
        }}
      />
    );
  }

  return (
    <div className="finance-container">
      {/* Header */}
      <div className="table-header">
        <div>
          <h2>Quotations Management</h2>
        </div>
       <button
  className="btn-add-quotation"
  onClick={async () => {
    try {
      // ✅ call backend to generate quotation number
      const res = await generateQuotationNo();

      setNewQuotation({
        quotationNo: res.quotationNo, // 👈 from backend
        opportunity_name: "",
        clientName: "",
        client_type_name: "",
        work_category_name: "",
        lab_name: "",
        description: "",
        gst: "",
        value: "",
        date: new Date().toISOString().split("T")[0],
      });

      setEditId(null);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert("Unable to generate quotation number");
    }
  }}
>
  + Create New Quotation
</button>

      </div>

      {/* Filters */}
      <div className="filters">
        <MultiSelectDropdown
          // label="Client"
          options={clientOptions.map((c) => ({ label: c, value: c }))}
          selectedValues={selectedClients}
          onChange={(values) => {
            setSelectedClients(values);
            setPage(1);
          }}
          placeholder="Enter your clients"
        />

        <MultiSelectDropdown
          // label="Work Category"
          options={workCategoryOptions.map((w) => ({ label: w, value: w }))}
          selectedValues={selectedWorkCategories}
          onChange={(values) => {
            setSelectedWorkCategories(values);
            setPage(1);
          }}
          placeholder="Enter your work category"
        />

        <MultiSelectDropdown
          // label="Lab"
          options={labOptions.map((l) => ({ label: l, value: l }))}
          selectedValues={selectedLabs}
          onChange={(values) => {
            setSelectedLabs(values);
            setPage(1);
          }}
          placeholder="Enter Lab"
        />

        <button className="btn-clear-filters" onClick={clearAllFilters}>
          ✕
        </button>

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
      <div className="tabs">
        <button
          className={`tab ${activeTab === "quotation" ? "active" : ""}`}
          onClick={() => setActiveTab("quotation")}
        >
          Quotation
        </button>
        <button
          className={`tab ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          Payment Phase
        </button>
      </div>
      {/* Table */}
      <div className="card-table">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              {activeTab === "quotation" ? (
                <>
                  <th>Quotation No</th>
                  <th>Opportunity Name</th>
                  <th>Client Name</th>
                  <th>Client Type</th>
                  <th>Work Category</th>
                  <th>Lab</th>
                  <th>Description</th>
                  <th>Quote Value</th>
                  <th>Date</th>
                  <th>Actions</th> {/* Only in Quotation tab */}
                </>
              ) : (
                <>
                  <th>Quotation No</th>
                  <th>Opportunity Name</th>
                  <th>Payment Phase</th>
                  <th>Purchase order number</th>
                  <th>Payment Received</th>
                  <th>Payment Amount</th>
                  <th>Pending Reason</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((q, i) => (
                <tr key={q.id} className="table-row">
                  <td>{(page - 1) * pageSize + i + 1}</td>

                  {activeTab === "quotation" ? (
                    <>
                      <td>
                        <strong>{q.quotationNo}</strong>
                      </td>
                      <td>{q.opportunity_name}</td>
                      <td>{q.clientName}</td>
                      <td>
                        <span
                          className={`badge badge-${q.client_type_name.toLowerCase()}`}
                        >
                          {q.client_type_name}
                        </span>
                      </td>
                      <td>{q.work_category_name}</td>
                      <td>
                        <span className="badge-lab_name">
                            {Array.isArray(q.lab_name)
                              ? q.lab_name.join(", ")
                              : (() => {
                                  try {
                                    return JSON.parse(q.lab_name || "[]").join(", ");
                                  } catch {
                                    return q.lab_name;
                                  }
                                })()}
                          </span>
                      </td>
                      <td className="desc-cell">{q.description}</td>
                      <td className="value-cell">
                        ₹{" "}
                        {(() => {
                          try {
                            const items = JSON.parse(q.itemDetails || "[]");

                            const total = items.reduce(
                              (sum, item) => sum + Number(item.total || 0),
                              0,
                            );

                            return total.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });
                          } catch {
                            return "0.00";
                          }
                        })()}
                      </td>

                      <td>{new Date(q.date).toLocaleDateString("en-IN")}</td>

                      {/* Actions column ONLY in Quotation tab */}
                      <td className="actions-cell">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(q)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => deleteRow(q.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>

                        {q.isGenerated ? (
                          <button
                            className="btn-medit"
                            onClick={() => handleEditGeneratedQuotation(q)}
                            title="Edit Generated Quotation"
                          >
                            <MdEditDocument size={30} />
                          </button>
                        ) : (
                          <button
                            className="btn-generate"
                            onClick={() => {
                              let items = [];

                              try {
                                items = q.itemDetails
                                  ? JSON.parse(q.itemDetails)
                                  : [];
                              } catch (error) {
                                console.error("Invalid JSON in itemDetails:", error);
                                items = [];
                              }
                              const firstItem = items[0] || {};

                              // Generate the quotation number here if needed
                              const quotationNo =
                                q.quotationNo || generateQuotationNo(data); 

                              setNewQuotation({
                                ...q,
                                quotationNo, // keeps quotationNo, client, date, etc.
                                items: [
                                  {
                                    description:
                                      q.description ||
                                      firstItem.description ||
                                      "",
                                    qty: Number(firstItem.qty || 0),
                                    unitPrice: Number(firstItem.unitPrice || 0),
                                    tax: Number(firstItem.gst || 0),
                                    total: (
                                      Number(firstItem.unitPrice || 0) *
                                      Number(firstItem.qty || 0)
                                    ).toFixed(2),
                                  },
                                ],
                              });

                              setShowGenerateQuotation(true);

                              // Pass the quotationNo to GenerateQuotation
                            }}
                            title="Generate Quotation"
                          >
                            <FaFilePdf size={30} />
                          </button>
                        )}

                        {q.quotationStatus === "Approved" && (
                          <FaMoneyCheckAlt
                            style={{ cursor: "pointer", color: "green" }}
                            size={30}
                            title="Payment"
                            onClick={async () => {
                              try {
                                // fetch latest quotations from DB
                                const allQuotations = await getQuotations();
                                const latestQuotation = allQuotations.find(
                                  (item) => item.id === q.id,
                                );

                                if (!latestQuotation)
                                  return alert("Quotation not found");

                                // set state with latest payment info
                                setPaymentQuotationId(latestQuotation.id);
                                setNewQuotation({
                                  ...latestQuotation,

                                  paymentPhase:
                                    latestQuotation.paymentPhase || "Started",

                                  poNumber: latestQuotation.poNumber || "",
                                  remarks: latestQuotation.remarks || "",
                                  paymentReceived:
                                    latestQuotation.paymentReceived || "No",
                                  paymentReceivedDate:
                                    latestQuotation.paymentReceivedDate || "",
                                  paymentAmount:
                                    latestQuotation.paymentAmount || "",
                                  paymentPendingReason:
                                    latestQuotation.paymentPendingReason || "",
                                });

                                setEditId(null); // ensure edit modal is closed
                                setShowModal(false);
                                setShowPaymentForm(true); // open payment modal
                              } catch (err) {
                                console.error(err);
                                alert("Failed to load payment details");
                              }
                            }}
                          />
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <strong>{q.quotationNo}</strong>
                      </td>
                      <td>{q.opportunity_name || "-"}</td>
                      <td>{q.paymentPhase || "Not Started"}</td>

                      <td>{q.poNumber || "-"}</td>
                      <td>{q.paymentReceived || "No"}</td>
                      <td>{q.paymentAmount || "-"}</td>
                      <td>{q.paymentPendingReason || "-"}</td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={activeTab === "quotation" ? "11" : "7"}
                  className="no-data"
                >
                  No quotations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        {/* Prev */}
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ← Prev
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`page-btn ${page === num ? "active" : ""}`}
            onClick={() => setPage(num)}
          >
            {num}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>

      {/* ✅ IMPROVED MODAL */}
      {showModal && (
        <div className="finance-modal-overlay" onClick={closeModal}>
          <div className="finance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? "Edit Quotation" : "Create New Quotation"}</h3>
              <button className="btn-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            {/* FORM */}
            <div className="modal-form">
              <div className="form-group">
                <label>Quotation No *</label>
                <input type="text" value={newQuotation.quotationNo} readOnly />
              </div>
              <div className="form-group">
                <label>Client Name(s) *</label>

                <select
                  value={newQuotation.client_id}
                  onChange={(e) => {
                    const clientId = e.target.value;
                    setNewQuotation({
                      ...newQuotation,
                      client_id: clientId,
                      clientName: "", // keep blank for now
                      opportunity_name: "", // reset opportunity selection
                      work_category_id: "",
                      work_category_name: "",
                      lab_id: "",
                      lab_name: "",
                      client_type_id: "",
                      client_type_name: "",
                    });
                  }}
                >
                  <option value="">Select Client</option>
                  {opportunities
                    .map((opp) => ({
                      client_id: opp.client_id,
                      client_name: opp.client_name,
                    }))
                    .filter(
                      (v, i, a) =>
                        a.findIndex((t) => t.client_id === v.client_id) === i,
                    )
                    .map((client) => (
                      <option key={client.client_id} value={client.client_id}>
                        {client.client_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* OPPORTUNITY SELECTION (filtered by selected client) */}
              {/* OPPORTUNITY SELECTION AS CHECKBOXES */}
              {/* OPPORTUNITY SELECTION (filtered by selected client) */}

              {/* <div className="form-group">
 

<MultiSelectDropdown
  label="Opportunity Name(s) *"
  options={opportunities.filter(
    o => String(o.client_id) === String(newQuotation.client_id)
  )}
  displayKey="opportunity_name"
  valueKey="opportunity_name"
  selectedValues={
    Array.isArray(newQuotation.opportunity_name)
      ? newQuotation.opportunity_name
      : newQuotation.opportunity_name
        ? [newQuotation.opportunity_name]
        : []
  }
  placeholder="Select Opportunity"
  onChange={(selected) => {
    const firstOpp = opportunities.find(
      o =>
        String(o.client_id) === String(newQuotation.client_id) &&
        selected.includes(o.opportunity_name)
    );

    setNewQuotation({
      ...newQuotation,
      opportunity_name: selected,
      clientName: firstOpp?.client_name || "",
      work_category_id: firstOpp?.work_category_id || "",
      work_category_name: firstOpp?.work_category_name || "",
      lab_id: firstOpp?.lab_id || "",
      lab_name: firstOpp?.lab_name ? JSON.parse(firstOpp.lab_name).join(", ") : "",
      client_type_id: firstOpp?.client_type_id || "",
      client_type_name: firstOpp?.client_type_name || "",
    });
  }}
/>


</div> */}
              <MultiSelectDropdown
                label="Opportunity Name(s) *"
                options={opportunities.filter(
                  (o) => String(o.client_id) === String(newQuotation.client_id),
                )}
                displayKey="opportunity_name"
                valueKey="opportunity_name"
                selectedValues={
                  newQuotation.opportunity_name
                    ? newQuotation.opportunity_name.split(",")
                    : []
                }
                placeholder="Select Opportunity"
                onChange={(selected) => {
                  const matchedOpps = opportunities.filter(
                    (o) =>
                      String(o.client_id) === String(newQuotation.client_id) &&
                      selected.includes(o.opportunity_name),
                  );

                  setNewQuotation({
                    ...newQuotation,
                    opportunity_name: matchedOpps
                      .map((o) => o.opportunity_name)
                      .join(","),
                    opportunity_id: matchedOpps
                      .map((o) => o.opportunity_id)
                      .join(","),

                    clientName: matchedOpps[0]?.client_name || "",
                    work_category_id: matchedOpps[0]?.work_category_id || "",
                    work_category_name:
                      matchedOpps[0]?.work_category_name || "",
                    lab_id: matchedOpps[0]?.lab_id || "",
                    lab_name: matchedOpps[0]?.lab_name || "",
                    client_type_id: matchedOpps[0]?.client_type_id || "",
                    client_type_name: matchedOpps[0]?.client_type_name || "",
                  });

                  // ✅ ADD THIS LINE HERE
                  // setSelectedOppStages(matchedOpps.map((o) => o.stage));
                }}
              />

              <div className="form-group">
                <label>Client Type</label>
                <input
                  type="text"
                  value={newQuotation.client_type_name}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Work Category</label>
                <input
                  type="text"
                  value={newQuotation.work_category_name}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Lab</label>
                <input type="text" value={newQuotation.lab_name} readOnly />
              </div>

              <div className="form-group">
                <label>Unit Price *</label>
                <input
                  type="number"
                  value={newQuotation.unitPrice}
                  onChange={(e) =>
                    setNewQuotation({
                      ...newQuotation,
                      unitPrice: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={newQuotation.qty}
                  onChange={(e) =>
                    setNewQuotation({
                      ...newQuotation,
                      qty: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>GST (%)</label>
                <input
                  type="number"
                  value={newQuotation.gst}
                  onChange={(e) =>
                    setNewQuotation({
                      ...newQuotation,
                      gst: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Calculated Value</label>
                <input
                  type="text"
                  readOnly
                  value={(() => {
                    const unit = Number(newQuotation.unitPrice || 0);
                    const qty = Number(newQuotation.qty || 0);
                    const gst = Number(newQuotation.gst || 0);
                    const base = unit * qty;
                    const taxAmount = base * (gst / 100);
                    const total = base + taxAmount;
                    return total.toFixed(2);
                  })()}
                />
              </div>

              <div className="form-group">
                <label>Work Description *</label>
                <textarea
                  value={newQuotation.description}
                  onChange={(e) =>
                    setNewQuotation({
                      ...newQuotation,
                      description: e.target.value,
                    })
                  }
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Quotation Date *</label>
                <input
                  type="date"
                  value={newQuotation.date}
                  onChange={(e) =>
                    setNewQuotation({ ...newQuotation, date: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Quotation Status *</label>
                <select
                  value={newQuotation.quotationStatus}
                  onChange={(e) =>
                    setNewQuotation({
                      ...newQuotation,
                      quotationStatus: e.target.value,
                    })
                  }
                >
                  <option value="Draft">Draft</option>
                  {editId && (
                    <>
                      <option value="Submitted">Submitted</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </>
                  )}
                </select>
                {newQuotation.quotationStatus === "Approved" && editId && (
                  <div className="form-group">
                    <label>Purchase Order Number *</label>
                    <input
                      type="text"
                      value={newQuotation.poNumber || ""}
                      onChange={(e) =>
                        setNewQuotation({
                          ...newQuotation,
                          poNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* PAYMENT PHASE */}
            </div>

            {/* LIVE QUOTATION PREVIEW */}
            {/* <div
              className="quotation-preview"
              style={{
                border: "1px solid #ccc",
                backgroundColor: "#fffefe",
                maxHeight: "100px",
              }}
            >
              <h2 style={{ textAlign: "center" }}>Quotation</h2>
              <p>
                <strong>Quotation No:</strong> {newQuotation.quotationNo}
              </p>
              <p>
                <strong>Date:</strong> {newQuotation.date}
              </p>
              <p>
                <strong>Opportunity Name:</strong>{" "}
                {newQuotation.opportunity_name}
              </p>
              <p>
                <strong>Client:</strong> {newQuotation.clientName} (
                {newQuotation.client_type_name})
              </p>
              <p>
                <strong>Lab:</strong> {newQuotation.lab_name}
              </p>
              <p>
                <strong>Work Category:</strong>{" "}
                {newQuotation.work_category_name}
              </p>
              <p>
                <strong>Description:</strong> {newQuotation.description}
              </p>
              <p>
                <strong>Quote Value (Incl. GST):</strong> ₹{" "}
                {calculateTotalValue()}
              </p>
            </div> */}

            {/* ACTIONS */}
            <div className="finance-modal-actions">
              <button className="btn-save" onClick={handleSaveQuotation}>
                {editId ? "Update Quotation" : "Create & Save Quotation"}
              </button>

              {/* <button className="btn-download" onClick={() => downloadDocx(newQuotation)}>
          Generate DOCX
        </button> */}

              <button className="btn-cancel" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showPaymentForm && (
        <div
          className="finance-modal-overlay"
          onClick={() => setShowPaymentForm(false)}
        >
          <div className="finance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enter Payment Details</h3>
              <button
                className="btn-close"
                onClick={() => setShowPaymentForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>Purchase Order Number *</label>
                <input
                  type="text"
                  value={newQuotation.poNumber || ""}
                  onChange={(e) =>
                    setNewQuotation({
                      ...newQuotation,
                      poNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Payment Phase *</label>
                <select
                  value={newQuotation.paymentPhase}
                  onChange={(e) =>
                    setNewQuotation({
                      ...newQuotation,
                      paymentPhase: e.target.value,
                    })
                  }
                >
                  <option value="Not Started">Not Started</option>
                  <option value="Started">Started</option>
                </select>
              </div>

              {newQuotation.paymentPhase === "Started" && (
                <>
                  <div className="form-group">
                    <label>Payment Received *</label>
                    <select
                      value={newQuotation.paymentReceived}
                      onChange={(e) =>
                        setNewQuotation({
                          ...newQuotation,
                          paymentReceived: e.target.value,
                        })
                      }
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {newQuotation.paymentReceived === "Yes" && (
                    <>
                      <div className="form-group">
                        <label>Payment Amount</label>
                        <input
                          type="number"
                          value={newQuotation.paymentAmount}
                          onChange={(e) =>
                            setNewQuotation({
                              ...newQuotation,
                              paymentAmount: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Payment Received Date *</label>
                        <input
                          type="date"
                          value={newQuotation.paymentReceivedDate || ""}
                          onChange={(e) =>
                            setNewQuotation({
                              ...newQuotation,
                              paymentReceivedDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}

                  {newQuotation.paymentReceived === "No" && (
                    <div className="form-group">
                      <label>Payment Pending Reason</label>
                      <textarea
                        rows="2"
                        value={newQuotation.paymentPendingReason}
                        onChange={(e) =>
                          setNewQuotation({
                            ...newQuotation,
                            paymentPendingReason: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </>
              )}
              {newQuotation.paymentPhase === "Not Started" && (
                <div className="form-group">
                  <label>Remarks</label>
                  <input
                    type="text"
                    value={newQuotation.remarks}
                    onChange={(e) =>
                      setNewQuotation({
                        ...newQuotation,
                        remarks: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="finance-modal-actions">
              <button
                className="btn-save"
                onClick={async () => {
                  try {
                    await updateQuotation(newQuotation.id, {
                      paymentPhase: newQuotation.paymentPhase,
                      poNumber: newQuotation.poNumber,
                      paymentReceived: newQuotation.paymentReceived,
                      paymentReceivedDate: newQuotation.paymentReceivedDate,
                      paymentAmount: newQuotation.paymentAmount,
                      paymentPendingReason: newQuotation.paymentPendingReason,
                      remarks: newQuotation.remarks,
                    });// save payment
                    setShowPaymentForm(false);
                    // optionally refresh your quotation list
                  } catch (err) {
                    console.error(err);
                    alert("Error saving payment details");
                  }
                }}
              >
                Save Payment
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowPaymentForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
