
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInstructorPayments } from '../../redux/instructor/instructor.slice';
import { FaMoneyBillWave, FaCalendarAlt, FaChartLine, FaWallet } from 'react-icons/fa';

const InstructorEarnings = () => {
    const dispatch = useDispatch();
    const { instructorPayments, instructorPaymentsLoading, instructorPaymentsError } = useSelector((state) => state.instructor);

    useEffect(() => {
        dispatch(fetchInstructorPayments());
    }, [dispatch]);

    const currencyFormatter = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    if (instructorPaymentsLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (instructorPaymentsError) {
        return (
            <div className="alert alert-danger m-4" role="alert">
                {instructorPaymentsError}
            </div>
        );
    }

    const { stats, dailyWork, monthlyBreakdown, pricing } = instructorPayments || {};

    return (
        <div className="container-fluid p-4">
            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                                    <FaChartLine size={24} />
                                </div>
                            </div>
                            <h6 className="card-title mb-1 text-white-50">Total Earnings</h6>
                            <h3 className="mb-0 fw-bold">{currencyFormatter(stats?.totalEarnings || 0)}</h3>
                            <small className="text-white-50">Lifetime</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                                    <FaMoneyBillWave size={24} />
                                </div>
                            </div>
                            <h6 className="card-title mb-1 text-white-50">This Month</h6>
                            <h3 className="mb-0 fw-bold">{currencyFormatter(stats?.currentMonthEarnings || 0)}</h3>
                            <small className="text-white-50">Earnings</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                                    <FaCalendarAlt size={24} />
                                </div>
                            </div>
                            <h6 className="card-title mb-1 text-white-50">Total Hours</h6>
                            <h3 className="mb-0 fw-bold">{stats?.totalHours || 0} hrs</h3>
                            <small className="text-white-50">Approved Work</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                                    <FaWallet size={24} />
                                </div>
                            </div>
                            <h6 className="card-title mb-1 text-white-50">Rate</h6>
                            <h3 className="mb-0 fw-bold">{currencyFormatter(pricing?.price_per_hour || 0)}/hr</h3>
                            <small className="text-white-50">Current Rate</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Daily Work Log */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">Recent Daily Work</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4">Date</th>
                                            <th>Hours</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyWork && dailyWork.length > 0 ? (
                                            dailyWork.map((work, index) => (
                                                <tr key={index}>
                                                    <td className="ps-4">
                                                        <div className="fw-semibold">{new Date(work.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border">
                                                            {work.hours} hrs
                                                        </span>
                                                    </td>
                                                    <td className="fw-bold text-success">
                                                        {currencyFormatter(work.amount)}
                                                    </td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${work.status === 'paid' ? 'bg-success' :
                                                                work.status === 'approved' ? 'bg-info' : 'bg-warning text-dark'
                                                            }`}>
                                                            {work.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-muted">No work records found for this month</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Summary */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">Monthly History</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="list-group list-group-flush">
                                {monthlyBreakdown && monthlyBreakdown.length > 0 ? (
                                    monthlyBreakdown.map((month, index) => (
                                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <h6 className="mb-1 fw-bold">{month.month}</h6>
                                                <small className="text-muted">{month.hours} Approved Hours</small>
                                            </div>
                                            <span className="fw-bold text-primary">{currencyFormatter(month.amount)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-muted">No history available</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorEarnings;
