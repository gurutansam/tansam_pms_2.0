import { useEffect, useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Ceocss/Ceoprojects.css";

import { fetchProjects } from "../../services/project.api";
import { fetchProjectFollowups } from "../../services/projectFollowup.api";
import { getQuotations } from "../../services/quotation/quotation.api";
const ROWS_PER_PAGE = 10;

export default function CeoProjects() {
  const [projects, setProjects] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [followupStatuses, setFollowupStatuses] = useState({});
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [quotationsLoading, setQuotationsLoading] = useState(true);

  /* 🔍 FILTER STATES */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLabs, setSelectedLabs] = useState([]); // Array for multi-select
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= LOAD PROJECTS ================= */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProjects();
        setProjects(data || []);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        toast.error("Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    })();
  }, []);

  /* ================= LOAD QUOTATIONS ================= */
  useEffect(() => {
    (async () => {
      try {
        const data = await getQuotations();
        setQuotations(data || []);
      } catch (err) {
        console.error("Failed to fetch quotations:", err);
        toast.error("Failed to load quotation data");
      } finally {
        setQuotationsLoading(false);
      }
    })();
  }, []);

  /* ================= LOAD FOLLOWUP STATUS ================= */
  useEffect(() => {
    if (projects.length === 0) return;

    const loadStatuses = async () => {
      try {
        const followups = await fetchProjectFollowups();
        const statuses = {};

        projects.forEach((project) => {
          const projectFollowups = (followups || []).filter(
            (f) => f.projectId === project.id
          );

          if (projectFollowups.length > 0) {
            const latest = projectFollowups.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )[0];
            statuses[project.id] = latest.status;
          } else {
            statuses[project.id] = "Planned";
          }
        });

        setFollowupStatuses(statuses);
      } catch (err) {
        console.error("Failed to fetch followups:", err);
      }
    };

    loadStatuses();
  }, [projects]);

  /* ================= QUOTATION PAYMENTS MAP ================= */
  const { paymentsByOpp, paymentsByQuote } = useMemo(() => {
    const oppMap = {};
    const quoteMap = {};

    quotations.forEach((q) => {
      const isApproved =
        q.quotationStatus?.toString()?.trim()?.toLowerCase() === "approved";
      const isPaymentReceived =
        q.paymentReceived?.toString()?.trim()?.toLowerCase() === "yes";

      if (isApproved && isPaymentReceived) {
        const amount = Number(q.paymentAmount || 0);
        const oppId = q.opportunity_id?.toString()?.trim()?.toUpperCase();
        const quoteNo = q.quotationNo?.toString()?.trim()?.toUpperCase();

        if (oppId) {
          oppMap[oppId] = (oppMap[oppId] || 0) + amount;
        }
        if (quoteNo) {
          quoteMap[quoteNo] = (quoteMap[quoteNo] || 0) + amount;
        }
      }
    });

    return { paymentsByOpp: oppMap, paymentsByQuote: quoteMap };
  }, [quotations]);

  const getProjectRevenue = (project) => {
    const oppId = project.opportunityId?.toString()?.trim()?.toUpperCase();
    if (oppId && paymentsByOpp[oppId] !== undefined) {
      return paymentsByOpp[oppId];
    }
    const quoteNo = project.quotationNumber?.toString()?.trim()?.toUpperCase();
    if (quoteNo && paymentsByQuote[quoteNo] !== undefined) {
      return paymentsByQuote[quoteNo];
    }
    return 0;
  };

  /* ================= FILTER OPTIONS ================= */
  const clientOptions = useMemo(
    () => [...new Set(projects.map((p) => p.clientName).filter(Boolean))],
    [projects]
  );

  const typeOptions = useMemo(
    () => [...new Set(projects.map((p) => p.projectType).filter(Boolean))],
    [projects]
  );

  const labOptions = useMemo(() => {
    const labs = new Set();
    projects.forEach((p) => {
      if (!p.labNames) return;

      let labArray = [];
      if (Array.isArray(p.labNames)) {
        labArray = p.labNames;
      } else if (typeof p.labNames === "string") {
        try {
          const parsed = JSON.parse(p.labNames);
          labArray = Array.isArray(parsed) ? parsed : [p.labNames];
        } catch {
          labArray = p.labNames.split(",").map((l) => l.trim());
        }
      }
      labArray.forEach((l) => {
        if (l && typeof l === "string") labs.add(l.trim());
      });
    });
    return Array.from(labs);
  }, [projects]);

  /* ================= FILTERED DATA ================= */
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClient =
        !selectedClient || p.clientName === selectedClient;

      const matchesType =
        !selectedType || p.projectType === selectedType;

      const matchesLabs =
        selectedLabs.length === 0 ||
        selectedLabs.some((lab) => {
          if (Array.isArray(p.labNames)) {
            return p.labNames.includes(lab);
          }
          if (typeof p.labNames === "string") {
            try {
              const parsed = JSON.parse(p.labNames);
              return Array.isArray(parsed)
                ? parsed.includes(lab)
                : p.labNames === lab;
            } catch {
              return p.labNames.split(",").map((l) => l.trim()).includes(lab);
            }
          }
          return false;
        });

      return matchesSearch && matchesClient && matchesType && matchesLabs;
    });
  }, [projects, searchTerm, selectedClient, selectedType, selectedLabs]);

  /* ================= TOTAL REVENUE ================= */
  const totalRevenue = useMemo(() => {
    return filteredProjects.reduce((sum, p) => sum + getProjectRevenue(p), 0);
  }, [filteredProjects, paymentsByOpp, paymentsByQuote]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedClient("");
    setSelectedType("");
    setSelectedLabs([]);
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toISOString().split("T")[0];
  };

  const totalPages = Math.ceil(filteredProjects.length / ROWS_PER_PAGE);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredProjects.slice(start, start + ROWS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const loading = projectsLoading || quotationsLoading;

  /* ================= MULTI-SELECT CHIPS COMPONENT ================= */
  function MultiSelectChips({
    options,
    value,
    onChange,
    placeholder = "Select labs...",
  }) {
    const [open, setOpen] = useState(false);

    const toggle = (lab) => {
      if (value.includes(lab)) {
        onChange(value.filter((v) => v !== lab));
      } else {
        onChange([...value, lab]);
      }
    };

    const remove = (lab) => {
      onChange(value.filter((v) => v !== lab));
    };

    return (
      <div className="multi-select">
        <div className="multi-select-input" onClick={() => setOpen(!open)}>
          {value.length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            <div className="chips">
              {value.map((lab) => (
                <span className="chip" key={lab}>
                  {lab}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(lab);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <span className="arrow">▾</span>
        </div>

        {open && (
          <div className="multi-select-dropdown">
            {options.map((lab) => (
              <div
                key={lab}
                className={`option ${value.includes(lab) ? "selected" : ""}`}
                onClick={() => toggle(lab)}
              >
                {lab}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ceo-quotations">
      <ToastContainer autoClose={1200} />

      <div className="page-header">
        <div>
          <h2>Projects Overview</h2>
          <p>High-level visibility of all projects</p>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search project or client..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          value={selectedClient}
          onChange={(e) => {
            setSelectedClient(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Clients</option>
          {clientOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Project Types</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Multi-select for Labs */}
        <MultiSelectChips
          options={labOptions}
          value={selectedLabs}
          onChange={setSelectedLabs}
          placeholder="Select labs..."
        />

        {(searchTerm || selectedClient || selectedType || selectedLabs.length > 0) && (
          <button className="clear-btn" onClick={clearFilters}>
            Clear
          </button>
        )}

        {/* ================= TOTAL REVENUE CARD ================= */}
        <div className="lab-cards">
          <div className="lab-card total-revenue">
            <h4>Total Revenue</h4>
            <p>₹{totalRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-card">
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">No projects found</div>
        ) : (
          <>
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client Name</th>
                  <th>Client Type</th>
                  <th>Project Type</th>
                  <th>Project Status</th>
                  <th>Labs</th>
                  <th>Work Category</th>
                  <th>Revenue</th>
                  <th>Start</th>
                  <th>End</th>
                </tr>
              </thead>

              <tbody>
                {paginatedProjects.map((p) => {
                  const rev = getProjectRevenue(p);
                  return (
                    <tr key={p.id}>
                      <td>{p.projectName}</td>
                      <td>{p.clientName}</td>
                      <td>
                        <span className="pill pill-client">
                          {p.clientType || "—"}
                        </span>
                      </td>
                      <td>
                        <span className={`type-badge ${p.projectType?.toLowerCase()}`}>
                          {p.projectType}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${followupStatuses[p.id]
                            ?.toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {followupStatuses[p.id] || "Planned"}
                        </span>
                      </td>
                      <td>
                        {Array.isArray(p.labNames)
                          ? p.labNames.join(", ")
                          : p.labNames || "—"}
                      </td>
                      <td>{p.workCategory || "—"}</td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{rev.toLocaleString("en-IN")}
                      </td>
                      <td>{formatDate(p.startDate)}</td>
                      <td>{formatDate(p.endDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={currentPage === page ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
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
          </>
        )}
      </div>
    </div>
  );
}