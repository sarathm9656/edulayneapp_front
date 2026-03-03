import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CreateStudentModal = ({
  AddStudentsModalOpen,
  setIsAddStudentsModalOpen,
}) => {
  const [role_id, setRole_id] = useState(null);
  const [create, setCreate] = useState(false);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    dob: "",
    gender: "",
    phone_number: "",
    email: "",
    course_id: "",
    batch_id: "",
  });

  useEffect(() => {
    if (AddStudentsModalOpen) {
      getRoles();
      getCourses();
      getAllBatches();
    }
  }, [AddStudentsModalOpen]);

  async function getRoles() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/roles`, {
        withCredentials: true,
      });
      const studentRole = res.data.data.find((role) => role.name === "student");
      if (studentRole) {
        setRole_id(studentRole._id);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }

  async function getCourses() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/courses`, {
        withCredentials: true,
      });
      setCourses(res.data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }

  async function getAllBatches() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/batch`, {
        withCredentials: true,
      });
      setBatches(res.data.data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "course_id") {
      // Filter batches when course changes
      const filtered = batches.filter(batch => batch.course_id?._id === value || batch.course_id === value);
      setFilteredBatches(filtered);
      setFormData(prev => ({ ...prev, course_id: value, batch_id: "" }));
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setCreate(true);

    const requiredFields = ["fname", "lname", "dob", "gender", "phone_number", "email", "course_id", "batch_id"];
    const missingField = requiredFields.find(field => !formData[field]);

    if (missingField) {
      toast.error(`Please fill in all required fields including Course and Batch.`);
      setCreate(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      setCreate(false);
      return;
    }

    if (!validatePhoneNumber(formData.phone_number)) {
      toast.error("Please enter a valid phone number (10 digits).");
      setCreate(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users`,
        { ...formData, role_id },
        { withCredentials: true }
      );
      if (res.status === 201 || res.status === 200) {
        toast.success(res.data.message || "Student added and enrolled successfully");
        setIsAddStudentsModalOpen(false);
        // Reset form
        setFormData({
          fname: "",
          lname: "",
          dob: "",
          gender: "",
          phone_number: "",
          email: "",
          course_id: "",
          batch_id: "",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add student");
    } finally {
      setCreate(false);
    }
  };

  if (!AddStudentsModalOpen) return null;

  return (
    <>
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
        onClick={() => setIsAddStudentsModalOpen(false)}
      ></div>

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
      >
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content shadow-lg border-0 rounded-4">
            <div className="modal-header bg-pink text-white rounded-top-4 p-4">
              <h5 className="modal-title fw-bold" id="createStudentModalLabel">
                <i className="fa-solid fa-user-graduate me-2"></i>
                Add & Enroll Student
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setIsAddStudentsModalOpen(false)}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Personal Information Section */}
                  <div className="col-12">
                    <h6 className="text-pink fw-bold mb-3 border-bottom pb-2">Personal Information</h6>
                  </div>

                  <div className="col-md-6 mb-2">
                    <label htmlFor="fname" className="form-label small fw-bold text-muted">First Name</label>
                    <input
                      type="text"
                      id="fname"
                      name="fname"
                      className="form-control rounded-3"
                      placeholder="e.g. John"
                      value={formData.fname}
                      onChange={handleChange}
                      required
                      disabled={create}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label htmlFor="lname" className="form-label small fw-bold text-muted">Last Name</label>
                    <input
                      type="text"
                      id="lname"
                      name="lname"
                      className="form-control rounded-3"
                      placeholder="e.g. Doe"
                      value={formData.lname}
                      onChange={handleChange}
                      required
                      disabled={create}
                    />
                  </div>

                  <div className="col-md-6 mb-2">
                    <label htmlFor="email" className="form-label small fw-bold text-muted">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control rounded-3"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={create}
                    />
                  </div>

                  <div className="col-md-6 mb-2">
                    <label htmlFor="phone_number" className="form-label small fw-bold text-muted">Phone Number</label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      className="form-control rounded-3"
                      placeholder="10 digit mobile number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      disabled={create}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="dob" className="form-label small fw-bold text-muted">Date of Birth</label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      className="form-control rounded-3"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      disabled={create}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="gender" className="form-label small fw-bold text-muted">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      className="form-select rounded-3"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      disabled={create}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Enrollment Details Section */}
                  <div className="col-12 mt-4">
                    <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">Enrollment Details</h6>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="course_id" className="form-label small fw-bold text-muted">Assign Course</label>
                    <select
                      id="course_id"
                      name="course_id"
                      className="form-select rounded-3"
                      value={formData.course_id}
                      onChange={handleChange}
                      required
                      disabled={create}
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course._id} value={course._id}>{course.course_title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="batch_id" className="form-label small fw-bold text-muted">Assign Batch</label>
                    <select
                      id="batch_id"
                      name="batch_id"
                      className="form-select rounded-3"
                      value={formData.batch_id}
                      onChange={handleChange}
                      required
                      disabled={create || !formData.course_id}
                    >
                      <option value="">{formData.course_id ? "Select Batch" : "First select a course"}</option>
                      {filteredBatches.map(batch => (
                        <option key={batch._id} value={batch._id}>{batch.batch_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 bg-light p-3 rounded-3 border">
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>This student will be automatically notified with login credentials via email.</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer p-4 bg-light rounded-bottom-4">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={() => setIsAddStudentsModalOpen(false)}
                disabled={create}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 fw-bold"
                onClick={handleSubmit}
                disabled={create}
                style={{ minWidth: '160px' }}
              >
                {create ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enrolling...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-user-plus me-2"></i>
                    Add Student
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateStudentModal;
