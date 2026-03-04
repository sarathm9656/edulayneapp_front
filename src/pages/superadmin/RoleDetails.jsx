import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PERMISSION_GROUPS } from "../../config/permissions";

const RoleDetails = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/roles/${roleId}`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setRole(res.data.data);
        } else {
          toast.error(res.data?.message || "Failed to fetch role");
          navigate("/superadmin/roles");
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch role");
        navigate("/superadmin/roles");
      } finally {
        setLoading(false);
      }
    };

    if (roleId) fetchRole();
  }, [navigate, roleId]);

  const permissionsSet = useMemo(() => {
    return new Set(role?.permissions || []);
  }, [role?.permissions]);

  const selectedByGroup = useMemo(() => {
    return PERMISSION_GROUPS.map((g) => ({
      name: g.name,
      selected: g.permissions.filter((p) => permissionsSet.has(p.key)),
      total: g.permissions.length,
    }));
  }, [permissionsSet]);

  if (loading) {
    return (
      <main className="container-wrapper-scroll">
        <div className="sa-card p-4">
          <div className="d-flex align-items-center gap-2">
            <div className="spinner-border text-primary" role="status" aria-label="Loading" />
            <div className="text-muted">Loading role…</div>
          </div>
        </div>
      </main>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <main className="container-wrapper-scroll">
      <div className="container-fluid">
        <div className="sa-card p-3 p-md-4 mb-3">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h5 className="fw-bold mb-0">{role.name}</h5>
                <span className="badge text-bg-light border">{(role.permissions || []).length} permissions</span>
              </div>
              <div className="text-muted mt-2">{role.description || "—"}</div>
              <div className="small text-muted mt-2">
                Created: {role.createdAt ? new Date(role.createdAt).toLocaleString() : "—"} • Updated:{" "}
                {role.updatedAt ? new Date(role.updatedAt).toLocaleString() : "—"}
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Link to="/superadmin/roles" className="btn btn-outline-secondary">
                <i className="fa-solid fa-arrow-left me-2" />
                Roles
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/superadmin/roles/${role._id}/edit`)}
              >
                <i className="fa-solid fa-pen-to-square me-2" />
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-5">
            <div className="sa-card p-3 p-md-4 h-100">
              <h6 className="fw-bold mb-3">Permission Summary</h6>
              <div className="d-grid gap-2">
                {selectedByGroup.map((g) => (
                  <div
                    key={g.name}
                    className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-white"
                  >
                    <div className="fw-semibold">{g.name}</div>
                    <div className="text-muted small">
                      {g.selected.length} / {g.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="sa-card p-3 p-md-4 h-100">
              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                <h6 className="fw-bold mb-0">Permissions</h6>
                <div className="small text-muted">
                  Showing configured permission keys (based on current UI catalog)
                </div>
              </div>

              <div className="mt-3 d-grid gap-3">
                {selectedByGroup.map((g) => (
                  <div key={g.name} className="border rounded-3 p-3 bg-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="fw-semibold">{g.name}</div>
                      <span className="badge text-bg-light border">
                        {g.selected.length} selected
                      </span>
                    </div>

                    {g.selected.length > 0 ? (
                      <div className="mt-2 d-flex flex-wrap gap-2">
                        {g.selected.map((p) => (
                          <span key={p.key} className="badge rounded-pill text-bg-light border">
                            <i className="fa-solid fa-check me-1 text-success" />
                            {p.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-muted small">No permissions selected.</div>
                    )}
                  </div>
                ))}
              </div>

              {(role.permissions || []).length > 0 && (
                <div className="mt-3 small text-muted">
                  Raw keys: {(role.permissions || []).join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="footer-wrapper">
          <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </section>
      </div>
    </main>
  );
};

export default RoleDetails;

