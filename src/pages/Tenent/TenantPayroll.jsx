import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser, FaClock, FaMoneyBillWave, FaCalculator, FaCreditCard, FaSearch, FaFilter, FaDownload, FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { MdPayment, MdAssignment, MdSchedule } from "react-icons/md";

const TenantPayroll = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [payrollData, setPayrollData] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);

      // Fetch comprehensive payroll data from the new API
      const payrollResponse = await axios.get(`${API_URL}/payroll/data`, {
        withCredentials: true
      });

      if (payrollResponse.data.success) {
        // The payment status is now included in the main response
        setInstructors(payrollResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" ||
      (filterStatus === "active" && instructor.status) ||
      (filterStatus === "inactive" && !instructor.status) ||
      (filterStatus === "pending" && instructor.totalPayment > 0) ||
      (filterStatus === "paid" && instructor.paymentStatus === 'paid') ||
      (filterStatus === "unpaid" && instructor.paymentStatus === 'unpaid');

    return matchesSearch && matchesFilter;
  });

  const handlePayment = (instructor) => {
    setSelectedInstructor(instructor);
    setPaymentAmount(instructor.totalPayment);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedInstructor || paymentAmount <= 0) {
      toast.error("Invalid payment amount");
      return;
    }

    try {
      setProcessingPayment(true);

      // Process payment through the API
      const response = await axios.post(
        `${API_URL}/payroll/instructor/${selectedInstructor.id}/payment`,
        {
          amount: paymentAmount,
          note: paymentNote,
          paymentMethod: 'manual'
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Payment of ₹${paymentAmount} processed successfully for ${selectedInstructor.name}`);
        setShowPaymentModal(false);
        setPaymentNote("");

        // Refresh data
        fetchPayrollData();
      } else {
        toast.error("Payment processing failed");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("Payment processing failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const updatePaymentStatus = async (instructorId, status) => {
    try {
      setUpdatingStatus(instructorId);

      const response = await axios.put(
        `${API_URL}/payroll/instructor/${instructorId}/status`,
        {
          status: status,
          note: `Payment status updated to ${status}`
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Payment status updated to ${status}`);
        // Refresh data
        fetchPayrollData();
      } else {
        toast.error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const exportPayrollData = () => {
    const csvData = [
      ["Instructor Name", "Email", "Hourly Rate", "Total Hours", "Total Payment", "Payment Status", "Completed Sessions", "Pending Sessions"],
      ...filteredInstructors.map(instructor => [
        instructor.name,
        instructor.email,
        `₹${instructor.price_per_hour || 0}`,
        instructor.totalHours,
        `₹${instructor.totalPayment}`,
        instructor.paymentStatus || 'unpaid',
        instructor.completedSessions,
        instructor.pendingSessions
      ])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPayrollAmount = filteredInstructors.reduce((total, instructor) => total + instructor.totalPayment, 0);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  if (loading) {
    return (
      <main className="container-wrapper-scroll">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading payroll data...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-wrapper-scroll">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {/* Header Section */}
            {/* Header Section */}
            <div className="d-flex justify-content-end align-items-center mb-4">
              <div className="text-end">
                <div className="h4 mb-1 text-success">₹{totalPayrollAmount.toFixed(2)}</div>
                <small className="text-muted">Total Pending Amount</small>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-4">
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="searchInstructor" className="form-label">Search Instructors</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="searchInstructor"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label htmlFor="filterStatus" className="form-label">Filter by Status</label>
                  <select
                    className="form-control"
                    id="filterStatus"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Instructors</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                    <option value="pending">Pending Payment</option>
                    <option value="paid">Paid Only</option>
                    <option value="unpaid">Unpaid Only</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={exportPayrollData}
                  >
                    <FaDownload className="me-2" />
                    Export CSV
                  </button>
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={clearFilters}
                  >
                    <FaFilter className="me-2" />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && instructors.length === 0 && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading payroll data...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && instructors.length === 0 && (
              <div className="text-center py-5">
                <FaUser className="fa-3x text-muted mb-3" />
                <h5 className="text-muted">No instructors found</h5>
                <p className="text-muted">No instructors are available for payroll management</p>
              </div>
            )}

            {/* No Results State */}
            {!loading && instructors.length > 0 && filteredInstructors.length === 0 && (
              <div className="text-center py-5">
                <FaSearch className="fa-3x text-muted mb-3" />
                <h5 className="text-muted">No instructors found</h5>
                <p className="text-muted">
                  {searchTerm || filterStatus !== "all"
                    ? "No instructors match your search criteria. Try adjusting your filters."
                    : "No instructors available."
                  }
                </p>
                {(searchTerm || filterStatus !== "all") && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Payroll Table */}
            {!loading && filteredInstructors.length > 0 && (
              <div className="table-responsive table-styles mt-4" style={{ overflowX: 'auto', minWidth: '100%' }}>
                <table className="table table-striped table-hover" style={{ minWidth: '1200px' }}>
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" className="text-nowrap">#</th>
                      <th scope="col" className="text-nowrap">Instructor</th>
                      <th scope="col" className="text-nowrap">Payment Plan</th>
                      <th scope="col" className="text-nowrap">Total Hours</th>
                      <th scope="col" className="text-nowrap">Total Payment</th>
                      <th scope="col" className="text-nowrap">Payment Status</th>
                      <th scope="col" className="text-nowrap">Sessions</th>
                      <th scope="col" className="text-nowrap">Status</th>
                      <th scope="col" className="text-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstructors.map((instructor, index) => (
                      <tr key={instructor.id}>
                        <th scope="row" className="text-nowrap">{index + 1}</th>
                        <td className="text-nowrap">
                          <div className="fw-bold text-dark">{instructor.name}</div>
                          <small className="text-muted">{instructor.email}</small>
                        </td>
                        <td className="text-nowrap">
                          <div className="d-flex flex-column">
                            <span className="badge bg-info text-capitalize mb-1" style={{ width: 'fit-content' }}>
                              {instructor.payment_type || 'Salary'}
                            </span>
                            <span className="fw-bold">
                              ₹{instructor.payment_amount || instructor.price_per_hour || 0}
                            </span>
                          </div>
                        </td>
                        <td className="text-nowrap">
                          <div className="d-flex align-items-center">
                            <FaClock className="text-primary me-2" />
                            {instructor.totalHours} hrs
                          </div>
                        </td>
                        <td className="text-nowrap">
                          <div className="fw-bold text-success">
                            ₹{instructor.totalPayment.toFixed(2)}
                          </div>
                        </td>
                        <td className="text-nowrap">
                          <span className={`badge ${instructor.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'
                            }`}>
                            {instructor.paymentStatus || 'unpaid'}
                          </span>
                        </td>
                        <td className="text-nowrap">
                          <div className="d-flex gap-2">
                            <span className="badge bg-success">
                              {instructor.completedSessions} completed
                            </span>
                            <span className="badge bg-warning">
                              {instructor.pendingSessions} pending
                            </span>
                          </div>
                        </td>
                        <td className="text-nowrap">
                          <span className={`badge ${instructor.status ? 'bg-success' : 'bg-danger'}`}>
                            {instructor.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-nowrap">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => setSelectedInstructor(instructor)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            {instructor.totalPayment > 0 && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success me-1"
                                  onClick={() => handlePayment(instructor)}
                                  title="Process Payment"
                                >
                                  <MdPayment />
                                </button>
                                {instructor.paymentStatus === 'unpaid' && (
                                  <button
                                    className="btn btn-sm btn-outline-info me-1"
                                    onClick={() => updatePaymentStatus(instructor.id, 'paid')}
                                    title="Mark as Paid"
                                    disabled={updatingStatus === instructor.id}
                                  >
                                    {updatingStatus === instructor.id ? (
                                      <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                      <FaCheck />
                                    )}
                                  </button>
                                )}
                                {instructor.paymentStatus === 'paid' && (
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => updatePaymentStatus(instructor.id, 'unpaid')}
                                    title="Mark as Unpaid"
                                    disabled={updatingStatus === instructor.id}
                                  >
                                    {updatingStatus === instructor.id ? (
                                      <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                      <FaTimes />
                                    )}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Instructor Details Modal */}
            {selectedInstructor && (
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
                  onClick={() => setSelectedInstructor(null)}
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
                  aria-labelledby="instructorDetailsModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h5 className="modal-title" id="instructorDetailsModalLabel">
                          <FaUser className="me-2" />
                          {selectedInstructor.name} - Payroll Details
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setSelectedInstructor(null)}
                          aria-label="Close"
                        >
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="modal-body">
                        <div className="row">
                          <div className="col-md-6">
                            <h6>Basic Information</h6>
                            <p><strong>Email:</strong> {selectedInstructor.email}</p>
                            <p><strong>Phone:</strong> {selectedInstructor.phone_number || 'N/A'}</p>
                            <p><strong>Payment Plan:</strong> <span className="text-capitalize">{selectedInstructor.payment_type || 'salary'}</span> (₹{selectedInstructor.payment_amount || selectedInstructor.price_per_hour || 0})</p>
                            <p><strong>Status:</strong>
                              <span className={`badge ms-2 ${selectedInstructor.status ? 'bg-success' : 'bg-danger'}`}>
                                {selectedInstructor.status ? 'Active' : 'Inactive'}
                              </span>
                            </p>
                          </div>
                          <div className="col-md-6">
                            <h6>Work Summary</h6>
                            <p><strong>Total Hours:</strong> {selectedInstructor.totalHours} hrs</p>
                            <p><strong>Total Payment:</strong> ₹{selectedInstructor.totalPayment.toFixed(2)}</p>
                            <p><strong>Payment Status:</strong>
                              <span className={`badge ms-2 ${selectedInstructor.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'
                                }`}>
                                {selectedInstructor.paymentStatus || 'unpaid'}
                              </span>
                            </p>
                            <p><strong>Completed Sessions:</strong> {selectedInstructor.completedSessions}</p>
                            <p><strong>Pending Sessions:</strong> {selectedInstructor.pendingSessions}</p>
                          </div>
                        </div>

                        <hr />

                        <div className="row">
                          <div className="col-md-6">
                            <h6><MdAssignment className="me-2" />Assigned Courses</h6>
                            {selectedInstructor.courses.length > 0 ? (
                              <ul className="list-group list-group-flush">
                                {selectedInstructor.courses.map((course, index) => (
                                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                    {course.course_title}
                                    <span className="badge bg-primary rounded-pill">
                                      {course.studentCount || 0} students
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted">No courses assigned</p>
                            )}
                          </div>
                          <div className="col-md-6">
                            <h6><MdSchedule className="me-2" />Assigned Batches</h6>
                            {selectedInstructor.batches.length > 0 ? (
                              <ul className="list-group list-group-flush">
                                {selectedInstructor.batches.map((batch, index) => (
                                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                    {batch.batch_name}
                                    <span className={`badge ${batch.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                      {batch.status}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted">No batches assigned</p>
                            )}
                          </div>
                        </div>

                        {selectedInstructor.liveSessions.length > 0 && (
                          <>
                            <hr />
                            <h6><FaClock className="me-2" />Recent Live Sessions</h6>
                            <div className="table-responsive">
                              <table className="table table-sm">
                                <thead>
                                  <tr>
                                    <th>Topic</th>
                                    <th>Date</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedInstructor.liveSessions.slice(0, 5).map((session, index) => (
                                    <tr key={index}>
                                      <td>{session.topic}</td>
                                      <td>{new Date(session.start_time).toLocaleDateString()}</td>
                                      <td>{session.duration} min</td>
                                      <td>
                                        <span className={`badge ${session.status === 'completed' ? 'bg-success' :
                                          session.status === 'ongoing' ? 'bg-warning' : 'bg-secondary'
                                          }`}>
                                          {session.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Modal Footer */}
                      <div className="modal-footer">
                        {selectedInstructor.totalPayment > 0 && (
                          <>
                            <button
                              className="btn btn-success me-2"
                              onClick={() => handlePayment(selectedInstructor)}
                            >
                              <MdPayment className="me-2" />
                              Process Payment (₹{selectedInstructor.totalPayment.toFixed(2)})
                            </button>
                            {selectedInstructor.paymentStatus === 'unpaid' && (
                              <button
                                className="btn btn-outline-success me-2"
                                onClick={() => updatePaymentStatus(selectedInstructor.id, 'paid')}
                                disabled={updatingStatus === selectedInstructor.id}
                              >
                                {updatingStatus === selectedInstructor.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <FaCheck className="me-2" />
                                    Mark as Paid
                                  </>
                                )}
                              </button>
                            )}
                            {selectedInstructor.paymentStatus === 'paid' && (
                              <button
                                className="btn btn-outline-secondary me-2"
                                onClick={() => updatePaymentStatus(selectedInstructor.id, 'unpaid')}
                                disabled={updatingStatus === selectedInstructor.id}
                              >
                                {updatingStatus === selectedInstructor.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <FaTimes className="me-2" />
                                    Mark as Unpaid
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        )}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setSelectedInstructor(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
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
                  onClick={() => setShowPaymentModal(false)}
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
                  aria-labelledby="paymentModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h5 className="modal-title" id="paymentModalLabel">
                          <FaCreditCard className="me-2" />
                          Process Payment
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowPaymentModal(false)}
                          aria-label="Close"
                        >
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Instructor</label>
                          <input
                            type="text"
                            className="form-control"
                            value={selectedInstructor?.name || ''}
                            readOnly
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Payment Amount (₹)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Payment Note (Optional)</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={paymentNote}
                            onChange={(e) => setPaymentNote(e.target.value)}
                            placeholder="Add any notes about this payment..."
                          ></textarea>
                        </div>
                        <div className="alert alert-info">
                          <strong>Payment Summary:</strong><br />
                          • Instructor: {selectedInstructor?.name}<br />
                          • Plan: <span className="text-capitalize">{selectedInstructor?.payment_type}</span><br />
                          • Base Rate/Amount: ₹{selectedInstructor?.payment_amount || selectedInstructor?.price_per_hour || 0}<br />
                          • Amount Due: ₹{selectedInstructor?.totalPayment.toFixed(2)}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={processPayment}
                          disabled={processingPayment || paymentAmount <= 0}
                        >
                          {processingPayment ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FaCreditCard className="me-2" />
                              Process Payment
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowPaymentModal(false)}
                          disabled={processingPayment}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default TenantPayroll;
