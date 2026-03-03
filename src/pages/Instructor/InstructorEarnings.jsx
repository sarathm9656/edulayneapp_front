
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInstructorPayments, fetchPlannedHoursReport } from '../../redux/instructor/instructor.slice';
import { FaMoneyBillWave, FaCalendarAlt, FaChartLine, FaWallet, FaClock } from 'react-icons/fa';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import moment from 'moment';

const InstructorEarnings = () => {
    const dispatch = useDispatch();
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());

    const {
        instructorPayments,
        instructorPaymentsLoading,
        instructorPaymentsError,
        plannedHoursReport,
        plannedHoursLoading
    } = useSelector((state) => state.instructor);

    useEffect(() => {
        dispatch(fetchInstructorPayments({ month, year }));

        // Fetch planned hours for the current month range
        const startDate = moment([year, month - 1]).startOf('month').format('YYYY-MM-DD');
        const endDate = moment([year, month - 1]).endOf('month').format('YYYY-MM-DD');
        dispatch(fetchPlannedHoursReport({ startDate, endDate }));
    }, [dispatch, month, year]);

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

    const { summary, paymentStatus } = instructorPayments || {};
    console.log("Instructor Earnings Data:", { summary, paymentStatus });

    const salaryType = summary?.salaryType || 'hourly';
    const contractedHours = Number(summary?.contractedHours || 0);
    const actualHours = Number(summary?.totalHours || 0);
    const plannedHours = Number(plannedHoursReport?.totalHours || 0);

    const stats = {
        totalEarnings: 0,
        currentMonthEarnings: summary?.estimatedEarnings || 0,
        totalHours: summary?.totalHours || 0
    };

    const pricing = {
        price_per_hour: summary?.hourlyRate || 0
    };

    const contractedTargetPayout =
        salaryType === 'hourly' ? Number((contractedHours * (pricing.price_per_hour || 0)).toFixed(2)) : 0;
    const utilizationPct =
        contractedHours > 0 ? Math.round((actualHours / contractedHours) * 100) : null;
    const remainingContractedHours =
        contractedHours > 0 ? Math.max(0, Number((contractedHours - actualHours).toFixed(2))) : 0;

    const dailyWork = summary?.dailyLog?.map(log => ({
        date: log.date || new Date().toISOString(),
        hours: log.hours || 0,
        amount: log.earnings || 0,
        status: paymentStatus === 'completed' ? 'paid' : (log.classes && log.classes.some(c => c.status === 'completed') ? 'approved' : 'pending'),
        classes: Array.isArray(log.classes) ? log.classes : [] // Ensure classes is an array
    })) || [];

    const chartData = dailyWork
        .map(d => ({
            ...d,
            day: moment(d.date).isValid() ? moment(d.date).format('DD MMM') : String(d.date),
            earnings: d.amount
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const monthlyBreakdown = Array.isArray(summary?.monthlyBreakdown) ? summary.monthlyBreakdown : [];

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-0">My Earnings</h2>
                    <p className="text-muted">Track your teaching sessions and payouts</p>
                </div>
                <div className="d-flex gap-3">
                    <select
                        className="form-select border-0 shadow-sm"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        style={{ width: '150px' }}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select
                        className="form-select border-0 shadow-sm"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        style={{ width: '120px' }}
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

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
                            <h6 className="card-title mb-1 text-white-50">Contracted Target</h6>
                            <h3 className="mb-0 fw-bold">{contractedHours} hrs</h3>
                            <small className="text-white-50">
                                {salaryType === 'hourly'
                                    ? `${currencyFormatter(contractedTargetPayout)} target`
                                    : 'Target set by tenant'}
                                {utilizationPct !== null ? ` • ${utilizationPct}% utilized` : ''}
                            </small>
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
                                    <FaClock size={24} />
                                </div>
                            </div>
                            <h6 className="card-title mb-1 text-white-50">Monthly Hours</h6>
                            <h3 className="mb-0 fw-bold">{actualHours} / {contractedHours || 0}</h3>
                            <small className="text-white-50">
                                Actual / Contracted{plannedHours ? ` • Planned ${plannedHours}` : ''}
                                {contractedHours > 0 ? ` • ${remainingContractedHours}h left` : ''}
                            </small>
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
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0 fw-bold text-dark">Hours & Earnings</h5>
                                <small className="text-muted">Day-wise chart for the selected month</small>
                            </div>
                            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                                {moment([year, month - 1]).format('MMM YYYY')}
                            </span>
                        </div>
                        <div className="card-body">
                            {chartData.length > 0 ? (
                                <div style={{ width: '100%', height: 280 }}>
                                    <ResponsiveContainer>
                                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                            <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}h`} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                                            <Tooltip
                                                formatter={(value, name) => {
                                                    if (name === 'Hours') return [`${Number(value || 0).toFixed(2)} hrs`, name];
                                                    return [currencyFormatter(value || 0), name];
                                                }}
                                                labelFormatter={(label) => `Date: ${label}`}
                                            />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="hours" name="Hours" fill="#0d6efd" radius={[6, 6, 0, 0]} />
                                            <Line yAxisId="right" dataKey="earnings" name="Earnings" stroke="#198754" strokeWidth={2} dot={false} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    No sessions found for this month.
                                </div>
                            )}

                            <div className="d-flex flex-wrap gap-3 mt-3 small">
                                <div className="text-muted">
                                    Contracted: <span className="fw-semibold text-dark">{contractedHours} hrs</span>
                                </div>
                                <div className="text-muted">
                                    Actual: <span className="fw-semibold text-dark">{actualHours} hrs</span>
                                </div>
                                <div className="text-muted">
                                    Hourly Rate: <span className="fw-semibold text-dark">{currencyFormatter(pricing.price_per_hour || 0)}/hr</span>
                                </div>
                                {salaryType === 'hourly' && contractedHours > 0 && (
                                    <div className="text-muted">
                                        Target Payout: <span className="fw-semibold text-dark">{currencyFormatter(contractedTargetPayout)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-dark">Recent Activity</h5>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                                {dailyWork.length} Days Active
                            </span>
                        </div>
                        <div className="card-body p-0">
                            {dailyWork && dailyWork.length > 0 ? (
                                <div className="accordion accordion-flush" id="dailyWorkAccordion">
                                    {dailyWork.map((work, index) => (
                                        <div className="accordion-item border-bottom" key={index}>
                                            <h2 className="accordion-header">
                                                <button
                                                    className="accordion-button bg-white py-4"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#collapse${index}`}
                                                    aria-expanded="true"
                                                >
                                                    <div className="d-flex justify-content-between align-items-center w-100 pe-4">
                                                        <div className="d-flex align-items-center">
                                                            <div className="date-badge bg-light rounded-3 p-2 text-center me-3" style={{ minWidth: '60px' }}>
                                                                <div className="small text-muted text-uppercase" style={{ fontSize: '10px' }}>
                                                                    {new Date(work.date).toLocaleString('default', { month: 'short' })}
                                                                </div>
                                                                <div className="fw-bold fs-5">
                                                                    {new Date(work.date).getDate()}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold text-dark">
                                                                    {new Date(work.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                                                </div>
                                                                <div className="small text-muted">
                                                                    {work.classes.length} {work.classes.length === 1 ? 'Session' : 'Sessions'} conducted
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="fw-bold fs-5 text-primary">{work.hours} <span className="small fw-normal">hrs</span></div>
                                                            <div className="small text-success fw-semibold">{currencyFormatter(work.amount)}</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            </h2>
                                            <div
                                                id={`collapse${index}`}
                                                className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                                data-bs-parent="#dailyWorkAccordion"
                                            >
                                                <div className="accordion-body bg-light bg-opacity-25 pb-4">
                                                    <div className="list-group list-group-flush rounded-3 border overflow-hidden bg-white mt-2">
                                                        {work.classes.map((cls, idx) => (
                                                            <div className="list-group-item py-3" key={idx}>
                                                                <div className="row align-items-center g-3">
                                                                    <div className="col-md-5">
                                                                        <div className="fw-bold text-dark mb-1">{cls.topic || 'Regular Session'}</div>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill" style={{ fontSize: '0.7rem' }}>
                                                                                {cls.batchName}
                                                                            </span>
                                                                            <span className={`badge rounded-pill ${cls.status === 'completed' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'}`} style={{ fontSize: '0.7rem' }}>
                                                                                {cls.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                                            <i className="fa-regular fa-clock text-muted small"></i>
                                                                            <span className="small fw-semibold">
                                                                                {cls.start_time ? new Date(cls.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                                                {' - '}
                                                                                {cls.end_time ? new Date(cls.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="ms-4 small text-muted">
                                                                            Actual Time: {(cls.duration / 60).toFixed(0)} mins
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-3 text-md-end">
                                                                        <div className="fw-bold text-dark">{cls.durationHours} hrs</div>
                                                                        <div className="small text-muted">
                                                                            {pricing.price_per_hour > 0 &&
                                                                                currencyFormatter((cls.duration / 3600) * pricing.price_per_hour)
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="mb-3 text-muted">
                                        <i className="fa-solid fa-calendar-xmark fa-3x opacity-25"></i>
                                    </div>
                                    <h6 className="text-muted fw-normal">No activity found for this period</h6>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weekly Planned Breakdown */}
                    {plannedHoursReport?.weekly?.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-0 py-3">
                                <h5 className="mb-0 fw-bold text-dark">Weekly Schedule Overview</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {plannedHoursReport.weekly.map((week, idx) => (
                                        <div className="col-md-4" key={idx}>
                                            <div className="p-3 border rounded-3 bg-light bg-opacity-50">
                                                <div className="small text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>{week.week}</div>
                                                <div className="d-flex justify-content-between align-items-end">
                                                    <h4 className="mb-0 fw-bold text-primary">{week.hours} <span className="small fw-normal text-muted">hrs</span></h4>
                                                    <i className="fa-solid fa-calendar-check text-primary opacity-25 fa-2x"></i>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Monthly Summary */}
                <div className="col-lg-4">
                    {/* Settlement / Monthly Summary */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold text-dark">Monthly Breakdown</h5>
                        </div>
                        <div className="card-body">
                            <div className="p-3 bg-light rounded-4 mb-3 border border-dashed border-2">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="text-muted small">Status</span>
                                    <span className={`badge rounded-pill ${paymentStatus === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                        {paymentStatus?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">Total Worked</span>
                                    <span className="fw-bold">{stats.totalHours} hrs</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">Hourly Rate</span>
                                    <span className="fw-bold">{currencyFormatter(pricing.price_per_hour)}/hr</span>
                                </div>
                                <hr className="my-3 opacity-10" />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-dark fw-bold">Settlement</span>
                                    <span className="fs-5 fw-bold text-primary">{currencyFormatter(stats.currentMonthEarnings)}</span>
                                </div>
                            </div>

                            {summary?.batches?.length > 0 && (
                                <div className="mt-4">
                                    <h6 className="small fw-bold text-muted text-uppercase mb-3" style={{ letterSpacing: '1px' }}>Hours by Batch</h6>
                                    {summary.batches.map((batch, idx) => (
                                        <div className="mb-3" key={idx}>
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span className="text-truncate" style={{ maxWidth: '70%' }}>{batch.batchName}</span>
                                                <span className="fw-bold">{batch.conductedHours} / {batch.expectedHours} hrs</span>
                                            </div>
                                            <div className="progress rounded-pill" style={{ height: '6px' }}>
                                                <div
                                                    className={`progress-bar rounded-pill ${batch.conductedHours >= batch.expectedHours ? 'bg-success' : 'bg-primary'}`}
                                                    style={{ width: `${Math.min((batch.conductedHours / (batch.expectedHours || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
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
