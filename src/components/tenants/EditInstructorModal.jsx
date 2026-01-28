import axios from "axios";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchInstructors } from "@/redux/tenant.slice";
import { fetchCourses } from "@/redux/course.slice";
import { fetchBatches } from "@/redux/batch.slice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const EditInstructorModal = ({
  setOpenEditInstructorModal,
  instructor,
  onInstructorUpdated,
}) => {
  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.course);
  const { batches } = useSelector((state) => state.batch);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    dob: "",
    phone_number: "",
    email: "",
    payment_type: "salary",
    payment_amount: "",
    assigned_courses: [],
    assigned_batches: [],
    status: "active",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchBatches());
  }, [dispatch]);

  // Pre-fill form data when instructor prop changes
  useEffect(() => {
    if (instructor) {
      console.log("Instructor data for editing:", instructor);

      // Format date for input field (YYYY-MM-DD)
      let formattedDob = "";
      if (instructor.dob) {
        console.log("Original DOB:", instructor.dob);
        const date = new Date(instructor.dob);
        console.log("Parsed date:", date);
        if (!isNaN(date.getTime())) {
          formattedDob = date.toISOString().split('T')[0];
          console.log("Formatted DOB:", formattedDob);
        }
      }

      const formDataToSet = {
        fname: instructor.fname || instructor.name?.split(' ')[0] || "",
        lname: instructor.lname || instructor.name?.split(' ').slice(1).join(' ') || "",
        dob: formattedDob,
        phone_number: instructor.phone_number || "",
        email: instructor.email || "",
        payment_type: instructor.payment_type || "salary",
        payment_amount: instructor.payment_amount || "",
        assigned_courses: instructor.assigned_courses || [],
        assigned_batches: instructor.assigned_batches || [],
        status: instructor.status ? "active" : "inactive",
        gender: instructor.gender || "",
        address: instructor.address || "",
        bio: instructor.bio || "",
      };

      console.log("Setting form data:", formDataToSet);
      setFormData(formDataToSet);
    }
  }, [instructor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleanPhone);
  };

  const validatePrice = (price) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice >= 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    // Email validation
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      setUpdating(false);
      return;
    }

    // Phone number validation
    if (!validatePhoneNumber(formData.phone_number)) {
      toast.error("Please enter a valid phone number 10 digits only.");
      setUpdating(false);
      return;
    }

    // Payment Amount validation
    if (!validatePrice(formData.payment_amount)) {
      toast.error("Please enter a valid payment amount (must be 0 or greater).");
      setUpdating(false);
      return;
    }

    try {
      // Get the correct ID - we need the user_id for updating user details
      const instructorId = instructor.user_id || instructor._id || instructor.id;
      console.log("Using instructor ID:", instructorId);

      if (!instructorId) {
        toast.error("Invalid instructor ID");
        setUpdating(false);
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${instructorId}`,
        {
          ...formData,
          payment_amount: parseFloat(formData.payment_amount),
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setOpenEditInstructorModal(false);

        // Optimistic UI update
        if (onInstructorUpdated && response.data.data) {
          onInstructorUpdated(response.data.data);
        }

        dispatch(fetchInstructors()); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating instructor:", error);
      let errorMessage = "Failed to update instructor";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      if (errorMessage.includes("duplicate key") || errorMessage.includes("email")) {
        errorMessage = "Email already exists. Please use a different email address.";
      }

      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (!instructor) {
    return null;
  }

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
        onClick={() => setOpenEditInstructorModal(false)}
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
        aria-labelledby="editInstructorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title" id="editInstructorModalLabel">
                Edit Instructor
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setOpenEditInstructorModal(false)}
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
              <form id="editInstructorForm" onSubmit={handleSubmit}>
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
                      disabled={updating}
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
                      disabled={updating}
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
                    disabled={updating}
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
                    disabled={updating}
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
                    disabled={updating}
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
                      disabled={updating}
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
                      disabled={updating}
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
                    disabled={updating}
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
                      disabled={updating}
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
                      disabled={updating}
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
                            id={`edit_course_${course._id}`}
                            checked={formData.assigned_courses.includes(course._id)}
                            onChange={() => handleCourseChange(course._id)}
                          />
                          <label className="form-check-label" htmlFor={`edit_course_${course._id}`}>
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
                              id={`edit_batch_${batch._id}`}
                              checked={formData.assigned_batches.includes(batch._id)}
                              onChange={() => handleBatchToggle(batch._id)}
                            />
                            <label className="form-check-label w-100" htmlFor={`edit_batch_${batch._id}`}>
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

                <div className="mb-3">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-control"
                    disabled={updating}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="form-text">
                    Set the instructor's account status
                  </div>
                </div>

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
                onClick={() => setOpenEditInstructorModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editInstructorForm"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Instructor"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditInstructorModal;
