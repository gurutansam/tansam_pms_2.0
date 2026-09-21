import { useEffect, useState, useMemo, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiSearch,
  FiX,
  FiRotateCcw,
  FiFolder,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";
import "./Ceocss/Ceoprojects.css";

import { fetchProjects } from "../../services/project.api";
import { fetchProjectFollowups } from "../../services/projectFollowup.api";
import { getQuotations } from "../../services/quotation/quotation.api";

const ROWS_PER_PAGE = 10;

/* ================= MULTI-SELECT CHIPS COMPONENT ================= */
function MultiSelectChips({
  options,
  value,
  onChange,
  placeholder = "Select labs...",
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
    <div className="multi-select" ref={containerRef}>
      <div
        className={`multi-select-input ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
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
                  title="Remove"
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
          {options.length === 0 ? (
            <div className="option" style={{ color: "#94a3b8" }}>
              No labs available
            </div>
          ) : (
            options.map((lab) => (
              <div
                key={lab}
                className={`option ${value.includes(lab) ? "selected" : ""}`}
                onClick={() => toggle(lab)}
              >
                <span>{lab}</span>
                {value.includes(lab) && <span>✓</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

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
  const [selectedLabs, setSelectedLabs] = useState([]);
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
            statuses[project.id] = project.status || "Planned";
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

  /* ================= KPI METRICS ================= */
  const totalRevenue = useMemo(() => {
    return filteredProjects.reduce((sum, p) => sum + getProjectRevenue(p), 0);
  }, [filteredProjects, paymentsByOpp, paymentsByQuote]);

  const inProgressCount = useMemo(() => {
    return filteredProjects.filter((p) => {
      const status = (followupStatuses[p.id] || p.status || "").toLowerCase();
      return (
        status === "in progress" ||
        status === "in-progress" ||
        status === "active"
      );
    }).length;
  }, [filteredProjects, followupStatuses]);

  const completedCount = useMemo(() => {
    return filteredProjects.filter((p) => {
      const status = (followupStatuses[p.id] || p.status || "").toLowerCase();
      return status === "completed" || status === "closed";
    }).length;
  }, [filteredProjects, followupStatuses]);

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

  const parseLabsList = (labNames) => {
    if (!labNames) return [];
    if (Array.isArray(labNames)) return labNames;
    if (typeof labNames === "string") {
      try {
        const parsed = JSON.parse(labNames);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return labNames.split(",").map((l) => l.trim()).filter(Boolean);
      }
      return [labNames];
    }
    return [];
  };

  const totalPages = Math.ceil(filteredProjects.length / ROWS_PER_PAGE);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredProjects.slice(start, start + ROWS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const loading = projectsLoading || quotationsLoading;

  const hasActiveFilters = Boolean(
    searchTerm || selectedClient || selectedType || selectedLabs.length > 0
  );

  return (
    <div className="ceo-projects-page">
      <ToastContainer autoClose={1200} />

      {/* ================= PAGE HEADER ================= */}
      <div className="ceo-page-header">
        <div className="header-info">
          <span className="header-badge">Executive Overview</span>
          <h2>Projects Overview</h2>
          <p>
            High-level visibility, revenue tracking, and status breakdown across all company projects.
          </p>
        </div>
      </div>

      {/* ================= KPI METRIC CARDS ================= */}
      <div className="ceo-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box kpi-teal">
            <FiFolder />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Projects</span>
            <span className="kpi-number">{filteredProjects.length}</span>
            <span className="kpi-subtext">Filtered count</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box kpi-blue">
            <FiClock />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">In Progress</span>
            <span className="kpi-number">{inProgressCount}</span>
            <span className="kpi-subtext">Active execution</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box kpi-green">
            <FiCheckCircle />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Completed</span>
            <span className="kpi-number">{completedCount}</span>
            <span className="kpi-subtext">Delivered & closed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box kpi-amber">
            <FiDollarSign />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Revenue</span>
            <span className="kpi-number">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
            <span className="kpi-subtext">Paid against projects</span>
          </div>
        </div>
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="ceo-filter-card">
        <div className="filter-row">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search project name, client..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="filter-select"
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
            className="filter-select"
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
            onChange={(val) => {
              setSelectedLabs(val);
              setCurrentPage(1);
            }}
            placeholder="Filter by labs..."
          />

          {hasActiveFilters && (
            <button className="clear-btn" onClick={clearFilters} title="Reset filters">
              <FiRotateCcw />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="filter-summary">
          <span className="filter-count">
            Showing <strong>{filteredProjects.length}</strong> of{" "}
            <strong>{projects.length}</strong> projects
          </span>
          {hasActiveFilters && (
            <span>Filtered results active</span>
          )}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-card">
        {loading ? (
          <div className="loading-box">
            <div className="loading-spinner"></div>
            <span>Loading projects data...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found matching the filter criteria.</p>
            {hasActiveFilters && (
              <button
                className="clear-btn"
                style={{ margin: "12px auto 0" }}
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Client Name</th>
                    <th>Client Type</th>
                    <th>Project Type</th>
                    <th>Status</th>
                    <th>Labs</th>
                    <th>Work Category</th>
                    <th>Revenue</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedProjects.map((p) => {
                    const rev = getProjectRevenue(p);
                    const statusVal =
                      followupStatuses[p.id] || p.status || "Planned";
                    const statusClass = statusVal
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    const typeClass = (p.projectType || "")
                      .toLowerCase()
                      .replace(/\s+/g, "_");
                    const labsList = parseLabsList(p.labNames);

                    return (
                      <tr key={p.id}>
                        <td className="project-name-cell">{p.projectName}</td>
                        <td className="client-name-cell">{p.clientName}</td>
                        <td>
                          <span className="pill-client">
                            {p.clientType || "—"}
                          </span>
                        </td>
                        <td>
                          <span className={`type-badge ${typeClass}`}>
                            {p.projectType}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            <span className="badge-dot"></span>
                            <span>{statusVal}</span>
                          </span>
                        </td>
                        <td>
                          {labsList.length > 0 ? (
                            labsList.map((lab) => (
                              <span key={lab} className="lab-pill-item">
                                {lab}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td>{p.workCategory || "—"}</td>
                        <td className="revenue-cell">
                          ₹{rev.toLocaleString("en-IN")}
                        </td>
                        <td className="date-cell">{formatDate(p.startDate)}</td>
                        <td className="date-cell">{formatDate(p.endDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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