import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import FinanceStatsCard from '../../../components/finance/FinanceStatsCard';
import FinanceFilters from '../../../components/finance/FinanceFilters';
import TransactionsTable from '../../../components/finance/TransactionsTable';
import { FaChalkboardTeacher, FaClock, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { useSelector } from 'react-redux';

const TenantFinanceDashboard = () => {
    const user = useSelector((state) => state.user.user);

    // Debug Logging
    useEffect(() => {
        console.log("TenantDashboard Debug - User:", user);
    }, [user]);

    // Robust Tenant ID Extraction
    const tenantId = user?.tenant_id?._id || user?.tenant_id || user?.tenantId || (user?.role === 'tenant' ? user?._id : null);

    console.log("TenantDashboard Debug - Resolved TenantID:", tenantId);

    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState('overview');

    const [summary, setSummary] = useState({ totalHours: 0, totalClasses: 0, instructorCount: 0 });
    const [instructors, setInstructors] = useState([]);
    const [logs, setLogs] = useState([]);
    const [dailyData, setDailyData] = useState([]);

    useEffect(() => {
        if (tenantId) {
            fetchData();
        }
    }, [tenantId, month, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const summaryRes = await api.get(`/finance/tenant/summary/${tenantId}?month=${month}&year=${year}`);
            if (summaryRes.data.success) {
                setSummary(summaryRes.data.usage);
            }

            const instrRes = await api.get(`/finance/tenant/instructors/${tenantId}?month=${month}&year=${year}`);
            if (instrRes.data.success) {
                setInstructors(instrRes.data.instructors);
            }

            const logsRes = await api.get(`/finance/tenant/logs/${tenantId}?month=${month}&year=${year}&limit=1000`);
            if (logsRes.data.success) {
                setLogs(logsRes.data.logs);
                processDailyChart(logsRes.data.logs);
            }

        } catch (error) {
            console.error("Failed to fetch finance data", error);
        } finally {
            setLoading(false);
        }
    };

    const processDailyChart = (logsData) => {
        const daysInMonth = new Date(year, month, 0).getDate();
        const data = [];
        for (let i = 1; i <= daysInMonth; i++) {
            data.push({
                day: i,
                hours: 0,
                date: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
            });
        }
        logsData.forEach(log => {
            const logDate = moment(log.actual_start_time).date();
            const dayEntry = data.find(d => d.day === logDate);
            if (dayEntry) {
                dayEntry.hours += (log.duration_minutes / 60);
            }
        });
        data.forEach(d => d.hours = parseFloat(d.hours.toFixed(2)));
        setDailyData(data);
    };

    if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading User Profile...</div>;
    if (!tenantId) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error: Tenant ID not found in user profile. Please contact support.</div>;
    if (loading && !summary.totalHours) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Finance Data...</div>;

    // Inline Styles
    const containerStyle = {
        padding: '24px',
        backgroundColor: '#f3f4f6', // gray-50
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

    const mainContentGrid = {
        display: 'grid',
        gridTemplateColumns: '3fr 1fr',
        gap: '32px'
    };

    // Responsive fallback
    const isMobile = window.innerWidth <= 768;

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Finance & Analytics</h1>
                    <p style={{ color: '#6b7280', margin: 0 }}>Track hours, classes, and instructor payouts.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={async () => {
                            if (!window.confirm("Sync historical data from Dyte? This may take a moment.")) return;
                            try {
                                const res = await api.post('/finance/tenant/sync/dyte');
                                alert(res.data.message);
                                fetchData(); // Reload data
                            } catch (e) {
                                alert("Sync failed: " + (e.response?.data?.message || e.message));
                            }
                        }}
                        style={{
                            padding: '8px 16px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        Sync Dyte Data
                    </button>
                    <FinanceFilters
                        month={month}
                        year={year}
                        onMonthChange={setMonth}
                        onYearChange={setYear}
                    />
                </div>
            </div>

            {/* Top Cards */}
            <div style={gridStyle}>
                <FinanceStatsCard
                    title="Total Hours"
                    value={summary.totalHours}
                    icon={<FaClock />}
                    color="#6366f1"
                    subtext="This Month"
                />
                <FinanceStatsCard
                    title="Total Classes"
                    value={summary.totalClasses}
                    icon={<FaChalkboardTeacher />}
                    color="#8b5cf6"
                    subtext="Completed Sessions"
                />
                <FinanceStatsCard
                    title="Active Instructors"
                    value={summary.instructorCount}
                    icon={<FaUsers />}
                    color="#10b981"
                />
                <FinanceStatsCard
                    title="Estimated Cost"
                    value={`₹${(summary.totalHours * 500).toLocaleString()}`}
                    icon={<FaMoneyBillWave />}
                    color="#f59e0b"
                    subtext="Approx. Calculation"
                />
            </div>

            {/* Main Content Area */}
            <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '24px' } : mainContentGrid}>

                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Chart Section */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Daily Teaching Activity</h3>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`${value} hrs`, 'Hours Taught']}
                                        labelFormatter={(label) => `${moment(`${year}-${month}-${label}`, 'YYYY-M-D').format('MMM Do, YYYY')}`}
                                    />
                                    <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tabs & Table */}
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                            <button
                                style={{
                                    padding: '16px 24px',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: activeTab === 'overview' ? '#2563eb' : '#6b7280',
                                    borderBottom: activeTab === 'overview' ? '2px solid #2563eb' : '2px solid transparent'
                                }}
                                onClick={() => setActiveTab('overview')}
                            >
                                Instructor Overview
                            </button>
                            <button
                                style={{
                                    padding: '16px 24px',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: activeTab === 'logs' ? '#2563eb' : '#6b7280',
                                    borderBottom: activeTab === 'logs' ? '2px solid #2563eb' : '2px solid transparent'
                                }}
                                onClick={() => setActiveTab('logs')}
                            >
                                Detailed Logs
                            </button>
                        </div>

                        <div>
                            {activeTab === 'overview' ? (
                                <TransactionsTable
                                    data={instructors}
                                    type="summary"
                                />
                            ) : (
                                <TransactionsTable
                                    data={logs}
                                    type="log"
                                />
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Export Reports</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Download financial reports for offline processing.</p>
                        <button style={{ width: '100%', padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', color: '#374151', fontWeight: '500', cursor: 'pointer', marginBottom: '12px' }}>
                            Download PDF Report
                        </button>
                        <button style={{ width: '100%', padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', color: '#374151', fontWeight: '500', cursor: 'pointer' }}>
                            Export CSV
                        </button>
                    </div>

                    <div style={{ background: '#eef2ff', padding: '24px', borderRadius: '12px', border: '1px solid #e0e7ff' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#312e81', marginBottom: '8px' }}>Did you know?</h3>
                        <p style={{ fontSize: '14px', color: '#4338ca', lineHeight: '1.5' }}>
                            Hours are automatically calculated from Dyte meeting durations.
                            Manual adjustments are disabled to ensure data integrity.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TenantFinanceDashboard;
