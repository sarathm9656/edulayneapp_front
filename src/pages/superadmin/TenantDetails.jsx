import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteTenant,
  disableTenant,
  enableTenant,
  fetchCoursesByTenant,
  fetchTenantsWithCourseCountandUserCount,
} from "../../redux/super.admin.slice";
import EditTenantModal from "../../components/super-admin/EditTenantModal.jsx";

const TenantDetails = () => {
  const { tenantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { tenantDetails, coursesByTenant } = useSelector(
    (state) => state.superAdmin
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTenantsWithCourseCountandUserCount());
  }, [dispatch]);

  useEffect(() => {
    if (tenantId) dispatch(fetchCoursesByTenant(tenantId));
  }, [dispatch, tenantId]);

  const tenantEntry = useMemo(() => {
    return (tenantDetails || []).find((t) => t?.tenant?._id === tenantId) || null;
  }, [tenantDetails, tenantId]);

  const tenantName = tenantEntry?.tenant?.name || "Tenant";
  const isActive = !!tenantEntry?.tenant?.is_active;

  const onToggleStatus = async () => {
    if (!tenantEntry?.tenant?._id) return;
    try {
      if (isActive) await dispatch(disableTenant(tenantEntry.tenant._id)).unwrap();
      else await dispatch(enableTenant(tenantEntry.tenant._id)).unwrap();
    } catch {
      // errors are surfaced via thunk/toasts
    }
  };

  const onDeleteConfirm = async () => {
    if (!tenantEntry?.tenant?._id) return;
    try {
      await dispatch(deleteTenant(tenantEntry.tenant._id)).unwrap();
      setIsDeleteModalOpen(false);
      navigate("/superadmin/tenants");
    } catch {
      // errors are surfaced via thunk/toasts
    }
  };

  if (!tenantEntry) {
    return (
      <main className="container-wrapper-scroll">
        <div className="sa-card p-4">
          <div className="d-flex justify-content-between align-items-center gap-2">
            <div>
              <div className="fw-bold">Tenant not found</div>
              <div className="small text-muted">
                This tenant may have been deleted or you don’t have access.
              </div>
            </div>
            <Link to="/superadmin/tenants" className="btn btn-outline-primary">
              Back to tenants
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container-wrapper-scroll">
        <div className="container-fluid">
          <div className="sa-card p-3 p-md-4 mb-3">
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h5 className="fw-bold mb-0">{tenantName}</h5>
                  <span className={`sa-badge ${isActive ? "success" : "danger"}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="small text-muted mt-1">
                  Subdomain: <span className="fw-semibold">{tenantEntry?.tenant?.subdomain || "—"}</span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/superadmin/tenants" className="btn btn-outline-secondary">
                  <i className="fa-solid fa-arrow-left me-2"></i>
                  Tenants
                </Link>
                <button
                  className={`btn ${isActive ? "btn-outline-warning" : "btn-outline-success"}`}
                  onClick={onToggleStatus}
                  type="button"
                >
                  <i className={`fa-solid ${isActive ? "fa-ban" : "fa-circle-check"} me-2`}></i>
                  {isActive ? "Disable" : "Enable"}
                </button>
                <button className="btn btn-outline-primary" onClick={() => setIsEditModalOpen(true)} type="button">
                  <i className="fa-solid fa-pen-to-square me-2"></i>
                  Edit
                </button>
                <button className="btn btn-outline-danger" onClick={() => setIsDeleteModalOpen(true)} type="button">
                  <i className="fa-solid fa-trash-can me-2"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-4">
              <div className="sa-card p-3 p-md-4 h-100">
                <h6 className="fw-bold mb-3">Overview</h6>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="small text-muted">Courses</div>
                    <div className="fs-5 fw-bold">{tenantEntry?.courseCount ?? 0}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Users</div>
                    <div className="fs-5 fw-bold">{tenantEntry?.userCount ?? 0}</div>
                  </div>
                  <div className="col-12 mt-2">
                    <div className="small text-muted">Created</div>
                    <div className="fw-semibold">
                      {tenantEntry?.tenant?.createdAt
                        ? new Date(tenantEntry.tenant.createdAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>

                <hr className="my-3" />

                <h6 className="fw-bold mb-3">Admin Contact</h6>
                <div className="small text-muted">Name</div>
                <div className="fw-semibold mb-2">
                  {tenantEntry?.user?.fname || tenantEntry?.user?.lname
                    ? `${tenantEntry?.user?.fname || ""} ${tenantEntry?.user?.lname || ""}`.trim()
                    : "—"}
                </div>
                <div className="small text-muted">Email</div>
                <div className="fw-semibold mb-2">{tenantEntry?.login?.email || "—"}</div>
                <div className="small text-muted">Phone</div>
                <div className="fw-semibold">{tenantEntry?.user?.phone_number || "—"}</div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="sa-card p-3 p-md-4 h-100">
                <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                  <h6 className="fw-bold mb-0">Courses</h6>
                </div>

                <div className="table-responsive mt-3">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th className="text-nowrap">Price</th>
                        <th className="text-nowrap">Enrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(coursesByTenant || []).length > 0 ? (
                        coursesByTenant.map((c) => (
                          <tr key={c._id}>
                            <td>
                              <div className="fw-semibold">{c.course_title || "Untitled"}</div>
                              <div className="small text-muted text-truncate" style={{ maxWidth: 560 }}>
                                {c.duration || "—"}
                              </div>
                            </td>
                            <td className="text-nowrap">
                              <span className="fw-semibold">
                                <i className="fa-solid fa-indian-rupee-sign me-1"></i>
                                {c.discounted_price ?? c.price ?? 0}
                              </span>
                            </td>
                            <td className="text-nowrap">
                              {Array.isArray(c.purchases) ? c.purchases.length : 0} / {c.max_enrollment ?? "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center text-muted py-4">
                            No courses found for this tenant.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <section className="footer-wrapper">
            <p>
              &copy; Copyright {new Date().getFullYear()} Edulayne. All rights
              reserved.
            </p>
          </section>
        </div>
      </main>

      {isEditModalOpen && (
        <EditTenantModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editingTenant={tenantEntry}
          onUpdate={() => setIsEditModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1040,
            }}
            onClick={() => setIsDeleteModalOpen(false)}
          />

          <div
            className="modal fade show d-block"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1050,
              overflow: "auto",
            }}
            tabIndex="-1"
            role="dialog"
            aria-labelledby="deleteTenantModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger" id="deleteTenantModalLabel">
                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                    Confirm Delete
                  </h5>
                </div>

                <div className="modal-body">
                  <div className="alert alert-warning" role="alert">
                    You are about to delete <strong>{tenantName}</strong>. This action cannot be undone.
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={onDeleteConfirm}>
                    Delete Tenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TenantDetails;
