import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PERMISSION_GROUPS } from "../../config/permissions";

const RolesList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/roles`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      toast.error("Error fetching roles");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setRoleToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/roles/${roleToDelete._id}`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        toast.success("Role deleted successfully");
        fetchRoles();
        closeDeleteModal();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error deleting role";
      toast.error(errorMessage);
    }
  };

  const permissionLabelMap = (() => {
    const map = new Map();
    for (const g of PERMISSION_GROUPS) {
      for (const p of g.permissions) map.set(p.key, p.label);
    }
    return map;
  })();

  const getPermissionLabel = (permissionKey) =>
    permissionLabelMap.get(permissionKey) || permissionKey;

  const filteredRoles = roles.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      String(r?.name || "").toLowerCase().includes(q) ||
      String(r?.description || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <main className="container-wrapper-scroll">
        <div className="sa-card p-4">
          <div className="d-flex align-items-center gap-2">
            <div className="spinner-border text-primary" role="status" aria-label="Loading" />
            <div className="text-muted">Loading roles…</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-wrapper-scroll">
      <div className="container-fluid">
        <div className="sa-card p-3 p-md-4 mb-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h5 className="fw-bold mb-1">Roles</h5>
              <div className="small text-muted">
                {filteredRoles.length} shown • {roles.length} total
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  className="form-control"
                  placeholder="Search roles…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => navigate("/superadmin/roles/create")}
                className="btn btn-primary"
              >
                <i className="fa-solid fa-plus me-2"></i>
                Create Role
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive table-styles">
          <table className="table table-hover align-middle mb-0" style={{ minWidth: 900 }}>
            <thead className="table-light">
              <tr>
                <th className="text-nowrap">Name</th>
                <th>Description</th>
                <th className="text-nowrap">Permissions</th>
                <th className="text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <tr key={role._id}>
                    <td className="text-nowrap fw-semibold">{role.name}</td>
                    <td style={{ minWidth: 260 }}>{role.description || "—"}</td>
                    <td style={{ minWidth: 320 }}>
                      <div className="d-flex flex-wrap gap-2">
                        {(role.permissions || []).slice(0, 6).map((permission) => (
                          <span key={permission} className="badge rounded-pill text-bg-light border">
                            {getPermissionLabel(permission)}
                          </span>
                        ))}
                        {(role.permissions || []).length > 6 && (
                          <span className="badge rounded-pill text-bg-light border">
                            +{(role.permissions || []).length - 6} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-nowrap">
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/superadmin/roles/${role._id}`)}
                          title="View role"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/superadmin/roles/${role._id}/edit`)}
                          title="Edit role"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => openDeleteModal(role)}
                          title="Delete role"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <section className="footer-wrapper">
          <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
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
            onClick={closeDeleteModal}
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
            aria-labelledby="deleteRoleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger" id="deleteRoleModalLabel">
                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                    Delete Role
                  </h5>
                </div>

                <div className="modal-body">
                  <div className="alert alert-warning" role="alert">
                    Are you sure you want to delete <strong>{roleToDelete?.name}</strong>? This action cannot be undone.
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default RolesList;
