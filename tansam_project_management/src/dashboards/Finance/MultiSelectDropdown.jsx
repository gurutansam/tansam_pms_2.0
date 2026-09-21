import { useState, useEffect, useRef } from "react";
import "./CSS/multiSelect.css";

const MultiSelectDropdown = ({
  label,
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Select options",
  displayKey = "label",
  valueKey = "value",
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleValue = (value) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    onChange(updated);
  };

  return (
    <div className="multi-select" ref={dropdownRef}>
      {label && <label>{label}</label>}

      <div
        className={`dropdown-header ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="dropdown-header-text">
          {selectedValues.length > 0 ? selectedValues.join(", ") : placeholder}
        </span>
        <span className="dropdown-arrow">▾</span>
      </div>

      {open && (
        <div className="dropdown-list">
          {options.length === 0 ? (
            <div className="dropdown-empty">No options</div>
          ) : (
            options.map((opt, index) => (
              <label key={index} className="dropdown-item">
                <input
                  type="checkbox"
                  value={opt[valueKey]}
                  checked={selectedValues.includes(opt[valueKey])}
                  onChange={() => toggleValue(opt[valueKey])}
                />
                {opt[displayKey]}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;