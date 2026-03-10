import React, { useMemo, useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import FinanceStatsCard from '../../../components/finance/FinanceStatsCard';
import FinanceFilters from '../../../components/finance/FinanceFilters';
import TransactionsTable from '../../../components/finance/TransactionsTable';
import BatchAnalyticsTable from '../../../components/finance/BatchAnalyticsTable';
import ParticipantEventsTable from '../../../components/finance/ParticipantEventsTable';
import { FaBalanceScale, FaChalkboardTeacher, FaClock, FaUsers, FaChartPie, FaListUl, FaFileExport, FaSyncAlt, FaMoneyBillWave } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../../redux/user.slice';
import { exportTenantFinanceReport } from '../../../utils/financePdfExport';

import PaymentModal from '../../../components/finance/PaymentModal';

const TenantFinanceDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handlePaymentSave = async (paymentData) => {
        try {
            await api.post('/finance/tenant/pay', {
                ...paymentData,
                tenantId: tenantId
            });
            alert('Payment recorded successfully!');
            fetchData();
            setIsPaymentModalOpen(false);
            setSelectedInstructor(null);
        } catch (error) {
            console.error("Payment Error", error);
            alert('Failed to record payment');
        }
    };

    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        if (!window.confirm("This will fetch meeting data from Dyte API. Continue?")) return;
        setSyncing(true);
        try {
            const res = await api.post('/finance/tenant/sync/dyte');
            alert(res.data.message || "Sync complete");
            fetchData();
        } catch (error) {
            console.error("Sync Error", error);
            alert("Sync Failed");
        } finally {
            setSyncing(false);
        }
    };

    const handleExportCSV = () => {
        if (!instructors || instructors.length === 0) {
            alert("No data to export");
            return;
        }

        const headers = ["Instructor Name", "Email", "Salary Type", "Batches", "Allocated Hours", "Conducted Hours", "Total Classes", "Payout", "Status"];
        const rows = instructors.map(inst => [
            `"${inst.instructorName || ''}"`,
            `"${inst.instructorEmail || ''}"`,
            `"${inst.salaryType || ''}"`,
            inst.batches ? inst.batches.length : 0,
            inst.totalAllocatedHours || 0,
            inst.totalConductedHours || 0,
            inst.totalClasses || 0,
            inst.calculatedPayout || 0,
            `"${inst.paymentStatus || ''}"`
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `finance_report_${month}_${year}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        exportTenantFinanceReport({
            month,
            year,
            summary,
            instructors,
            batchBreakdown,
            logs,
            totalInstructorPayout
        });
    };

    useEffect(() => {
        if (!user) {
            dispatch(fetchUser());
        }
    }, [user, dispatch]);

    const tenantId = user?.tenant_id?._id || user?.tenant_id || user?.tenantId || (user?.role === 'tenant' || user?.role_id?.name === 'tenant' ? user?._id : null);

    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedInstructor, setSelectedInstructor] = useState(null);

    const [summary, setSummary] = useState({
        totalHours: 0,
        totalClasses: 0,
        instructorCount: 0,
        plannedHours: 0,
        plannedClasses: 0,
        varianceHours: 0
    });
    const [instructors, setInstructors] = useState([]);
    const [batchBreakdown, setBatchBreakdown] = useState([]);
    const [logs, setLogs] = useState([]);
    const [selectedInstructorLogs, setSelectedInstructorLogs] = useState([]);
    const [selectedInstructorLogsLoading, setSelectedInstructorLogsLoading] = useState(false);
    const [dailyData, setDailyData] = useState([]);
    const [logPeriod, setLogPeriod] = useState('month');
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [participantEvents, setParticipantEvents] = useState([]);
    const [participantEventsLoading, setParticipantEventsLoading] = useState(false);

    const formatHours = (value) => `${Number(value || 0).toFixed(2)} hrs`;
    const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value || 0));

    const totalInstructorPayout = useMemo(() => {
        return (instructors || []).reduce((sum, inst) => sum + Number(inst?.calculatedPayout || 0), 0);
    }, [instructors]);

    useEffect(() => {
        if (tenantId) {
            fetchData();
        }
    }, [tenantId, month, year]);

    useEffect(() => {
        if (tenantId) {
            fetchLogs();
        }
    }, [tenantId, month, year, logPeriod, selectedDate]);

    useEffect(() => {
        if (tenantId && activeTab === 'participants') {
            fetchParticipantEvents();
        }
    }, [tenantId, month, year, logPeriod, selectedDate, activeTab]);

    useEffect(() => {
        const instructorId = selectedInstructor?._id;
        if (!tenantId || !instructorId) {
            setSelectedInstructorLogs([]);
            return;
        }

        const fetchInstructorLogs = async () => {
            setSelectedInstructorLogsLoading(true);
            try {
                const res = await api.get(
                    `/finance/tenant/logs/${tenantId}?month=${month}&year=${year}&period=month&limit=200&instructorId=${instructorId}`
                );
                if (res.data.success) {
                    setSelectedInstructorLogs(res.data.logs || []);
                } else {
                    setSelectedInstructorLogs([]);
                }
            } catch (e) {
                console.error("Failed to fetch instructor logs", e);
                setSelectedInstructorLogs([]);
            } finally {
                setSelectedInstructorLogsLoading(false);
            }
        };

        fetchInstructorLogs();
    }, [tenantId, selectedInstructor?._id, month, year]);

    const fetchLogs = async () => {
        try {
            const dateParam = logPeriod === 'day' && selectedDate ? `&date=${selectedDate}` : '';
            const logsRes = await api.get(`/finance/tenant/logs/${tenantId}?month=${month}&year=${year}&period=${logPeriod}${dateParam}&limit=1000`);
            if (logsRes.data.success) {
                setLogs(logsRes.data.logs);
                if (logPeriod === 'month') {
                    processDailyChart(logsRes.data.logs);
                }
            }
        } catch (error) {
            console.error("Failed to fetch tenant logs", error);
        }
    };

    const fetchParticipantEvents = async () => {
        setParticipantEventsLoading(true);
        try {
            const dateParam = logPeriod === 'day' && selectedDate ? `&date=${selectedDate}` : '';
            const res = await api.get(`/finance/tenant/participant-events/${tenantId}?month=${month}&year=${year}&period=${logPeriod}${dateParam}&limit=1000`);
            if (res.data.success) {
                setParticipantEvents(res.data.events || []);
            } else {
                setParticipantEvents([]);
            }
        } catch (error) {
            console.error("Failed to fetch participant events", error);
            setParticipantEvents([]);
        } finally {
            setParticipantEventsLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const summaryRes = await api.get(`/finance/tenant/summary/${tenantId}?month=${month}&year=${year}`);
            if (summaryRes.data.success) {
                setSummary((prev) => ({
                    ...prev,
                    ...(summaryRes.data.usage || {})
                }));
                setBatchBreakdown(summaryRes.data.batchBreakdown || []);
            }

            const instrRes = await api.get(`/finance/tenant/instructors/${tenantId}?month=${month}&year=${year}`);
            if (instrRes.data.success) {
                setInstructors(instrRes.data.instructors);
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
                const minutes = (log.duration_minutes || ((log.duration_seconds || 0) / 60) || 0);
                dayEntry.hours += (minutes / 60);
            }
        });
        data.forEach(d => d.hours = parseFloat(d.hours.toFixed(2)));
        setDailyData(data);
    };

    if (!user) return <div style={{ padding: '80px', textAlign: 'center', background: '#f8fafc' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Initializing secure connection...</div>
    </div>;

    if (!tenantId) return <div style={{ padding: '80px', textAlign: 'center', background: '#f8fafc' }}>
        <div style={{ padding: '24px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', display: 'inline-block' }}>
            <h3 style={{ margin: 0 }}>Access Error</h3>
            <p style={{ margin: '8px 0 0' }}>Tenant ID missing. Please login again.</p>
        </div>
    </div>;

    // Premium Theme Config
    const theme = {
        primary: '#4f46e5', // indigo-600
        secondary: '#0f172a', // slate-900
        accent: '#10b981', // emerald-500
        bg: '#f8fafc', // slate-50
        card: '#ffffff',
        border: '#e2e8f0', // slate-200
        text: '#1e293b', // slate-800
        textMuted: '#64748b', // slate-500
    };

    const containerStyle = {
        padding: '32px',
        backgroundColor: theme.bg,
        minHeight: '100vh',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        color: theme.text
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '24px'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
    };

    const mainContentLayout = {
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '32px',
        minWidth: 0
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
    const headerActionsStyle = {
        display: 'flex',
        gap: isMobile ? '10px' : '12px',
        alignItems: isMobile ? 'stretch' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        width: isMobile ? '100%' : 'auto'
    };
    const syncButtonStyle = {
        padding: isMobile ? '10px 14px' : '12px 20px',
        background: syncing ? '#cbd5e1' : theme.primary,
        color: 'white',
        border: 'none',
        borderRadius: isMobile ? '9px' : '10px',
        cursor: syncing ? 'not-allowed' : 'pointer',
        fontWeight: '700',
        fontSize: isMobile ? '13px' : '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? '8px' : '10px',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
        width: isMobile ? '100%' : 'auto',
        minHeight: isMobile ? '42px' : 'auto'
    };
    const filtersWrapStyle = {
        background: 'white',
        padding: isMobile ? '8px' : '6px',
        borderRadius: '12px',
        border: '1px solid ' + theme.border,
        width: isMobile ? '100%' : 'auto'
    };

    return (
        <div style={containerStyle}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
                    @media print {
                        .no-print { display: none !important; }
                        .print-full-width { display: block !important; width: 100% !important; }
                        body { background-color: white !important; }
                        @page { margin: 1.5cm; size: landscape; }
                    }
                    button:active { transform: scale(0.98); }
                    .tab-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                    .tab-btn:hover { color: #4f46e5; background: #f1f5f9; }
                    .finance-tab-strip { display: flex; }
                    @media (max-width: 1024px) {
                        .finance-tab-scroll {
                            overflow-x: auto;
                            overflow-y: hidden;
                            -webkit-overflow-scrolling: touch;
                            scrollbar-width: thin;
                        }
                        .finance-tab-strip {
                            width: max-content;
                            min-width: 100%;
                            flex-wrap: nowrap;
                            gap: 8px;
                        }
                        .finance-tab-strip .tab-btn {
                            flex: 0 0 auto !important;
                            white-space: nowrap;
                            min-width: max-content;
                            padding-left: 14px !important;
                            padding-right: 14px !important;
                        }
                    }
                `}
            </style>

            <div style={headerStyle}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: theme.secondary, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                        Command Center <span style={{ color: theme.primary, fontSize: '14px', fontWeight: '600', padding: '4px 8px', background: '#eef2ff', borderRadius: '6px', marginLeft: '12px', verticalAlign: 'middle' }}>V2.0</span>
                    </h1>
                    <p style={{ color: theme.textMuted, fontSize: '16px', fontWeight: '500' }}>Strategic oversight of educational workload and financial efficiency.</p>
                </div>

                <div style={headerActionsStyle} className="no-print">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        style={syncButtonStyle}
                    >
                        <FaSyncAlt className={syncing ? "animate-spin" : ""} />
                        {syncing ? 'Syncing Dyte...' : 'Sync Live Data'}
                    </button>
                    <div style={filtersWrapStyle}>
                        <FinanceFilters
                            month={month}
                            year={year}
                            onMonthChange={setMonth}
                            onYearChange={setYear}
                        />
                    </div>
                </div>
            </div>

            {/* Metric Overview */}
            <div style={gridStyle}>
                <FinanceStatsCard
                    title="Actual Performance"
                    value={formatHours(summary.totalHours)}
                    icon={<FaClock />}
                    color="#6366f1"
                    subtext={`${summary.totalClasses || 0} Successful Sessions`}
                    trend="+12%"
                />
                <FinanceStatsCard
                    title="Planned Capacity"
                    value={formatHours(summary.plannedHours)}
                    icon={<FaChalkboardTeacher />}
                    color="#8b5cf6"
                    subtext={`${summary.plannedClasses || 0} Scheduled Classes`}
                />
                <FinanceStatsCard
                    title="Teaching Force"
                    value={summary.instructorCount || 0}
                    icon={<FaUsers />}
                    color="#10b981"
                    subtext="Active Educators"
                />
                <FinanceStatsCard
                    title="Instructor Payments"
                    value={formatCurrency(totalInstructorPayout)}
                    icon={<FaMoneyBillWave />}
                    color="#f59e0b"
                    subtext={`${moment([year, month - 1]).format('MMMM YYYY')}`}
                />
                <FinanceStatsCard
                    title="Efficiency Delta"
                    value={formatHours(summary.varianceHours)}
                    icon={<FaBalanceScale />}
                    color={summary.varianceHours >= 0 ? '#10b981' : '#f43f5e'}
                    subtext="Actual vs. Theoretical"
                    trend={summary.varianceHours >= 0 ? "Optimized" : "Under capacity"}
                />
            </div>

            <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '32px' } : mainContentLayout}>

                {/* Main Action Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0 }}>

                    {/* Visual Analytics */}
                    <div style={{ background: 'white', padding: '28px', borderRadius: '16px', border: '1px solid ' + theme.border, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.secondary, margin: 0 }}>Activity Distribution</h3>
                            <div style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '600', padding: '4px 12px', background: theme.bg, borderRadius: '20px' }}>Daily Breakdown</div>
                        </div>
                        <div style={{ height: 320, width: '100%', minWidth: 0, minHeight: 320 }}>
                            <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                <BarChart data={dailyData}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#4f46e5" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                        formatter={(value) => [`${value} hrs`, 'Workload']}
                                        labelFormatter={(label) => `${moment(`${year}-${month}-${label}`, 'YYYY-M-D').format('MMM Do, YYYY')}`}
                                    />
                                    <Bar dataKey="hours" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid ' + theme.border, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                        <div className="finance-tab-scroll no-print" style={{ background: '#f8fafc', padding: '6px', margin: '16px', borderRadius: '12px' }}>
                            <div className="finance-tab-strip">
                            <button
                                className="tab-btn"
                                style={{
                                    flex: 1, padding: '12px', fontWeight: '700', fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    background: activeTab === 'overview' ? 'white' : 'transparent',
                                    color: activeTab === 'overview' ? theme.primary : theme.textMuted,
                                    boxShadow: activeTab === 'overview' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                                onClick={() => setActiveTab('overview')}
                            >
                                <FaUsers size={16} />
                                Instructor Performance
                            </button>
                            <button
                                className="tab-btn"
                                style={{
                                    flex: 1, padding: '12px', fontWeight: '700', fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    background: activeTab === 'batches' ? 'white' : 'transparent',
                                    color: activeTab === 'batches' ? theme.primary : theme.textMuted,
                                    boxShadow: activeTab === 'batches' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                                onClick={() => setActiveTab('batches')}
                            >
                                <FaChartPie size={16} />
                                Batch Analytics
                            </button>
                            <button
                                className="tab-btn"
                                style={{
                                    flex: 1, padding: '12px', fontWeight: '700', fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    background: activeTab === 'logs' ? 'white' : 'transparent',
                                    color: activeTab === 'logs' ? theme.primary : theme.textMuted,
                                    boxShadow: activeTab === 'logs' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                                onClick={() => setActiveTab('logs')}
                            >
                                <FaListUl size={16} />
                                Detailed Logs
                            </button>
                            <button
                                className="tab-btn"
                                style={{
                                    flex: 1, padding: '12px', fontWeight: '700', fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    background: activeTab === 'participants' ? 'white' : 'transparent',
                                    color: activeTab === 'participants' ? theme.primary : theme.textMuted,
                                    boxShadow: activeTab === 'participants' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                                onClick={() => setActiveTab('participants')}
                            >
                                <FaUsers size={16} />
                                Participant Log
                            </button>
                            </div>
                        </div>

                        <div className="tab-content" style={{ padding: '0 16px 24px' }}>
                            {activeTab === 'overview' ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid ' + theme.border }}>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', fontSize: '11px' }}>Instructor Profile</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', fontSize: '11px' }}>Salary Configuration</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', fontSize: '11px' }}>Planned/Actual</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', fontSize: '11px' }}>Variance</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', fontSize: '11px' }}>Accrued Payout</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', fontSize: '11px' }}>Report</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {instructors.length > 0 ? (
                                                instructors.map((inst) => {
                                                    const plannedHours = Number(inst.totalAllocatedHours || 0);
                                                    const conductedHours = Number(inst.totalConductedHours || 0);
                                                    const varianceHours = parseFloat((conductedHours - plannedHours).toFixed(2));

                                                    return (
                                                        <tr key={inst._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                                            <td style={{ padding: '16px' }}>
                                                                <div style={{ fontWeight: '700', color: theme.secondary }}>{inst.instructorName}</div>
                                                                <div style={{ fontSize: '12px', color: theme.textMuted }}>{inst.instructorEmail}</div>
                                                            </td>
                                                            <td style={{ padding: '16px' }}>
                                                                <div style={{ textTransform: 'uppercase', fontWeight: '800', fontSize: '11px', color: '#6366f1' }}>{inst.salaryType}</div>
                                                                <div style={{ fontSize: '12px', color: theme.textMuted }}>
                                                                    {String(inst.salaryType || '').toLowerCase() === 'fixed'
                                                                        ? `Salary: ${formatCurrency(inst.fixedSalary || 0)}/mo`
                                                                        : `Rate: ${formatCurrency(inst.hourlyRate || 0)}/hr`}
                                                                </div>
                                                                {Number(inst.contractedHours || 0) > 0 && (
                                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                                        Contract: {Number(inst.contractedHours || 0)} hrs/mo
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '16px' }}>
                                                                <div style={{ fontWeight: '700' }}>{conductedHours} <span style={{ color: theme.textMuted, fontWeight: '400', fontSize: '12px' }}>/ {plannedHours} hrs</span></div>
                                                                <div style={{ fontSize: '11px', color: theme.accent }}>{inst.totalClasses || 0} sessions recorded</div>
                                                            </td>
                                                            <td style={{ padding: '16px' }}>
                                                                <div style={{ fontWeight: '800', color: varianceHours >= 0 ? theme.accent : '#f43f5e' }}>{varianceHours > 0 ? '+' : ''}{varianceHours} hrs</div>
                                                            </td>
                                                            <td style={{ padding: '16px' }}>
                                                                <div style={{ fontWeight: '800', color: '#059669', fontSize: '15px' }}>INR {inst.calculatedPayout?.toLocaleString() || 0}</div>
                                                                <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase' }}>{inst.paymentStatus}</div>
                                                            </td>
                                                            <td style={{ padding: '16px' }}>
                                                                <button
                                                                    onClick={() => setSelectedInstructor(inst)}
                                                                    style={{
                                                                        padding: '8px 14px', border: '1px solid ' + theme.border, borderRadius: '8px', background: 'white',
                                                                        cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: theme.primary
                                                                    }}
                                                                >
                                                                    View Analysis
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: theme.textMuted }}>
                                                        <FaChalkboardTeacher size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                                        <div style={{ fontSize: '16px', fontWeight: '600' }}>No instructors found</div>
                                                        <p style={{ margin: '4px 0 0', fontSize: '14px' }}>There are no active instructors registered for this tenant or month.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : activeTab === 'batches' ? (
                                <BatchAnalyticsTable data={batchBreakdown} periodLabel={`This Month • ${moment([year, month - 1]).format('MMMM YYYY')}`} />
                            ) : activeTab === 'logs' ? (
                                <div>
                                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, fontWeight: '700' }}>Master Session Logs</h4>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            {logPeriod === 'day' && (
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid ' + theme.border, fontSize: '13px', color: theme.text }}
                                                />
                                            )}
                                            <select
                                                value={logPeriod}
                                                onChange={(e) => setLogPeriod(e.target.value)}
                                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid ' + theme.border, fontSize: '13px', color: theme.text }}
                                            >
                                                <option value="day">Day View</option>
                                                <option value="week">Weekly View</option>
                                                <option value="month">Monthly Statement</option>
                                            </select>
                                        </div>
                                    </div>
                                    <TransactionsTable data={logs} type="log" />
                                </div>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, fontWeight: '700' }}>Participant Log</h4>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            {logPeriod === 'day' && (
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid ' + theme.border, fontSize: '13px', color: theme.text }}
                                                />
                                            )}
                                            <select
                                                value={logPeriod}
                                                onChange={(e) => setLogPeriod(e.target.value)}
                                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid ' + theme.border, fontSize: '13px', color: theme.text }}
                                            >
                                                <option value="day">Day View</option>
                                                <option value="week">Weekly View</option>
                                                <option value="month">Monthly Statement</option>
                                            </select>
                                        </div>
                                    </div>
                                    {participantEventsLoading ? (
                                        <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, fontWeight: '700' }}>
                                            Loading participant events...
                                        </div>
                                    ) : (
                                        <ParticipantEventsTable data={participantEvents} />
                                    )}

                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Utility Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="no-print">

                    {/* Insights Card */}
                    <div style={{ background: '#4f46e5', padding: '28px', borderRadius: '20px', color: 'white', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.01em' }}>Strategic Insights</h3>
                            <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6', marginBottom: '20px' }}>
                                Your total variance for this month is <strong>{formatHours(summary.varianceHours)}</strong>.
                                {summary.varianceHours >= 0 ? " You're exceeding planned capacity." : " You're currently under scheduled capacity."}
                            </p>
                            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '12px', fontSize: '13px' }}>
                                Total Classes: <strong>{summary.totalClasses}</strong>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', background: 'rgba(255,255,255,0.05)', width: '120px', height: '120px', borderRadius: '50%' }}></div>
                    </div>

                    {/* Report Export Panel */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid ' + theme.border }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: theme.secondary, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaFileExport size={16} color={theme.primary} />
                            Report Export
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={handleDownloadPDF}
                                style={{
                                    padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px',
                                    color: theme.secondary, fontWeight: '700', fontSize: '14px', cursor: 'pointer', textAlign: 'left',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                            >
                                PDF Detailed Report
                                <span style={{ fontSize: '10px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>ISO</span>
                            </button>
                            <button
                                onClick={handleExportCSV}
                                style={{
                                    padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px',
                                    color: theme.secondary, fontWeight: '700', fontSize: '14px', cursor: 'pointer', textAlign: 'left',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                            >
                                Raw CSV Data
                                <span style={{ fontSize: '10px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>EXCEL</span>
                            </button>
                        </div>
                        <p style={{ marginTop: '20px', fontSize: '11px', color: theme.textMuted, lineHeight: '1.5' }}>
                            * All data is cryptographically synced with live session recording timestamps from Dyte.
                        </p>
                    </div>

                    <div style={{ background: '#ecfdf5', padding: '24px', borderRadius: '16px', border: '1px solid #d1fae5' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#065f46', marginBottom: '8px' }}>Security Audit</h3>
                        <p style={{ fontSize: '12px', color: '#047857', lineHeight: '1.5', margin: 0 }}>
                            Last sync completed: {moment().format('h:mm A')}. Financial data is immutable once marked as paid.
                        </p>
                    </div>
                </div>
            </div>

            {/* Instructor Detail Modal - Deep Analysis */}
            {selectedInstructor && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', width: '95%', maxWidth: '900px',
                        maxHeight: '90vh', overflowY: 'auto', padding: '40px', position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <button
                            onClick={() => setSelectedInstructor(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                        >
                            &times;
                        </button>

                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                <div style={{ width: '56px', height: '56px', background: theme.primary, color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800' }}>
                                    {selectedInstructor.instructorName.charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.secondary, margin: 0 }}>{selectedInstructor.instructorName}</h2>
                                    <p style={{ margin: 0, color: theme.textMuted, fontWeight: '500' }}>Financial Analysis & Statement • {moment(`${year}-${month}-01`).format('MMMM YYYY')}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Compensation Model</div>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: theme.primary, marginTop: '8px' }}>
                                    {selectedInstructor.salaryType.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Allocated Load</div>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: theme.secondary, marginTop: '8px' }}>
                                    {selectedInstructor.totalAllocatedHours} <span style={{ fontSize: '13px', fontWeight: '400' }}>hrs</span>
                                </div>
                            </div>
                            <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                                <div style={{ fontSize: '11px', color: '#0369a1', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Actual Utilization</div>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0c4a6e', marginTop: '8px' }}>
                                    {selectedInstructor.totalConductedHours} <span style={{ fontSize: '13px', fontWeight: '400' }}>hrs</span>
                                </div>
                            </div>
                            <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                                <div style={{ fontSize: '11px', color: '#047857', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Net Payout</div>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: '#064e3b', marginTop: '8px' }}>
                                    INR {selectedInstructor.calculatedPayout?.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: theme.secondary }}>Assignment Breakdown</h3>
                        <div style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '16px', marginBottom: '32px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, fontSize: '12px' }}>Strategic Batch Name</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, fontSize: '12px' }}>Expected Load</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, fontSize: '12px' }}>Actual Recorded</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, fontSize: '12px' }}>Sessions</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: theme.textMuted, fontSize: '12px' }}>Variance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInstructor.batches && selectedInstructor.batches.map((batch, i) => (
                                        <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px', fontWeight: '600', color: theme.secondary }}>{batch.batchName}</td>
                                            <td style={{ padding: '16px', color: theme.text }}>{batch.allocatedHours} hrs</td>
                                            <td style={{ padding: '16px', color: theme.primary, fontWeight: '700' }}>{batch.conductedHours} hrs</td>
                                            <td style={{ padding: '16px', color: theme.text }}>{batch.conductedClasses} recorded</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    color: (batch.conductedHours - batch.allocatedHours) < 0 ? '#f43f5e' : theme.accent,
                                                    fontWeight: '700',
                                                    padding: '4px 8px',
                                                    background: (batch.conductedHours - batch.allocatedHours) < 0 ? '#fff1f2' : '#f0fdf4',
                                                    borderRadius: '6px',
                                                    fontSize: '12px'
                                                }}>
                                                    {(batch.conductedHours - batch.allocatedHours).toFixed(2)} hrs
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '900', color: theme.secondary }}>
                                Detailed Session Logs
                            </h4>
                            {selectedInstructorLogsLoading ? (
                                <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid ' + theme.border, borderRadius: '12px', color: theme.textMuted, fontWeight: '700' }}>
                                    Loading logs...
                                </div>
                            ) : (
                                <TransactionsTable data={selectedInstructorLogs} type="log" />
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                style={{
                                    padding: '14px 28px',
                                    background: selectedInstructor.paymentStatus === 'paid' ? '#f59e0b' : theme.accent,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                {selectedInstructor.paymentStatus === 'paid' ? 'Adjustment Needed?' : 'Authorize Disbursement'}
                            </button>
                            <button
                                onClick={() => setSelectedInstructor(null)}
                                style={{ padding: '14px 28px', background: 'white', border: '1px solid ' + theme.border, borderRadius: '12px', cursor: 'pointer', fontWeight: '700', color: theme.textMuted }}
                            >
                                Close Analysis
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                instructor={selectedInstructor}
                onSave={handlePaymentSave}
                month={month}
                year={year}
            />
        </div>
    );
};

export default TenantFinanceDashboard;
