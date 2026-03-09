import React from "react";

const valueOrDash = (value) => (value && String(value).trim() ? value : "—");

const TenantPlanDetails = () => {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL;
  const supportPhone = import.meta.env.VITE_SUPPORT_PHONE;
  const supportWhatsapp = import.meta.env.VITE_SUPPORT_WHATSAPP;
  const supportAddress = import.meta.env.VITE_SUPPORT_ADDRESS;

  return (
    <div className="modern-grid">
      <div
        className="modern-card"
        style={{
          gridColumn: "span 12",
          background: "linear-gradient(135deg, #0f172a 0%, #1f2937 100%)",
          color: "#fff",
          border: "none",
        }}
      >
        <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
          <div>
            <h2 className="mb-2 fw-bold">Contact</h2>
            <p className="mb-0" style={{ color: "rgba(255,255,255,0.8)" }}>
              For upgrading your plan, contact our team.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {supportEmail ? (
              <a
                className="btn btn-light rounded-pill fw-bold px-4"
                href={`mailto:${supportEmail}`}
              >
                Email Us
              </a>
            ) : (
              <button className="btn btn-light rounded-pill fw-bold px-4" disabled>
                Email Us
              </button>
            )}
            {supportPhone ? (
              <a
                className="btn btn-outline-light rounded-pill fw-bold px-4"
                href={`tel:${supportPhone}`}
              >
                Call
              </a>
            ) : (
              <button className="btn btn-outline-light rounded-pill fw-bold px-4" disabled>
                Call
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="modern-card" style={{ gridColumn: "span 6" }}>
        <div className="d-flex align-items-start gap-3">
          <div className="bg-primary bg-opacity-10 p-3 rounded-4">
            <i className="fa-regular fa-envelope text-primary fs-4"></i>
          </div>
          <div className="flex-grow-1">
            <div className="fw-bold mb-1">Email</div>
            <div className="text-muted">{valueOrDash(supportEmail)}</div>
          </div>
        </div>
      </div>

      <div className="modern-card" style={{ gridColumn: "span 6" }}>
        <div className="d-flex align-items-start gap-3">
          <div className="bg-success bg-opacity-10 p-3 rounded-4">
            <i className="fa-solid fa-phone text-success fs-4"></i>
          </div>
          <div className="flex-grow-1">
            <div className="fw-bold mb-1">Phone</div>
            <div className="text-muted">{valueOrDash(supportPhone)}</div>
          </div>
        </div>
      </div>

      <div className="modern-card" style={{ gridColumn: "span 6" }}>
        <div className="d-flex align-items-start gap-3">
          <div className="bg-success bg-opacity-10 p-3 rounded-4">
            <i className="fa-brands fa-whatsapp text-success fs-4"></i>
          </div>
          <div className="flex-grow-1">
            <div className="fw-bold mb-1">WhatsApp</div>
            <div className="text-muted">{valueOrDash(supportWhatsapp)}</div>
          </div>
        </div>
      </div>

      <div className="modern-card" style={{ gridColumn: "span 6" }}>
        <div className="d-flex align-items-start gap-3">
          <div className="bg-warning bg-opacity-10 p-3 rounded-4">
            <i className="fa-solid fa-location-dot text-warning fs-4"></i>
          </div>
          <div className="flex-grow-1">
            <div className="fw-bold mb-1">Address</div>
            <div className="text-muted">{valueOrDash(supportAddress)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantPlanDetails;
