import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PERMISSION_GROUPS } from '../../config/permissions';

const RoleForm = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!roleId);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    if (roleId) {
      fetchRole();
    }
  }, [roleId]);

  const fetchRole = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/roles/${roleId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        const role = response.data.data;
        setFormData({
          name: role.name,
          description: role.description,
          permissions: role.permissions || []
        });
      }
    } catch (error) {
      toast.error('Error fetching role details');
      navigate('/superadmin/roles');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionKey) => {
    setFormData(prev => {
      const permissions = prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...prev.permissions, permissionKey];
      
      return {
        ...prev,
        permissions
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = roleId
        ? `${import.meta.env.VITE_API_URL}/roles/${roleId}`
        : `${import.meta.env.VITE_API_URL}/roles`;
      
      const method = roleId ? 'put' : 'post';
      
      const response = await axios[method](
        url,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Role ${roleId ? 'updated' : 'created'} successfully`);
        const nextId = response.data?.data?._id || roleId;
        if (nextId) navigate(`/superadmin/roles/${nextId}`);
        else navigate('/superadmin/roles');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Error ${roleId ? 'updating' : 'creating'} role`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAllInGroup = (group, nextChecked) => {
    const keys = group.permissions.map((p) => p.key);
    setFormData((prev) => {
      const next = new Set(prev.permissions);
      if (nextChecked) keys.forEach((k) => next.add(k));
      else keys.forEach((k) => next.delete(k));
      return { ...prev, permissions: Array.from(next) };
    });
  };

  const isGroupFullySelected = (group) =>
    group.permissions.every((p) => formData.permissions.includes(p.key));

  return (
    <main className="container-wrapper-scroll">
      <div className="container-fluid">
        <div className="sa-card p-3 p-md-4">
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
            <div>
              <h5 className="fw-bold mb-1">{roleId ? 'Edit Role' : 'Create Role'}</h5>
              <div className="small text-muted">Define permissions for this role.</div>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => (roleId ? navigate(`/superadmin/roles/${roleId}`) : navigate('/superadmin/roles'))}
              >
                Cancel
              </button>
              <button type="submit" form="roleForm" disabled={loading || initialLoading} className="btn btn-primary">
                {loading ? 'Saving…' : roleId ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>

          {initialLoading ? (
            <div className="d-flex align-items-center gap-2 text-muted">
              <div className="spinner-border text-primary" role="status" aria-label="Loading" />
              <div>Loading role…</div>
            </div>
          ) : (
            <form id="roleForm" onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Role Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="e.g. tenant_admin"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="What can this role do?"
                  />
                </div>
              </div>

              <hr className="my-4" />

              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <h6 className="fw-bold mb-0">Permissions</h6>
                <div className="small text-muted">{formData.permissions.length} selected</div>
              </div>

              <div className="row g-3">
                {PERMISSION_GROUPS.map((group) => (
                  <div className="col-12" key={group.name}>
                    <div className="border rounded-3 p-3 bg-white">
                      <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-2">
                        <div className="fw-semibold">{group.name}</div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleAllInGroup(group, true)}
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleAllInGroup(group, false)}
                          >
                            Clear
                          </button>
                          <span className="badge text-bg-light border">
                            {group.permissions.filter((p) => formData.permissions.includes(p.key)).length} / {group.permissions.length}
                            {isGroupFullySelected(group) ? " • full" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="row g-2">
                        {group.permissions.map((permission) => (
                          <div className="col-md-6 col-lg-4" key={permission.key}>
                            <label className="d-flex align-items-center gap-2 border rounded-3 px-3 py-2 w-100 bg-light">
                              <input
                                type="checkbox"
                                className="form-check-input m-0"
                                checked={formData.permissions.includes(permission.key)}
                                onChange={() => handlePermissionChange(permission.key)}
                              />
                              <span className="small fw-semibold">{permission.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>

        <section className="footer-wrapper">
          <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </section>
      </div>
    </main>
  );
};

export default RoleForm; 
