import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import { fetchTenantsWithCourseCountandUserCount } from "../../redux/super.admin.slice";

const EditTenantModal = ({ isOpen, onClose, editingTenant, onUpdate }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    name: "",
    subdomain: "",
    email: "",
    phone_number: "",
    tenantId: "",
  });
  const api_url = import.meta.env.VITE_API_URL;


  useEffect(() => {
    if (editingTenant) {
      const newFormData = {
        fname: editingTenant.user?.fname || "",
        lname: editingTenant.user?.lname || "",
        name: editingTenant.tenant?.name || "",
        subdomain: editingTenant.tenant?.subdomain || "",
        email: editingTenant.login?.email || "",
        phone_number: editingTenant.user?.phone_number || "",
        tenantId: editingTenant.tenant?._id || "",
      };
      setFormData(newFormData);
    }
  }, [editingTenant]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fname.trim()) {
      newErrors.fname = "First name is required";
    }

    if (!formData.lname.trim()) {
      newErrors.lname = "Last name is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = "Subdomain is required";
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = "Subdomain can only contain letters, numbers, and hyphens";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid 10-digit phone number";
    }

    return newErrors;
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    console.log("Edit form submitted");

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const dataToSend = {
        ...formData,
        is_active: !!editingTenant?.tenant?.is_active
      };

      console.log("Submitting update data:", dataToSend);

      const response = await axios.put(
        `${api_url}/tenants/update/${formData.tenantId}`,
        dataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        console.log("Tenant updated successfully");
        dispatch(fetchTenantsWithCourseCountandUserCount());
        onClose();
        toast.success("Tenant updated successfully");
        if (onUpdate) onUpdate();
      } else {
        toast.error(response.data?.message || "Failed to update tenant");
      }
    } catch (err) {
      console.error("Error updating tenant:", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);

      // Handle different types of errors
      if (err.response?.status === 404) {
        toast.error("Tenant not found");
        setErrors({ general: "Tenant not found" });
      } else if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Invalid data provided");
        setErrors({ general: err.response?.data?.message || "Invalid data provided" });
      } else if (err.response?.status === 401) {
        toast.error("Unauthorized access");
        setErrors({ general: "Unauthorized access" });
      } else if (err.response?.status === 500) {
        toast.error("Server error occurred");
        setErrors({ general: "Server error occurred" });
      } else {
        toast.error("Failed to update tenant");
        setErrors({ general: err.response?.data?.message || "Failed to update tenant" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTenant = async () => {
    try {
      console.log("Disabling tenant:", formData.tenantId);
      const response = await axios.post(
        `${api_url}/superadmin/tenant/disable/${formData.tenantId}`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Tenant disabled successfully");
      dispatch(fetchTenantsWithCourseCountandUserCount());
      if (onUpdate) onUpdate();
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to disable tenant");
    }
  };

  const handleEnableTenant = async () => {
    try {
      console.log("Enabling tenant:", formData.tenantId);
      const response = await axios.post(
        `${api_url}/superadmin/tenant/enable/${formData.tenantId}`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Tenant enabled successfully");
      dispatch(fetchTenantsWithCourseCountandUserCount());
      if (onUpdate) onUpdate();
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to enable tenant");
    }
  };

  const handleClose = () => {
    console.log("Closing edit modal");
    onClose();
  };

  if (!isOpen || !editingTenant) {
    console.log("Modal not rendering - isOpen:", isOpen, "editingTenant:", editingTenant);
    return null;
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1040
        }}
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1050,
          overflow: 'auto'
        }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="editTenantModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="editTenantModalLabel">Edit Tenant</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  lineHeight: '1',
                  opacity: '0.75'
                }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}



              <form onSubmit={handleUpdateSubmit}>
                <h6 className="mb-3 fw-bold">User Information</h6>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="fname" className="form-label">First Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.fname ? 'is-invalid' : ''}`}
                      id="fname"
                      name="fname"
                      value={formData.fname}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                    {errors.fname && <div className="invalid-feedback">{errors.fname}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="lname" className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.lname ? 'is-invalid' : ''}`}
                      id="lname"
                      name="lname"
                      value={formData.lname}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                    {errors.lname && <div className="invalid-feedback">{errors.lname}</div>}
                  </div>
                </div>

                <hr className="my-4" />

                <h6 className="mb-3 fw-bold">Company Information</h6>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="subdomain" className="form-label">Subdomain *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.subdomain ? 'is-invalid' : ''}`}
                      id="subdomain"
                      name="subdomain"
                      value={formData.subdomain}
                      onChange={handleInputChange}
                      placeholder="Enter subdomain"
                    />
                    {errors.subdomain && <div className="invalid-feedback">{errors.subdomain}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <label htmlFor="phone_number" className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                    />
                    {errors.phone_number && <div className="invalid-feedback">{errors.phone_number}</div>}
                  </div>
                </div>

                <hr className="my-4" />

                <h6 className="mb-3">Tenant Information</h6>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">User Count</label>
                    <div className="form-control-plaintext">
                      <span className="badge bg-info">{editingTenant?.userCount || 0}</span>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Course Count</label>
                    <div className="form-control-plaintext">
                      <span className="badge bg-primary">{editingTenant?.courseCount || 0}</span>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Created Date</label>
                    <div className="form-control-plaintext">
                      <small className="text-muted">
                        {editingTenant?.tenant?.createdAt
                          ? new Date(editingTenant.tenant.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </small>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <h6 className="mb-3">Tenant Status</h6>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Current Status</label>
                    <div className="form-control-plaintext">
                      <span className={`badge ${editingTenant?.tenant?.is_active ? 'bg-success' : 'bg-danger'}`}>
                        {editingTenant?.tenant?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Actions</label>
                    <div>
                      {editingTenant?.tenant?.is_active ? (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={handleDisableTenant}
                        >
                          Disable Tenant
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={handleEnableTenant}
                        >
                          Enable Tenant
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTenantModal;
