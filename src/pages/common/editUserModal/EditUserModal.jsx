import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/user.slice";
import { fetchStudents,fetchInstructors } from "../../../redux/tenant.slice";

import toast from "react-hot-toast";
import { fetchStudent } from "../../../redux/instructor/instructor.slice";

const EditUserModal = ({ openEditUserModal, setOpenEditUserModal, instructor ,role }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    // age: '',
    dob: '',
    phone_number: '',
    email: '',
    id: '',
    status: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (instructor) {
      // console.log('edit instructor ',instructor);
      
      // Try to split name into fname/lname if possible
        const [fname = '', lname = ''] = (instructor.name || '').split(' ');      
      
      // Determine status based on multiple possible fields from backend
      let status = 'inactive'; // default fallback
      if (instructor.status !== undefined) {
        status = instructor.status ? 'active' : 'inactive';
      } else if (instructor.is_active !== undefined) {
        status = instructor.is_active ? 'active' : 'inactive';
      }
      
      // Debug log to see what status is being set
      console.log('EditUserModal - Instructor data:', instructor);
      console.log('EditUserModal - Setting status to:', status);
      
      setFormData({
        fname:instructor?.fname || fname,
        lname:instructor?.lname || lname,
        age: instructor.age || '',
        dob: instructor.dob || '',
        phone_number: instructor.phone_number || '',
        email: instructor.email || '',
        user_id: instructor.user_id || '',
        id: instructor.id || instructor._id || '',
        status: status,
      });
    }
  }, [instructor]);

  if (!openEditUserModal || !instructor) return null;

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!phone) {
      return "Phone number is required";
    }
    
    if (cleanPhone.length !== 10) {
      return "Phone number must be exactly 10 digits";
    }
    
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return "Please enter a valid 10-digit phone number";
    }
    
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    // Phone validation
    const phoneError = validatePhone(formData.phone_number);
    if (phoneError) {
      newErrors.phone_number = phoneError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // Validate form before submitting
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    try {
      await dispatch(updateUser(formData)).unwrap();
      setOpenEditUserModal(false);
      toast.success("Updation completed");

      // Refetch instructors after successful update
      // dispatch(fetchInstructors());
      if (role === 'student'){
        dispatch(fetchStudents())
      }
      else if (role === 'ins_student'){
        dispatch(fetchStudent())
      }
      else{
      dispatch(fetchInstructors());
      }

    } catch (error) {
      // Optionally show error
      // alert("Failed to update instructor");
      toast.error('Failed to update');
      

    }
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
        onClick={() => setOpenEditUserModal(false)}
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
        aria-labelledby="editUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title" id="editUserModalLabel">
                <i className="fa-solid fa-user-edit me-2"></i>
                Edit User
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setOpenEditUserModal(false)}
                aria-label="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#000',
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
                          <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="fname" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="fname"
                      name="fname"
                      className="form-control"
                      value={formData.fname}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lname" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lname"
                      name="lname"
                      className="form-control"
                      value={formData.lname}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="dob" className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    className="form-control"
                    value={formData.dob ? formData.dob.slice(0, 10) : ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone_number" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                  {errors.phone_number && (
                    <div className="invalid-feedback">{errors.phone_number}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    disabled
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpenEditUserModal(false)}
              >
                <i className="fa-solid fa-times me-2"></i>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                <i className="fa-solid fa-save me-2"></i>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUserModal;
