import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchStudents, deleteStudent } from "../../../redux/tenant.slice";
import CreateStudentModal from "./CreateStudentModal";
import EditUserModal from "../../common/editUserModal/EditUserModal";
import { toast } from "react-toastify";

const ListStudents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, loading } = useSelector((state) => state.tenant);

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [openEditUserModal, setOpenEditUserModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch, isAddStudentModalOpen]);

  useEffect(() => {
    if (students) {
      setFilteredStudents(students);
    }
  }, [students]);

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!students) {
      setFilteredStudents([]);
      return;
    }

    let filtered = students;

    // Filter by Status
    if (statusFilter !== "all") {
      filtered = filtered.filter(student =>
        statusFilter === "active" ? student.is_active : !student.is_active
      );
    }

    // Filter by Search Term
    if (debouncedSearch.trim() !== "") {
      const searchTerm = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter(student => {
        const fullName = `${student.fname || ''} ${student.lname || ''}`.toLowerCase();
        const email = (student.email || '').toLowerCase();
        const phone = (student.phone_number || '').toString();
        const code = (student.user_code || '').toLowerCase();

        return fullName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          code.includes(searchTerm);
      });
    }

    setFilteredStudents(filtered);
  }, [debouncedSearch, students, statusFilter]);

  const handleEdit = (student) => {
    setEditingStudent(student);
    setOpenEditUserModal(true);
  };

  const handleDeleteClick = (student) => {
    setDeletingStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;

    try {
      await dispatch(deleteStudent(deletingStudent)).unwrap();
      setIsDeleteModalOpen(false);
      setDeletingStudent(null);
      toast.success("Student deleted successfully");
      dispatch(fetchStudents()); // Refresh the list
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.message || "Failed to delete student");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingStudent(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <>
      {/* Main Content */}
      <main className="container-wrapper-scroll">
        <section className="course-single-page container-height">
          <div className="container-fluid">
            {/* Header with Add Student button */}
            <div className="row justify-content-center">
              <div className="col-lg-2 col-md-3 col-6">
                <button className="addtenant-btn" onClick={() => setIsAddStudentModalOpen(true)}>
                  <i className="fa-solid fa-plus"></i> Add Student
                </button>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="row mt-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fa-solid fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, email, phone, or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {search && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearch("")}
                      title="Clear search"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-md-3">
                {/* Placeholder for future filters or empty space */}
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                {debouncedSearch && (
                  <small className="text-muted mt-2 d-block">
                    Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} matching "{debouncedSearch}"
                  </small>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive table-styles mt-4" style={{ overflowX: 'auto', minWidth: '100%' }}>
              <table className="table table-striped table-hover" style={{ minWidth: '800px' }}>
                <thead className="table-dark">
                  <tr>
                    <th scope="col" className="text-nowrap">#</th>
                    <th scope="col" className="text-nowrap">Code</th>
                    <th scope="col" className="text-nowrap">Name</th>
                    <th scope="col" className="text-nowrap">Email</th>
                    <th scope="col" className="text-nowrap">Phone</th>
                    <th scope="col" className="text-nowrap">Date of Birth</th>
                    <th scope="col" className="text-nowrap">Age</th>
                    <th scope="col" className="text-nowrap">Status</th>
                    <th scope="col" className="text-nowrap">Created at</th>
                    <th scope="col" className="text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <div className="d-flex justify-content-center align-items-center">
                          <div className="spinner-border text-primary me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Loading students...
                        </div>
                      </td>
                    </tr>
                  ) : filteredStudents && filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <tr key={student._id || index}>
                        <th scope="row" className="text-nowrap">{index + 1}</th>
                        <td className="text-nowrap">{student.user_code || `STU-${student._id?.slice(-4).toUpperCase()}`}</td>
                        <td className="text-nowrap">
                          <button
                            className="btn btn-link p-0 text-decoration-none text-dark fw-bold"
                            onClick={() => navigate(`/tenant/student-details/${student._id}`)}
                          >
                            {student.fname} {student.lname}
                          </button>
                        </td>
                        <td className="text-nowrap">{student.email}</td>
                        <td className="text-nowrap">{student.phone_number}</td>
                        <td className="text-nowrap">
                          {formatDate(student.dob)}
                        </td>
                        <td className="text-nowrap text-center">
                          {student.age || 'N/A'}
                        </td>
                        <td className="text-nowrap">
                          <span className={`badge ${student.is_active ? 'bg-success' : 'bg-danger'}`}>
                            {student.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-nowrap">
                          {student.created_at
                            ? new Date(student.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="text-nowrap">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-info me-1"
                              onClick={() => navigate(`/tenant/student-details/${student._id}`)}
                              title="View Details"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => handleEdit(student)}
                              title="Edit Student"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteClick(student)}
                              title="Delete Student"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        {debouncedSearch ? (
                          <div>
                            <i className="fa-solid fa-search fa-2x text-muted mb-2"></i>
                            <p className="text-muted">No students found matching "{debouncedSearch}"</p>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setSearch("")}
                            >
                              Clear search
                            </button>
                          </div>
                        ) : (
                          <div>
                            <i className="fa-solid fa-users fa-2x text-muted mb-2"></i>
                            <p className="text-muted">No students found</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="footer-wrapper">
          <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </section>
      </main>

      {/* Add Student Modal */}
      {isAddStudentModalOpen && (
        <CreateStudentModal
          AddStudentsModalOpen={isAddStudentModalOpen}
          setIsAddStudentsModalOpen={setIsAddStudentModalOpen}
        />
      )}

      {/* Edit Student Modal */}
      {openEditUserModal && editingStudent && (
        <EditUserModal
          openEditUserModal={openEditUserModal}
          setOpenEditUserModal={setOpenEditUserModal}
          instructor={editingStudent}
          role="student"
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingStudent && (
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
            onClick={handleDeleteCancel}
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
            aria-labelledby="deleteStudentModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="modal-title text-danger" id="deleteStudentModalLabel">
                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                    Confirm Delete
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleDeleteCancel}
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
                      opacity: '0.75',
                      position: 'relative'
                    }}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <div className="alert alert-warning" role="alert">
                    <h6 className="alert-heading">Warning!</h6>
                    <p className="mb-0">
                      You are about to delete the student <strong>"{deletingStudent.fname} {deletingStudent.lname}"</strong>.
                      This action cannot be undone.
                    </p>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <strong>Name:</strong>
                      <p>{deletingStudent.fname} {deletingStudent.lname}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong>
                      <p>{deletingStudent.email}</p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleDeleteCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteConfirm}
                  >
                    <i className="fa-solid fa-trash-can me-2"></i>
                    Delete Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ListStudents;
