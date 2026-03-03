import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { FaUser, FaClock, FaSearch, FaFilter, FaDownload, FaEye, FaCheck, FaTimes, FaCalendarCheck } from "react-icons/fa";
import { MdPayment, MdAssignment, MdSchedule } from "react-icons/md";
import moment from "moment";

const TenantPayroll = () => {
  const { tenant } = useSelector((state) => state.tenant);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Date Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [plannedHoursData, setPlannedHoursData] = useState({});
  const [loadingPlanned, setLoadingPlanned] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (tenant?._id) {
      fetchPayrollData();
      fetchTenantPlannedHours();
    }
  }, [tenant, selectedMonth, selectedYear]);

  const fetchTenantPlannedHours = async () => {
    try {
      setLoadingPlanned(true);
      const startDate = moment([selectedYear, selectedMonth - 1]).startOf('month').format('YYYY-MM-DD');
      const endDate = moment([selectedYear, selectedMonth - 1]).endOf('month').format('YYYY-MM-DD');

      // For instructors in the list, fetch their planned hours
      // We can do this in parallel or just fetch for all at once if supported
      // Let's assume we fetch sequentially or use a combined endpoint if we had one.
      // Since it's tenant side, we can Loop through instructors once payroll data is fetched
    } catch (error) {
      console.error("Error fetching planned hours:", error);
    } finally {
      setLoadingPlanned(false);
    }
  };

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/finance/tenant/instructors/${tenant._id}?month=${selectedMonth}&year=${selectedYear}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Map backend finance data to frontend structure
        const mappedData = response.data.instructors.map(inst => ({
          id: inst._id,
          name: inst.instructorName,
          email: inst.instructorEmail,
          phone_number: inst.phone,

          payment_type: inst.salaryType,
          price_per_hour: inst.hourlyRate,
          payment_amount: inst.fixedSalary || inst.hourlyRate, // For display

          totalHours: inst.totalConductedHours,
          totalPayment: inst.calculatedPayout,
          paymentStatus: inst.paymentStatus,
          status: true,

          completedSessions: inst.totalClasses,
          pendingSessions: 0,

          batches: inst.batches || [],
          courses: []
        }));
        setInstructors(mappedData);

        // Fetch planned hours for each instructor
        const startDate = moment([selectedYear, selectedMonth - 1]).startOf('month').format('YYYY-MM-DD');
        const endDate = moment([selectedYear, selectedMonth - 1]).endOf('month').format('YYYY-MM-DD');

        mappedData.forEach(async (inst) => {
          try {
            const resp = await axios.get(
              `${API_URL}/batch/reports/planned-hours?instructor_id=${inst.id}&startDate=${startDate}&endDate=${endDate}`,
              { withCredentials: true }
            );
            if (resp.data.success) {
              setPlannedHoursData(prev => ({ ...prev, [inst.id]: resp.data.data }));
            }
          } catch (e) {
            console.error(`Failed to fetch planned hours for ${inst.name}`, e);
          }
        });
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
      (filterStatus === "pending" && instructor.paymentStatus === 'pending') || // specific to payment status now
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
      const response = await axios.post(
        `${API_URL}/finance/tenant/pay`,
        {
          tenantId: tenant._id,
          instructorId: selectedInstructor.id,
          amount: paymentAmount,
          paymentMethod: 'manual',
          note: paymentNote,
          month: selectedMonth,
          year: selectedYear,
          status: 'paid',
          // Generate a transaction ID for manual payments
          transactionId: `TXN-MANUAL-${Date.now()}`
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Payment recorded successfully for ${selectedInstructor.name}`);
        setShowPaymentModal(false);
        setPaymentNote("");
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
      // We use the same pay endpoint but maybe without amount update if just toggling status?
      // Actually, standardizing on recording payment for status changes is safer.
      // But if we just want to mark unpaid, we might set amount to 0 or keep it?
      // Let's assume 'unpaid' means resetting the record.

      const instructor = instructors.find(i => i.id === instructorId);

      const response = await axios.post(
        `${API_URL}/finance/tenant/pay`,
        {
          tenantId: tenant._id,
          instructorId: instructorId,
          amount: instructor.totalPayment, // Keep the amount
          status: status,
          month: selectedMonth,
          year: selectedYear,
          transactionId: status === 'paid' ? `TXN-MANUAL-${Date.now()}` : ''
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Status updated to ${status}`);
        fetchPayrollData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const exportPayrollData = () => {
    const csvData = [
      ["Instructor Name", "Email", "Month", "Year", "Hourly Rate", "Total Hours", "Total Payment", "Payment Status", "Classes Executed"],
      ...filteredInstructors.map(instructor => [
        instructor.name,
        instructor.email,
        selectedMonth,
        selectedYear,
        `₹${instructor.price_per_hour || 0}`,
        instructor.totalHours,
        `₹${instructor.totalPayment}`,
        instructor.paymentStatus || 'unpaid',
        instructor.completedSessions
      ])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${selectedMonth}-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPayrollAmount = filteredInstructors.reduce((total, inst) => total + inst.totalPayment, 0);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  if (!tenant) return <div className="p-5 text-center">Loading Tenant Profile...</div>;

  return (
    <main className="container-wrapper-scroll">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">

            {/* Header / Stats */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">Payroll Management</h4>
                <p className="text-muted small mb-0">Manage instructor payouts and history</p>
              </div>
              <div className="text-end">
                <div className="h4 mb-1 text-success">₹{totalPayrollAmount.toFixed(2)}</div>
                <small className="text-muted">Total Payout ({months[selectedMonth - 1].label})</small>
              </div>
            </div>

            {/* Filters */}
            <div className="card mb-4 border-0 shadow-sm">
              <div className="card-body">
                <div className="row g-3">
                  {/* Month/Year Selection */}
                  <div className="col-md-2">
                    <label className="form-label small text-muted">Month</label>
                    <select
                      className="form-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small text-muted">Year</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-muted">Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search instructor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-muted">Status</label>
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <button className="btn btn-outline-primary w-100" onClick={exportPayrollData}>
                      <FaDownload className="me-2" /> CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading financial data...</p>
              </div>
            )}

            {/* Table */}
            {!loading && filteredInstructors.length > 0 && (
              <div className="table-responsive bg-white rounded shadow-sm p-3">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Instructor</th>
                      <th>Plan</th>
                      <th>Work Log</th>
                      <th>Payout</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstructors.map((inst) => (
                      <tr key={inst.id}>
                        <td>
                          <div className="fw-bold">{inst.name}</div>
                          <small className="text-muted">{inst.email}</small>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border text-capitalize me-2">
                            {inst.payment_type}
                          </span>
                          <span className="small text-muted">
                            ₹{inst.price_per_hour}/hr
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-column small">
                            <span className="fw-semibold">
                              <FaClock className="text-primary me-1" /> {inst.totalHours} / {plannedHoursData[inst.id]?.totalHours || 0} Hrs
                            </span>
                            <span className="text-muted">{inst.completedSessions} Classes</span>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-success">₹{inst.totalPayment.toFixed(2)}</div>
                        </td>
                        <td>
                          <span className={`badge ${inst.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {inst.paymentStatus || 'pending'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setSelectedInstructor(inst)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            {inst.totalPayment > 0 && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handlePayment(inst)}
                                title="Pay Info"
                              >
                                <MdPayment />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredInstructors.length === 0 && (
              <div className="text-center py-5 text-muted">
                <FaSearch className="fs-1 mb-3 opacity-25" />
                <p>No records found for this period.</p>
              </div>
            )}

            {/* View/Pay Modal */}
            {selectedInstructor && (
              <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{selectedInstructor.name} - {months[selectedMonth - 1].label} {selectedYear}</h5>
                      <button className="btn-close" onClick={() => setSelectedInstructor(null)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="row g-3 mb-4">
                        <div className="col-sm-4">
                          <div className="p-3 bg-light rounded shadow-sm border-start border-primary border-4">
                            <label className="small text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Calculated Salary</label>
                            <span className="fs-4 fw-bold text-primary">₹{selectedInstructor.totalPayment.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="p-3 bg-light rounded shadow-sm border-start border-info border-4">
                            <label className="small text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Conducted Hours</label>
                            <span className="fs-4 fw-bold text-info">{selectedInstructor.totalHours} hrs</span>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="p-3 bg-light rounded shadow-sm border-start border-warning border-4">
                            <label className="small text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Planned Hours</label>
                            <span className="fs-4 fw-bold text-warning">{plannedHoursData[selectedInstructor.id]?.totalHours || 0} hrs</span>
                          </div>
                        </div>
                      </div>


                      {plannedHoursData[selectedInstructor.id]?.weekly && (
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3 d-flex align-items-center">
                            <FaCalendarCheck className="me-2 text-primary" /> Weekly Schedule Overview
                          </h6>
                          <div className="row g-2">
                            {plannedHoursData[selectedInstructor.id].weekly.map((w, i) => (
                              <div className="col-md-3" key={i}>
                                <div className="p-2 border rounded text-center bg-white shadow-sm">
                                  <div className="small text-muted" style={{ fontSize: '0.6rem' }}>{w.week}</div>
                                  <div className="fw-bold text-primary">{w.hours} hrs</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <h6 className="fw-bold mb-3 border-bottom pb-2">Batch Breakdown</h6>
                      {selectedInstructor.batches && selectedInstructor.batches.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Batch</th>
                                <th className="text-center">Classes</th>
                                <th className="text-center">Hours</th>
                                <th className="text-end">Contribution</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedInstructor.batches.map((batch, idx) => (
                                <tr key={idx}>
                                  <td>{batch.batchName}</td>
                                  <td className="text-center">{batch.conductedClasses}</td>
                                  <td className="text-center">{batch.conductedHours}</td>
                                  <td className="text-end">
                                    {batch.batchId ?
                                      "₹" + Math.round(batch.conductedHours * selectedInstructor.price_per_hour)
                                      : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : <p className="text-muted">No batch data available.</p>}
                    </div>
                    <div className="modal-footer">
                      {selectedInstructor.paymentStatus !== 'paid' && selectedInstructor.totalPayment > 0 && (
                        <button className="btn btn-success" onClick={() => {
                          setSelectedInstructor(null);
                          handlePayment(selectedInstructor);
                        }}>
                          Proceed to Pay
                        </button>
                      )}
                      <button className="btn btn-secondary" onClick={() => setSelectedInstructor(null)}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Simple Payment Confirm Modal */}
            {showPaymentModal && (
              <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Record Payment</h5>
                      <button className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <p>Recording payment for <strong>{selectedInstructor?.name}</strong>.</p>
                      <div className="mb-3">
                        <label className="form-label">Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Note</label>
                        <textarea
                          className="form-control"
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          placeholder="Transaction ID or Bank Ref..."
                        ></textarea>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-success" onClick={processPayment} disabled={processingPayment}>
                        {processingPayment ? 'Processing...' : 'Confirm Paid'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main >
  );
};

export default TenantPayroll;
