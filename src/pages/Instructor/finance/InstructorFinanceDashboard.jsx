import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import FinanceStatsCard from '../../../components/finance/FinanceStatsCard';
import FinanceFilters from '../../../components/finance/FinanceFilters';
import TransactionsTable from '../../../components/finance/TransactionsTable';
import { FaBalanceScale, FaClock, FaChalkboardTeacher, FaCalendarCheck, FaMoneyBillWave, FaWallet } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from '../../../redux/user.slice';

const InstructorFinanceDashboard = () => {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!user) {
            dispatch(fetchUser());
        }
    }, [user, dispatch]);

    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const [stats, setStats] = useState({ totalHours: 0, totalClasses: 0 });
    const [logs, setLogs] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState('pending');

    const [breakdownPeriod, setBreakdownPeriod] = useState('month');
    const [breakdownData, setBreakdownData] = useState([]);
    const [breakdownSummary, setBreakdownSummary] = useState({
        totalHours: 0,
        totalClasses: 0,
        plannedHours: 0,
        plannedClasses: 0,
        varianceHours: 0
    });

    const [logPeriod, setLogPeriod] = useState('month');
    const formatHours = (value) => `${Number(value || 0).toFixed(2)} hrs`;
    const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value || 0));

    useEffect(() => {
        if (user) {
            fetchBreakdown();
        }
    }, [user, breakdownPeriod, month, year]);

    const fetchBreakdown = async () => {
        try {
            const url = `/finance/instructor/breakdown?period=${breakdownPeriod}&month=${month}&year=${year}`;
            const res = await api.get(url);
            if (res.data.success) {
                setBreakdownData(res.data.batchWise || res.data.breakdown?.batchWise || []);
                setBreakdownSummary({
                    totalHours: res.data.totalHours || 0,
                    totalClasses: res.data.totalClasses || 0,
                    plannedHours: res.data.plannedHours || 0,
                    plannedClasses: res.data.plannedClasses || 0,
                    varianceHours: res.data.varianceHours || 0
                });
            }
        } catch (error) {
            console.error("Failed to load breakdown", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchLogs();
        }
    }, [user, logPeriod, month, year]);

    const fetchLogs = async () => {
        try {
            const logsRes = await api.get(`/finance/instructor/logs?month=${month}&year=${year}&period=${logPeriod}&limit=100`);
            if (logsRes.data.success) {
                setLogs(logsRes.data.logs);
            }
        } catch (error) {
            console.error("Failed to fetch instructor logs", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, month, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Earnings Summary
            const earningsRes = await api.get(`/finance/instructor/my-earnings?month=${month}&year=${year}`);
            if (earningsRes.data.success) {
                setStats(earningsRes.data.summary);
                setPaymentStatus(earningsRes.data.paymentStatus);
            }

        } catch (error) {
            console.error("Failed to fetch instructor finance data", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ padding: '20px' }}>Loading...</div>;

    // Inline Styles
    const containerStyle = {
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif"
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return '#10b981';
            case 'completed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'unpaid': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const actualHours = breakdownSummary.totalHours || stats.totalHours || 0;
    const actualClasses = breakdownSummary.totalClasses || stats.totalClasses || 0;

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>My Earnings & Logs</h1>
                    <p style={{ color: '#6b7280', margin: 0 }}>Track your teaching hours and monthly earnings.</p>
                </div>
                <FinanceFilters
                    month={month}
                    year={year}
                    onMonthChange={setMonth}
                    onYearChange={setYear}
                />
            </div>

            {/* Top Cards */}
            <div style={gridStyle}>
                <FinanceStatsCard
                    title="Total Conducted Time"
                    value={formatHours(actualHours)}
                    icon={<FaClock />}
                    color="#3b82f6"
                    subtext={`${actualClasses} classes`}
                    size="sm"
                />
                <FinanceStatsCard
                    title="Hourly Rate"
                    value={`${formatCurrency(stats.hourlyRate || 0)}/hr`}
                    icon={<FaWallet />}
                    color="#f59e0b"
                    subtext="Current rate"
                    size="sm"
                />
                <FinanceStatsCard
                    title="Total Earnings"
                    value={formatCurrency(stats.estimatedEarnings || 0)}
                    icon={<FaMoneyBillWave />}
                    color="#10b981"
                    subtext="Selected month (estimated)"
                    size="sm"
                />
                <FinanceStatsCard
                    title="Planned Time"
                    value={formatHours(breakdownSummary.plannedHours)}
                    icon={<FaChalkboardTeacher />}
                    color="#8b5cf6"
                    subtext={`${breakdownSummary.plannedClasses || 0} planned classes`}
                    size="sm"
                />
                <FinanceStatsCard
                    title="Variance"
                    value={formatHours(breakdownSummary.varianceHours)}
                    icon={<FaBalanceScale />}
                    color={breakdownSummary.varianceHours >= 0 ? '#10b981' : '#ef4444'}
                    subtext="Actual - Planned"
                    size="sm"
                />
                <FinanceStatsCard
                    title="Payment Status"
                    value={(paymentStatus || 'pending').toUpperCase().replace('_', ' ')}
                    icon={<FaCalendarCheck />}
                    color={getStatusColor(paymentStatus)}
                    subtext="For Selected Month"
                    size="sm"
                />
            </div>

            {/* Employment & Batch Details */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>

                    {/* Employment Card */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Employment Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6b7280', fontSize: '14px' }}>Salary Type</span>
                                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{stats.salaryType || 'Hourly'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6b7280', fontSize: '14px' }}>Contracted Hours</span>
                                <span style={{ fontWeight: '600' }}>{stats.contractedHours || 0} hrs/month</span>
                            </div>
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Progress (Conducted / Contracted)</div>
                                <div style={{ width: '100%', background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min((actualHours / (stats.contractedHours || 1)) * 100, 100)}%`,
                                        background: '#3b82f6',
                                        height: '100%'
                                    }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Batch Performance Card */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Batch Performance</h3>
                            <select
                                value={breakdownPeriod}
                                onChange={(e) => setBreakdownPeriod(e.target.value)}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', background: '#f9fafb', cursor: 'pointer' }}
                            >
                                <option value="day">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="total">All Time</option>
                            </select>
                        </div>
                        <div style={{ overflowX: 'auto', flex: 1 }}>
                            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ color: '#9ca3af', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ paddingBottom: '8px', fontWeight: '500' }}>Batch</th>
                                        <th style={{ paddingBottom: '8px', fontWeight: '500', textAlign: 'center' }}>Classes</th>
                                        <th style={{ paddingBottom: '8px', fontWeight: '500', textAlign: 'right' }}>Conducted (Hr)</th>
                                        <th style={{ paddingBottom: '8px', fontWeight: '500', textAlign: 'right' }}>Planned (Hr)</th>
                                        <th style={{ paddingBottom: '8px', fontWeight: '500', textAlign: 'right' }}>Variance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdownData && breakdownData.length > 0 ? breakdownData.map((b, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                                            <td style={{ padding: '12px 0', fontWeight: '500', color: '#374151' }}>{b.batchName}</td>
                                            <td style={{ padding: '12px 0', textAlign: 'center', color: '#6b7280' }}>
                                                <div>{b.classes || 0}</div>
                                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{b.plannedClasses || 0} planned</div>
                                            </td>
                                            <td style={{ padding: '12px 0', textAlign: 'right', color: '#10b981', fontWeight: '600' }}>
                                                {Number(b.hours || 0).toFixed(2)}h
                                            </td>
                                            <td style={{ padding: '12px 0', textAlign: 'right', color: '#6b7280', fontWeight: '600' }}>
                                                {Number(b.plannedHours || 0).toFixed(2)}h
                                            </td>
                                            <td style={{ padding: '12px 0', textAlign: 'right', color: (b.varianceHours || 0) >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                                                {Number(b.varianceHours || 0).toFixed(2)}h
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" style={{ padding: '24px 0', color: '#9ca3af', textAlign: 'center' }}>No classes conducted {breakdownPeriod === 'total' ? 'ever' : `this ${breakdownPeriod}`}.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* Logs Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Detailed Class Log</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Every session is automatically recorded here.</p>
                    </div>
                    <select
                        value={logPeriod}
                        onChange={(e) => setLogPeriod(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', background: '#f9fafb', cursor: 'pointer' }}
                    >
                        <option value="day">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="total">All Time</option>
                    </select>
                </div>
                <div>
                    <TransactionsTable
                        data={logs}
                        type="log"
                    />
                </div>
            </div>
        </div >
    );
};

export default InstructorFinanceDashboard;
