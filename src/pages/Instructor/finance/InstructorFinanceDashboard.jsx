import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import FinanceStatsCard from '../../../components/finance/FinanceStatsCard';
import FinanceFilters from '../../../components/finance/FinanceFilters';
import TransactionsTable from '../../../components/finance/TransactionsTable';
import { FaClock, FaChalkboardTeacher, FaCalendarCheck } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const InstructorFinanceDashboard = () => {
    const user = useSelector((state) => state.user.user);
    console.log("InstructorDashboard - User:", user);

    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const [stats, setStats] = useState({ totalHours: 0, totalClasses: 0 });
    const [logs, setLogs] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState('pending');

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

            // 2. Fetch My Logs
            const logsRes = await api.get(`/finance/instructor/logs?month=${month}&year=${year}&limit=100`);
            if (logsRes.data.success) {
                setLogs(logsRes.data.logs);
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
            case 'completed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'unpaid': return '#ef4444';
            default: return '#6b7280';
        }
    };

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
                    title="Total Hours Taught"
                    value={stats.totalHours}
                    icon={<FaClock />}
                    color="#3b82f6"
                    subtext="This Month"
                />
                <FinanceStatsCard
                    title="Classes Conducted"
                    value={stats.totalClasses}
                    icon={<FaChalkboardTeacher />}
                    color="#8b5cf6"
                    subtext="Completed Sessions"
                />
                <FinanceStatsCard
                    title="Payment Status"
                    value={paymentStatus.toUpperCase().replace('_', ' ')}
                    icon={<FaCalendarCheck />}
                    color={getStatusColor(paymentStatus)}
                    subtext="For Selected Month"
                />
            </div>

            {/* Logs Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Detailed Class Log</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Every session is automatically recorded here.</p>
                </div>
                <div>
                    <TransactionsTable
                        data={logs}
                        type="log"
                    />
                </div>
            </div>
        </div>
    );
};

export default InstructorFinanceDashboard;
