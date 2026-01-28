import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addTenant, fetchTenantsWithCourseCountandUserCount } from "../../redux/super.admin.slice";
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";

const AddTenantModal = ({ setIsAddTenantModalOpen }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone_number: "",
    name: "",
    subdomain: "",
  });

  console.log("AddTenantModal rendered, isAddTenantModalOpen:", setIsAddTenantModalOpen);

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

    // Required field validations
    if (!formData.fname.trim()) {
      newErrors.fname = "First name is required";
    }

    if (!formData.lname.trim()) {
      newErrors.lname = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Invalid phone number (10 digits starting with 6-9)";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = "Subdomain is required";
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = "Subdomain can only contain letters, numbers, and hyphens";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      console.log("Submitting tenant data:", formData);

      await dispatch(addTenant({
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        name: formData.name.trim(),
        subdomain: formData.subdomain.trim(),
      })).unwrap();

      console.log("Tenant added successfully");
      setIsAddTenantModalOpen(false);

      // Reset form
      setFormData({
        fname: "",
        lname: "",
        email: "",
        phone_number: "",
        name: "",
        subdomain: "",
      });
    } catch (error) {
      console.log("error", error);
      toast.error(error.message || "Failed to add tenant");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log("Closing modal");
    setIsAddTenantModalOpen(false);
  };

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
        aria-labelledby="addTenantModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title " id="addTenantModalLabel">Add Tenant</h5>
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
              <form onSubmit={handleSubmit}>
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

                <div className="row mb-3">
                  <div className="col-md-6">
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

                  <div className="col-md-6">
                    <label htmlFor="phone_number" className="form-label">Phone Number *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      maxLength="10"
                    />
                    {errors.phone_number && <div className="invalid-feedback">{errors.phone_number}</div>}
                  </div>
                </div>

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
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Adding...
                  </>
                ) : (
                  "Add Tenant"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTenantModal;
