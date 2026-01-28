import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInstructor, fetchInstructors } from "@/redux/tenant.slice";
import { fetchCourses } from "@/redux/course.slice";
import { fetchBatches } from "@/redux/batch.slice";
import { toast } from "react-toastify";

const AddInstructorModal = ({
  setOpenAddInstructorModal,
  instructorRoleId,
  onInstructorAdded, // new prop for optimistic update
}) => {
  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.course);
  const { batches } = useSelector((state) => state.batch);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    // age: "",
    dob: "",
    phone_number: "",
    email: "",
    role_id: instructorRoleId,
    payment_type: "salary",
    payment_amount: "",
    assigned_courses: [],
    assigned_batches: [],
    gender: "",
    address: "",
    bio: "",
  });
  const [creating, setCreating] = useState(false);

  React.useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchBatches());
  }, [dispatch]);
  console.log(instructorRoleId, "instructorRoleId");
  // const api_url = import.meta.env.VITE_API_URL;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhoneNumber = (phone) => {
    // Example: Indian mobile number (10 digits, starts with 6-9)
    const cleanPhone = phone.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleanPhone);
  };

  const validatePrice = (price) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice >= 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    // Email validation
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      setCreating(false);
      return;
    }

    // Phone number validation
    if (!validatePhoneNumber(formData.phone_number)) {
      toast.error("Please enter a valid phone number 10 digits only.");
      setCreating(false);
      return;
    }

    // Amount validation
    if (!formData.payment_amount || parseFloat(formData.payment_amount) < 0) {
      toast.error("Please enter a valid payment amount.");
      setCreating(false);
      return;
    }

    const result = await dispatch(createInstructor(formData));
    setCreating(false);
    if (createInstructor.fulfilled.match(result)) {
      if (onInstructorAdded && result.payload?.data) {
        onInstructorAdded(result.payload.data);
      }
      setOpenAddInstructorModal(false);
      toast.success(result.payload?.message || "Instructor added successfully");
      dispatch(fetchInstructors());
    } else if (createInstructor.rejected.match(result)) {
      let errorMessage = result.payload?.error || result.payload?.message || "Failed to add instructor";
      toast.error(errorMessage);
    }
  };

  const handleCourseChange = (courseId) => {
    const isSelected = formData.assigned_courses.includes(courseId);
    let newCourses;
    if (isSelected) {
      newCourses = formData.assigned_courses.filter(id => id !== courseId);
    } else {
      newCourses = [...formData.assigned_courses, courseId];
    }

    // Also filter out batches that don't belong to selected courses anymore
    const newBatches = formData.assigned_batches.filter(batchId => {
      const batch = batches.find(b => b._id === batchId);
      return batch && newCourses.includes(batch.course_id?._id || batch.course_id);
    });

    setFormData({ ...formData, assigned_courses: newCourses, assigned_batches: newBatches });
  };

  const handleBatchToggle = (batchId) => {
    const isSelected = formData.assigned_batches.includes(batchId);
    if (isSelected) {
      setFormData({
        ...formData,
        assigned_batches: formData.assigned_batches.filter(id => id !== batchId)
      });
    } else {
      // Check for time conflict
      const targetBatch = batches.find(b => b._id === batchId);
      const conflict = formData.assigned_batches.some(id => {
        const b = batches.find(batch => batch._id === id);
        if (!b || !targetBatch) return false;

        // Conflict check: overlapped days and same time
        const daysOverlap = b.recurring_days.some(d => targetBatch.recurring_days.includes(d));
        return daysOverlap && b.batch_time === targetBatch.batch_time;
      });

      if (conflict) {
        toast.error("Time conflict detected! Instructor is already assigned to a batch at this time.");
        return; // Prevent selection
      }

      setFormData({
        ...formData,
        assigned_batches: [...formData.assigned_batches, batchId]
      });
    }
  };

  const filteredBatches = batches.filter(batch =>
    formData.assigned_courses.includes(batch.course_id?._id || batch.course_id)
  );

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
        onClick={() => setOpenAddInstructorModal(false)}
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
        aria-labelledby="addInstructorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title" id="addInstructorModalLabel">
                Add New Instructor
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setOpenAddInstructorModal(false)}
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
              <form id="instructorForm" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="fname" className="form-label">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="fname"
                      name="fname"
                      value={formData.fname}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter first name"
                      required
                      disabled={creating}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lname" className="form-label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lname"
                      name="lname"
                      value={formData.lname}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter last name"
                      required
                      disabled={creating}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="dob" className="form-label">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={creating}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="phone_number" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter phone number"
                    required
                    disabled={creating}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter email address"
                    required
                    disabled={creating}
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="gender" className="form-label">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleChange}
                      className="form-control"
                      disabled={creating}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter address"
                      disabled={creating}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">
                    Bio / Description
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter a brief bio about the instructor..."
                    rows="3"
                    disabled={creating}
                  ></textarea>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="payment_type" className="form-label">Payment Type</label>
                    <select
                      id="payment_type"
                      name="payment_type"
                      value={formData.payment_type}
                      onChange={handleChange}
                      className="form-control"
                      disabled={creating}
                    >
                      <option value="salary">Salary (Monthly)</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="payment_amount" className="form-label">Payment Amount (₹)</label>
                    <input
                      type="number"
                      id="payment_amount"
                      name="payment_amount"
                      value={formData.payment_amount}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter amount"
                      min="0"
                      required
                      disabled={creating}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">Assign Courses</label>
                  <div className="border p-2 rounded bg-light" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {courses && courses.length > 0 ? (
                      courses.map(course => (
                        <div key={course._id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`course_${course._id}`}
                            checked={formData.assigned_courses.includes(course._id)}
                            onChange={() => handleCourseChange(course._id)}
                          />
                          <label className="form-check-label" htmlFor={`course_${course._id}`}>
                            {course.course_title}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted small mb-0">No courses available</p>
                    )}
                  </div>
                </div>

                {formData.assigned_courses.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label d-block">Assign Batches (Filtered by selected courses)</label>
                    <div className="border p-2 rounded bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {filteredBatches && filteredBatches.length > 0 ? (
                        filteredBatches.map(batch => (
                          <div key={batch._id} className="form-check border-bottom pb-1 mb-1">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`batch_${batch._id}`}
                              checked={formData.assigned_batches.includes(batch._id)}
                              onChange={() => handleBatchToggle(batch._id)}
                            />
                            <label className="form-check-label w-100" htmlFor={`batch_${batch._id}`}>
                              <div className="d-flex justify-content-between">
                                <strong>{batch.batch_name}</strong>
                                <span className="badge bg-info">{batch.course_id?.course_title || 'Batch'}</span>
                              </div>
                              <small className="text-muted d-block">
                                <i className="fa-solid fa-clock me-1"></i> {batch.batch_time} |
                                <span className="ms-1">{batch.recurring_days?.join(', ')}</span>
                              </small>
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small mb-0">No batches found for selected courses</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="alert alert-info">
                  <small>Role: Instructor</small>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpenAddInstructorModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="instructorForm"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? "Creating..." : "Add Instructor"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddInstructorModal;
