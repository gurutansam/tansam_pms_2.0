import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Ceocss/Ceoquotation.css";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiArrowUp,
  FiArrowDown,
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiRotateCcw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { getQuotations } from "../../services/quotation/quotation.api";

export default function CeoQuotation() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'quotation' | 'payment'
  const [activeTab, setActiveTab] = useState("quotation");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedClientType, setSelectedClientType] = useState("");
  const [selectedLab, setSelectedLab] = useState("");

  // Sorting
  const [sortKey, setSortKey] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    (async () => {
      try {
        const data = await getQuotations();
        setQuotations(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load quotation data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedClient, selectedClientType, selectedLab, itemsPerPage]);

  /* ================= HELPER: QUOTATION TOTAL ================= */
  const computeQuotationTotal = (q) => {
    try {
      const items =
        typeof q.itemDetails === "string"
          ? JSON.parse(q.itemDetails || "[]")
          : q.itemDetails || [];
      return items.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
      );
    } catch {
      return 0;
    }
  };

  /* ================= FILTER OPTIONS ================= */
  const clientOptions = useMemo(() => {
    return [...new Set(quotations.map((q) => q.clientName).filter(Boolean))].sort();
  }, [quotations]);

  const clientTypeOptions = useMemo(() => {
    return [
      ...new Set(quotations.map((q) => q.client_type_name).filter(Boolean)),
    ].sort();
  }, [quotations]);

  const labOptions = useMemo(() => {
    return [...new Set(quotations.map((q) => q.lab_name).filter(Boolean))].sort();
  }, [quotations]);

  /* ================= OVERALL KPI METRICS ================= */
  const kpiMetrics = useMemo(() => {
    let totalValue = 0;
    let totalReceived = 0;

    quotations.forEach((q) => {
      totalValue += computeQuotationTotal(q);
      totalReceived += Number(q.paymentAmount) || 0;
    });

    const pendingBalance = Math.max(0, totalValue - totalReceived);
    const collectionRate =
      totalValue > 0 ? Math.round((totalReceived / totalValue) * 100) : 0;

    return {
      totalCount: quotations.length,
      totalValue,
      totalReceived,
      pendingBalance,
      collectionRate,
    };
  }, [quotations]);

  /* ================= FILTER & SORT DATA ================= */
  const processedData = useMemo(() => {
    // 1. Filter
    const query = searchQuery.trim().toLowerCase();
    const filtered = quotations.filter((q) => {
      const oppName = (q.opportunity_name || q.opprtunity_name || "").toLowerCase();
      const client = (q.clientName || "").toLowerCase();
      const quoteNo = (q.quotationNo || "").toLowerCase();
      const lab = (q.lab_name || "").toLowerCase();
      const workCat = (q.work_category_name || "").toLowerCase();

      const matchesSearch =
        !query ||
        oppName.includes(query) ||
        client.includes(query) ||
        quoteNo.includes(query) ||
        lab.includes(query) ||
        workCat.includes(query);

      const matchesClient = !selectedClient || q.clientName === selectedClient;
      const matchesClientType =
        !selectedClientType || q.client_type_name === selectedClientType;
      const matchesLab = !selectedLab || q.lab_name === selectedLab;

      return matchesSearch && matchesClient && matchesClientType && matchesLab;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (sortKey === "opportunity_name") {
        aVal = (a.opportunity_name || a.opprtunity_name || "").toLowerCase();
        bVal = (b.opportunity_name || b.opprtunity_name || "").toLowerCase();
      } else if (sortKey === "clientName") {
        aVal = (a.clientName || "").toLowerCase();
        bVal = (b.clientName || "").toLowerCase();
      } else if (sortKey === "quotationValue") {
        aVal = computeQuotationTotal(a);
        bVal = computeQuotationTotal(b);
      } else if (sortKey === "paymentAmount") {
        aVal = Number(a.paymentAmount) || 0;
        bVal = Number(b.paymentAmount) || 0;
      } else if (sortKey === "id") {
        aVal = Number(a.id) || 0;
        bVal = Number(b.id) || 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    quotations,
    searchQuery,
    selectedClient,
    selectedClientType,
    selectedLab,
    sortKey,
    sortDirection,
  ]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedClient("");
    setSelectedClientType("");
    setSelectedLab("");
    setSortKey("id");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedClient || selectedClientType || selectedLab
  );

  const renderSortArrow = (key) => {
    if (sortKey !== key) {
      return <span className="sort-icon-neutral">⇅</span>;
    }
    return sortDirection === "asc" ? (
      <FiArrowUp className="sort-icon active" />
    ) : (
      <FiArrowDown className="sort-icon active" />
    );
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="ceo-quotations-page">
      <ToastContainer autoClose={1200} position="top-right" />

      {/* ================= PAGE HEADER ================= */}
      <div className="ceo-page-header">
        <div className="header-info">
          <div className="header-badge">Executive View</div>
          <h2>Quotations & Financial Overview</h2>
          <p>
            Track proposal values, customer commitments, payment phases, and cash
            collections in real-time.
          </p>
        </div>
      </div>

      {/* ================= KPI SUMMARY METRICS ================= */}
      <div className="ceo-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box kpi-teal">
            <FiFileText />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Quotations</span>
            <div className="kpi-number">{kpiMetrics.totalCount}</div>
            <span className="kpi-subtext">Issued customer proposals</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box kpi-petrol">
            <FiDollarSign />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Quotation Value</span>
            <div className="kpi-number">₹ {formatCurrency(kpiMetrics.totalValue)}</div>
            <span className="kpi-subtext">Overall proposal pipeline</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box kpi-green">
            <FiCheckCircle />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Collections Received</span>
            <div className="kpi-number">
              ₹ {formatCurrency(kpiMetrics.totalReceived)}
            </div>
            <span className="kpi-subtext">
              {kpiMetrics.collectionRate}% of total quotation value
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box kpi-amber">
            <FiClock />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Outstanding Balance</span>
            <div className="kpi-number">
              ₹ {formatCurrency(kpiMetrics.pendingBalance)}
            </div>
            <span className="kpi-subtext">Pending milestone collections</span>
          </div>
        </div>
      </div>

      {/* ================= SEGMENTED TABS ================= */}
      <div className="ceo-tabs-wrapper">
        <div className="ceo-segmented-tabs">
          <button
            type="button"
            className={`ceo-tab-btn ${activeTab === "quotation" ? "active" : ""}`}
            onClick={() => setActiveTab("quotation")}
          >
            <FiFileText className="tab-icon" />
            <span>Quotation Pipeline</span>
            <span className="tab-pill-count">{quotations.length}</span>
          </button>

          <button
            type="button"
            className={`ceo-tab-btn ${activeTab === "payment" ? "active" : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            <FiCheckCircle className="tab-icon" />
            <span>Payment Phases & Collections</span>
            <span className="tab-pill-count">{quotations.length}</span>
          </button>
        </div>
      </div>

      {/* ================= FILTER & SORT TOOLBAR ================= */}
      <div className="ceo-filter-card">
        <div className="filter-top-row">
          {/* Search Box */}
          <div className="ceo-search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search opportunity, client, quote #, or lab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Client Filter */}
          <div className="ceo-select-box">
            <FiFilter className="select-icon" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">All Clients ({clientOptions.length})</option>
              {clientOptions.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          {/* Client Type Filter */}
          <div className="ceo-select-box">
            <select
              value={selectedClientType}
              onChange={(e) => setSelectedClientType(e.target.value)}
            >
              <option value="">All Client Types</option>
              {clientTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Lab Filter */}
          <div className="ceo-select-box">
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
            >
              <option value="">All Labs</option>
              {labOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="ceo-clear-filters-btn"
              onClick={clearFilters}
              title="Reset all filters"
            >
              <FiRotateCcw /> Reset Filters
            </button>
          )}
        </div>

        <div className="filter-bottom-row">
          <div className="results-summary">
            Showing <strong>{processedData.length}</strong> matching{" "}
            {processedData.length === 1 ? "record" : "records"}
            {hasActiveFilters && " (filtered)"}
          </div>

          <div className="table-controls-right">
            {/* Sort Dropdown */}
            <div className="sort-dropdown-box">
              <label>Sort by:</label>
              <select
                value={`${sortKey}_${sortDirection}`}
                onChange={(e) => {
                  const [k, dir] = e.target.value.split("_");
                  setSortKey(k);
                  setSortDirection(dir);
                }}
              >
                <option value="id_desc">Newest First</option>
                <option value="id_asc">Oldest First</option>
                <option value="clientName_asc">Client Name (A → Z)</option>
                <option value="clientName_desc">Client Name (Z → A)</option>
                <option value="opportunity_name_asc">Opportunity (A → Z)</option>
                <option value="opportunity_name_desc">Opportunity (Z → A)</option>
                <option value="quotationValue_desc">Value: High to Low</option>
                <option value="quotationValue_asc">Value: Low to High</option>
                <option value="paymentAmount_desc">Payment: High to Low</option>
              </select>
            </div>

            {/* Page size selector */}
            <div className="page-size-selector">
              <label>Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DATA TABLE CARD ================= */}
      <div className="ceo-table-card">
        {loading ? (
          <div className="ceo-table-loading">
            <div className="loading-spinner" />
            <p>Loading quotation records...</p>
          </div>
        ) : (
          <div className="table-scroll-container">
            <table className="ceo-custom-table">
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center" }}>S.No</th>

                  <th
                    className="sortable-header"
                    onClick={() => handleSort("clientName")}
                  >
                    Client Details {renderSortArrow("clientName")}
                  </th>

                  <th>Client Type</th>

                  {activeTab === "quotation" ? (
                    <>
                      <th
                        className="sortable-header"
                        onClick={() => handleSort("opportunity_name")}
                      >
                        Opportunity Name {renderSortArrow("opportunity_name")}
                      </th>
                      <th>Work Category</th>
                      <th>Lab Assigned</th>
                      <th
                        className="sortable-header text-right"
                        onClick={() => handleSort("quotationValue")}
                        style={{ textAlign: "right" }}
                      >
                        Quotation Value {renderSortArrow("quotationValue")}
                      </th>
                    </>
                  ) : (
                    <>
                      <th>Work Category</th>
                      <th>Lab</th>
                      <th>Payment Phase</th>
                      <th
                        className="sortable-header text-right"
                        onClick={() => handleSort("paymentAmount")}
                        style={{ textAlign: "right" }}
                      >
                        Payment Collected {renderSortArrow("paymentAmount")}
                      </th>
                      <th>Pending Reason / Remarks</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((q, idx) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                    const totalVal = computeQuotationTotal(q);
                    const oppName = q.opportunity_name || q.opprtunity_name || "—";
                    const paymentPhase = q.paymentPhase || "Not Started";

                    return (
                      <tr key={q.id || idx}>
                        <td className="col-sno">{rowNumber}</td>

                        <td className="col-client">
                          <div className="client-name-cell">
                            <span className="client-primary">{q.clientName || "—"}</span>
                            {q.quotationNo && (
                              <span className="quote-number-pill">
                                Quote #{q.quotationNo}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="badge-client-type">
                            {q.client_type_name || "Standard"}
                          </span>
                        </td>

                        {activeTab === "quotation" ? (
                          <>
                            <td className="col-opp">
                              <span className="opp-text" title={oppName}>
                                {oppName}
                              </span>
                            </td>

                            <td>
                              <span className="badge-work-cat">
                                {q.work_category_name || "General"}
                              </span>
                            </td>

                            <td>
                              <span className="badge-lab">
                                {q.lab_name || "Unassigned"}
                              </span>
                            </td>

                            <td className="col-amount text-right">
                              <span className="currency-symbol">₹</span>{" "}
                              <span className="amount-highlight">
                                {formatCurrency(totalVal)}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <span className="badge-work-cat">
                                {q.work_category_name || "General"}
                              </span>
                            </td>

                            <td>
                              <span className="badge-lab">
                                {q.lab_name || "Unassigned"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`badge-phase phase-${paymentPhase
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}`}
                              >
                                {paymentPhase}
                              </span>
                            </td>

                            <td className="col-amount text-right">
                              {q.paymentAmount && Number(q.paymentAmount) > 0 ? (
                                <>
                                  <span className="currency-symbol">₹</span>{" "}
                                  <span className="amount-received">
                                    {formatCurrency(q.paymentAmount)}
                                  </span>
                                </>
                              ) : (
                                <span className="amount-zero">—</span>
                              )}
                            </td>

                            <td className="col-remarks">
                              <span
                                className="remarks-text"
                                title={q.paymentPendingReason || "No pending remarks"}
                              >
                                {q.paymentPendingReason || "—"}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={activeTab === "quotation" ? 7 : 8}
                      className="empty-table-cell"
                    >
                      <div className="empty-table-state">
                        <FiFileText className="empty-icon" />
                        <h4>No Quotations Found</h4>
                        <p>
                          No records match your selected filter criteria. Try
                          clearing search or changing filters.
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            className="empty-clear-btn"
                            onClick={clearFilters}
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= PAGINATION BAR ================= */}
        {!loading && processedData.length > 0 && (
          <div className="ceo-pagination-footer">
            <div className="pagination-info">
              Showing{" "}
              <strong>
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  processedData.length
                )}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(currentPage * itemsPerPage, processedData.length)}
              </strong>{" "}
              of <strong>{processedData.length}</strong> items
            </div>

            <div className="pagination-buttons">
              <button
                type="button"
                className="page-nav-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <FiChevronLeft /> Previous
              </button>

              <div className="page-numbers-row">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .reduce((acc, page, idx, arr) => {
                    if (idx > 0 && page - arr[idx - 1] > 1) {
                      acc.push("...");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, index) => {
                    if (item === "...") {
                      return (
                        <span key={`ellipsis-${index}`} className="page-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={`page-${item}`}
                        type="button"
                        className={`page-num-btn ${
                          currentPage === item ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(item)}
                      >
                        {item}
                      </button>
                    );
                  })}
              </div>

              <button
                type="button"
                className="page-nav-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
