
import { useNavigate } from "react-router-dom";
import "../../layouts/CSS/quotationDocument.css";

export default function QuotationDocument({ quotation, onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    navigate("/finance");
  };

  return (
    <div className="quotation-wrapper">
      <button className="btn-back" onClick={handleBack}>← Back to Finance</button>

      <div className="quotation-paper">
        {/* HEADER */}
        <div className="qd-header">
          <img src="/tn-logo.png" className="logo-left" />
          <div className="qd-title">
            <h2>Tamil Nadu Smart and Advanced Manufacturing Centre</h2>
            <p>(A Government of Tamil Nadu Enterprise wholly owned by TIDCO)</p>
          </div>
          <img src="/tidco-logo.png" className="logo-right" />
        </div>

        <hr />

        {/* META */}
        <div className="qd-meta">
          <div>
            <p><b>REF:</b> {quotation.quotationNo}</p>
            <p><b>To:</b> {quotation.clientName}</p>
          </div>
          <div>
            <p><b>Date:</b> {quotation.date}</p>
          </div>
        </div>

        {/* SUBJECT */}
        <p className="qd-subject">
          <b>Sub:</b> Quotation for {quotation.project_name}
        </p>

        {/* BODY */}
        <p className="qd-body">
          We thank you for your inquiry. With reference to the same, we are pleased
          to submit our most competitive price as below.
        </p>

        {/* TABLE */}
        <table className="qd-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total Price (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{quotation.description}</td>
              <td>1</td>
              <td>₹ {quotation.value}</td>
              <td>₹ {quotation.value}</td>
            </tr>
          </tbody>
        </table>

        {/* TERMS */}
        <div className="qd-terms">
          <h4>Terms & Conditions</h4>
          <ol>
            <li>Validity: 15 days</li>
            <li>Payment: 100% advance</li>
            <li>Delivery: 15 days</li>
            <li>PO to be submitted within 5 days</li>
          </ol>
        </div>

        {/* FOOTER */}
        <div className="qd-footer">
          <p>Yours truly,</p>
          <p><b>Manager – Operations</b></p>
        </div>
      </div>
    </div>
  );
}
