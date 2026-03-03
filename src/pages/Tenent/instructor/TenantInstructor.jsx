import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddInstructorModal from "../../../components/tenants/AddInstructorModal";
import EditInstructorModal from "../../../components/tenants/EditInstructorModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchInstructors, fetchRoleByName, deleteInstructor } from "@/redux/tenant.slice";
import { toast } from "react-toastify";

const TenantInstructor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { instructors: reduxInstructors, instructorRole, loading } = useSelector((state) => state.tenant);
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [openAddInstructorModal, setOpenAddInstructorModal] = useState(false);
  const [instructorRoleId, setInstructorRoleId] = useState(null);
  const [openEditInstructorModal, setOpenEditInstructorModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingInstructor, setDeletingInstructor] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchInstructors());
    dispatch(fetchRoleByName("instructor"));
  }, [dispatch]);

  useEffect(() => {
    setInstructors(reduxInstructors || []);
  }, [reduxInstructors]);

  useEffect(() => {
    if (instructorRole && instructorRole._id) {
      setInstructorRoleId(instructorRole._id);
    }
  }, [instructorRole]);

  // Client-side filtering
  useEffect(() => {
    if (!instructors) {
      setFilteredInstructors([]);
      return;
    }

    let filtered = instructors;

    // Filter by search
    if (debouncedSearch.trim() !== "") {
      const searchTerm = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter(instructor => {
        const name = (instructor.name || '').toLowerCase();
        const email = (instructor.email || '').toLowerCase();
        const phone = (instructor.phone_number || '').toString();
        const code = (instructor.user_code || '').toLowerCase();

        return name.includes(searchTerm) ||
          email.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          code.includes(searchTerm);
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(instructor => {
        const isActive = instructor.status === true; // Assuming status is boolean true for active
        return statusFilter === "active" ? isActive : !isActive;
      });
    }

    setFilteredInstructors(filtered);
  }, [debouncedSearch, instructors, statusFilter]);

  const handleInstructorAdded = (newInstructor) => {
    setInstructors((prev) => [newInstructor, ...prev]);
    setOpenAddInstructorModal(false);
    // Background fetch will update Redux and local state
  };

  const handleInstructorUpdated = (updatedInstructor) => {
    setInstructors((prev) =>
      prev.map(instructor =>
        instructor.user_id === updatedInstructor._id ? updatedInstructor : instructor
      )
    );
    setOpenEditInstructorModal(false);
    setEditingInstructor(null);
    // Background fetch will update Redux and local state
  };

  const handleEdit = (instructor) => {
    setEditingInstructor(instructor);
    setOpenEditInstructorModal(true);
  };

  const handleDeleteClick = (instructor) => {
    setDeletingInstructor(instructor);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInstructor) return;

    try {
      await dispatch(deleteInstructor(deletingInstructor)).unwrap();
      setIsDeleteModalOpen(false);
      setDeletingInstructor(null);
      toast.success("Instructor deleted successfully");
      dispatch(fetchInstructors()); // Refresh the list
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to delete instructor");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingInstructor(null);
  };

  const handleViewDetails = (instructor) => {
    navigate(`/tenant/instructor/${instructor.id || instructor._id}`);
  };



  return (
    <main className="container-wrapper-scroll">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-end align-items-center mb-4">
              <button
                className="btn btn-primary px-4 py-2 rounded-3 fw-medium"
                onClick={() => setOpenAddInstructorModal(true)}
              >
                <i className="fa-solid fa-plus me-2"></i> Add Instructor
              </button>
            </div>

            {/* Search and Filter */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-3">
                <div className="row g-3">
                  <div className="col-md-9">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <i className="fa-solid fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search instructors by name, email, phone, or code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ boxShadow: 'none' }}
                      />
                      {search && (
                        <button
                          className="btn btn-link text-muted border-start-0 text-decoration-none"
                          type="button"
                          onClick={() => setSearch("")}
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select border-0 bg-light"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ height: '100%' }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructors Table */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light text-muted">
                      <tr>
                        <th scope="col" className="ps-4 py-3">#</th>
                        <th scope="col" className="py-3">Instructor Details</th>
                        <th scope="col" className="py-3">Contact Info</th>
                        <th scope="col" className="py-3">Payment</th>
                        <th scope="col" className="py-3">Workload</th>
                        <th scope="col" className="py-3">Status</th>
                        <th scope="col" className="py-3">Joined Date</th>
                        <th scope="col" className="text-end pe-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading instructors...</p>
                          </td>
                        </tr>
                      ) : filteredInstructors && filteredInstructors.length > 0 ? (
                        filteredInstructors.map((instructor, index) => (
                          <tr key={instructor._id || index}>
                            <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: '40px', height: '40px' }}>
                                  {instructor.name ? instructor.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <h6 className="mb-0 fw-bold text-dark">{instructor.name}</h6>
                                  <small className="text-muted">ID: {instructor.user_code || instructor.user_id?.user_code || instructor.user_id?.slice(-6) || 'N/A'}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <span className="text-dark mb-1"><i className="fa-regular fa-envelope me-2 text-muted" style={{ width: '16px' }}></i>{instructor.email}</span>
                                <span className="text-muted small"><i className="fa-solid fa-phone me-2 text-muted" style={{ width: '16px' }}></i>{instructor.phone_number}</span>
                              </div>
                            </td>
                            <td>
                              {instructor.payment_amount ? (
                                <div className="d-flex flex-column">
                                  <span className="fw-bold text-success">₹{instructor.payment_amount}</span>
                                  <span className="small text-muted text-capitalize">{instructor.payment_type}</span>
                                </div>
                              ) : (
                                <span className="text-muted small italic">Not Set</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <span className="badge bg-light text-primary border border-primary-subtle" title="Assigned Courses">
                                  <i className="fa-solid fa-book me-1"></i>
                                  {instructor.assigned_courses?.length || 0} Courses
                                </span>
                                <span className="badge bg-light text-info border border-info-subtle" title="Assigned Batches">
                                  <i className="fa-solid fa-users me-1"></i>
                                  {instructor.assigned_batches?.length || 0} Batches
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge rounded-pill px-3 py-2 ${instructor.status ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                <i className={`fa-solid fa-circle me-1 small`}></i>
                                {instructor.status ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>
                              <span className="text-muted">
                                {instructor.created_at
                                  ? new Date(instructor.created_at).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-secondary border-0 text-dark"
                                  onClick={() => handleViewDetails(instructor)}
                                  title="View Details"
                                >
                                  <i className="fa-regular fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary border-0 text-primary"
                                  onClick={() => handleEdit(instructor)}
                                  title="Edit Instructor"
                                >
                                  <i className="fa-regular fa-pen-to-square"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary border-0 text-danger"
                                  onClick={() => handleDeleteClick(instructor)}
                                  title="Delete Instructor"
                                >
                                  <i className="fa-regular fa-trash-can"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-5">
                            <div className="py-4">
                              <i className="fa-solid fa-magnifying-glass fa-2x text-muted mb-3 opacity-50"></i>
                              <h5 className="text-muted">No instructors found</h5>
                              <p className="text-muted small mb-0">Try adjusting your search or add a new instructor.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="footer-wrapper mt-4">
        <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
      </section>

      {/* Add Instructor Modal */}
      {openAddInstructorModal && (
        <AddInstructorModal
          setOpenAddInstructorModal={setOpenAddInstructorModal}
          instructorRoleId={instructorRoleId}
          onInstructorAdded={handleInstructorAdded}
        />
      )}

      {/* Edit Instructor Modal */}
      {openEditInstructorModal && editingInstructor && (
        <EditInstructorModal
          setOpenEditInstructorModal={setOpenEditInstructorModal}
          instructor={editingInstructor}
          onInstructorUpdated={handleInstructorUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingInstructor && (
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
            aria-labelledby="deleteInstructorModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="modal-title text-danger" id="deleteInstructorModalLabel">
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
                      You are about to delete the instructor <strong>"{deletingInstructor.name}"</strong>.
                      This action cannot be undone.
                    </p>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <strong>Name:</strong>
                      <p>{deletingInstructor.name}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong>
                      <p>{deletingInstructor.email}</p>
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
                    Delete Instructor
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

export default TenantInstructor;
