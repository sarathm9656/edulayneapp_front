import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaEllipsisV } from "react-icons/fa";
import EditUserModal from "../common/editUserModal/EditUserModal";
import {
  createStudent,
  deleteStudent,
  fetchAllStudentsForInstructor,
} from "../../redux/instructor/instructor.slice";
import "./InstructorStudents.css";

export default function InstructorStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    dob: "",
    phone_number: "",
    age: "",
  });
  const [formMessage, setFormMessage] = useState("");
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [openEditUserModal, setOpenEditUserModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const dispatch = useDispatch();

  // Redux selectors
  const allStudents = useSelector((state) => state.instructor.allStudents);
  const allStudentsLoading = useSelector(
    (state) => state.instructor.allStudentsLoading
  );
  const allStudentsError = useSelector(
    (state) => state.instructor.allStudentsError
  );
  const createStudentLoading = useSelector(
    (state) => state.instructor.createStudentLoading
  );
  const createStudentError = useSelector(
    (state) => state.instructor.createStudentError
  );
  const deleteStudentLoading = useSelector(
    (state) => state.instructor.deleteStudentLoading
  );

  useEffect(() => {
    // Fetch batch students
    dispatch(fetchAllStudentsForInstructor());
  }, [dispatch]);

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await dispatch(deleteStudent(studentId)).unwrap();
        toast.success("Student deleted successfully!");
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error(error.message || "Failed to delete student");
      }
    }
  };

  const handleInputChange = (e) => {
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
    const cleanPhone = phone.replace(/\D/g, "");
    return /^\d{10}$/.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage("");

    // Email validation
    if (!validateEmail(formData.email)) {
      setFormMessage("Please enter a valid email address.");
      return;
    }

    // Phone number validation
    if (!validatePhoneNumber(formData.phone_number)) {
      setFormMessage("Please enter a valid phone number.");
      return;
    }

    try {
      await dispatch(createStudent(formData)).unwrap();
      toast.success("Student added successfully!");
      setFormMessage("Student added successfully!");
      setFormData({
        fname: "",
        lname: "",
        email: "",
        dob: "",
        phone_number: "",
        age: "",
      });
      setTimeout(() => {
        setShowAddModal(false);
        setFormMessage("");
      }, 1000);
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
      setFormMessage(
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while adding student"
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };


  // Get students from batches with complete data
  const getCurrentStudents = () => {
    // Flatten all students from all batches with complete data
    const batchStudents =
      allStudents?.students_by_batch?.flatMap(
        (batch) =>
          batch.students?.map((student) => ({
            ...student,
            batch_name: batch.batch_name,
            course_title: batch.course_title,
            course_description: batch.course_description,
            batch_id: batch.batch_id,
            batch_start_date: batch.start_date,
            batch_end_date: batch.end_date,
            batch_status: batch.status,
            // Include complete student details
            student_details: student.student_details,
            // For backward compatibility, also include direct access to user data
            user_id: student.student_details?.user_id,
            email: student.student_details?.email,
            is_active: student.student_details?.is_active,
            last_login: student.student_details?.last_login,
          })) || []
      ) || [];
    return batchStudents;
  };

  // Improved search: supports full name, email, batch, and course
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const currentStudents = getCurrentStudents();
  const filteredStudents = currentStudents.filter((student) => {
    // Use the batch students structure
    const studentData = student.user_id || student.student_details?.user_id;
    const studentEmail = student.email || student.student_details?.email || "";
    const studentPhone = studentData?.phone_number || "";

    const fullName = `${studentData?.fname || ""} ${studentData?.lname || ""}`.toLowerCase();

    return (
      studentData?.fname?.toLowerCase().includes(normalizedSearch) ||
      studentData?.lname?.toLowerCase().includes(normalizedSearch) ||
      fullName.includes(normalizedSearch) ||
      studentEmail.toLowerCase().includes(normalizedSearch) ||
      studentPhone.includes(normalizedSearch) ||
      student.batch_name?.toLowerCase().includes(normalizedSearch) ||
      student.course_title?.toLowerCase().includes(normalizedSearch) ||
      student.course_description?.toLowerCase().includes(normalizedSearch)
    );
  });

  const clearForm = () => {
    setFormData({
      fname: "",
      lname: "",
      email: "",
      dob: "",
      phone_number: "",
      age: "",
    });
    setFormMessage("");
  };

  return (
    <div className="modern-grid">
      <div className="modern-card" style={{ gridColumn: "span 12" }}>
        <div className="row justify-content-between userlist-header">
          <div className="col-lg-4 col-md-6">
            <div className="row">
              <div className="col-lg-6 col-md-6 col-7">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div >
              <div className="col-lg-6 col-md-6 col-5">
                <button
                  className="addtenant-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="fa-solid fa-plus"></i> Add Student
                </button>
              </div>
            </div >
          </div >
          <div className="col-lg-4 col-md-6">
            <div className="row">
              <div className="col-lg-6 col-md-6 col-7">
                <select name="status" id="status" defaultValue="">
                  <option value="" disabled>
                    All Students
                  </option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-lg-6 col-md-6 col-5">
                <select name="sort" id="sort" defaultValue="">
                  <option value="" disabled>
                    Sort By
                  </option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="age">Age</option>
                </select>
              </div>
            </div>
          </div>
        </div >

        {/* Tab Navigation */}
        < div className="row mt-3" >
          <div className="col-12">
            <div className="tab-navigation">
              <button className="tab-btn active">
                <i className="fa-solid fa-layer-group"></i> All Students (
                {allStudents?.data?.total_students || allStudents?.total_students || 0})
              </button>
            </div>
          </div>
        </div >

        {/* Loading State */}
        {
          allStudentsLoading && (
            <div className="text-center py-5">
              <div className="loading-content">
                <i className="fa-solid fa-spinner fa-spin"></i> Loading
                students...
              </div>
            </div>
          )
        }

        {/* Error State */}
        {
          allStudentsError && (
            <div className="text-center py-5">
              <div className="alert alert-danger" role="alert">
                <i className="fa-solid fa-exclamation-triangle"></i> Error:{" "}
                {typeof allStudentsError === "string"
                  ? allStudentsError
                  : allStudentsError?.message || "Unknown error"}
              </div>
            </div>
          )
        }

        {/* No Students State */}
        {
          !allStudentsLoading &&
          !allStudentsError &&
          filteredStudents.length === 0 && (
            <div className="text-center py-5">
              <div className="no-lessons">
                <div className="empty-icon">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div className="empty-title">
                  {searchTerm
                    ? "No students found matching your search."
                    : "No students found."}
                </div>
                <div className="empty-description">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "Students will appear here when they are enrolled in your batches."}
                </div>
              </div>
            </div>
          )
        }

        {/* Students Table */}
        {
          !allStudentsLoading &&
          !allStudentsError &&
          filteredStudents.length > 0 && (
            <div className="table-responsive table-styles mt-4">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Batch</th>
                    <th scope="col">Course</th>
                    <th scope="col">Progress</th>
                    <th scope="col">Joined Date</th>
                    <th scope="col">Date of Birth</th>
                    <th scope="col">Age</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    // Use the batch students structure
                    const studentData = student.user_id || student.student_details?.user_id;
                    const studentEmail = student.email || student.student_details?.email || "";
                    const studentPhone = studentData?.phone_number || "";
                    const studentDob = studentData?.dob || "";
                    const studentAge = studentData?.age || "";
                    const studentIsActive = student.is_active || student.student_details?.is_active;

                    return (
                      <tr key={index}>
                        <th scope="row">{index + 1}</th>
                        <td>
                          {studentData?.fname} {studentData?.lname}
                        </td>
                        <td>{studentEmail}</td>
                        <td>{studentPhone}</td>
                        <td>
                          <span className="batch-badge">
                            {student.batch_name}
                          </span>
                        </td>
                        <td>
                          <span className="course-badge">
                            {student.course_title}
                          </span>
                        </td>
                        <td>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${student.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">{student.progress || 0}%</span>
                          </div>
                        </td>
                        <td>{formatDate(student.joined_at)}</td>
                        <td>{formatDate(studentDob)}</td>
                        <td>{studentAge}</td>
                        <td>
                          <span
                            className={`status-badge ${studentIsActive ? "active" : "archived"
                              }`}
                          >
                            {studentIsActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div >

      {/* Add Student Modal */}
      {
        showAddModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3 className="modal-title">Add New Student</h3>
                <button
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                {formMessage && (
                  <div
                    className={`alert ${typeof formMessage === "string" &&
                      formMessage.includes("successfully")
                      ? "alert-success"
                      : "alert-danger"
                      } mb-3`}
                  >
                    <i
                      className={`fa-solid ${typeof formMessage === "string" &&
                        formMessage.includes("successfully")
                        ? "fa-check-circle"
                        : "fa-exclamation-triangle"
                        }`}
                    ></i>
                    {typeof formMessage === "string"
                      ? formMessage
                      : formMessage?.message || "Unknown error"}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="newtrainer-modal">
                  <div className="trainer-input-item">
                    <label htmlFor="fname" className="form-label">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="fname"
                      name="fname"
                      value={formData.fname}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="trainer-input-item">
                    <label htmlFor="lname" className="form-label">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lname"
                      name="lname"
                      value={formData.lname}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="trainer-input-item">
                    <label htmlFor="email" className="form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="trainer-input-item">
                    <label htmlFor="phone_number" className="form-label">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="trainer-input-item">
                    <label htmlFor="dob" className="form-label">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="trainer-input-item">
                    <label htmlFor="age" className="form-label">
                      Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="form-input"
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={createStudentLoading}
                >
                  {createStudentLoading ? "Adding..." : "Add Student"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Student Modal */}
      <EditUserModal
        openEditUserModal={openEditUserModal}
        setOpenEditUserModal={setOpenEditUserModal}
        instructor={editingStudent}
        role="ins_student"
      />
    </div >
  );
}
