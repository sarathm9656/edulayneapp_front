import React, { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchTenant,
    fetchStudents,
    fetchInstructors,
} from "@/redux/tenant.slice";
import { fetchAllCourseNames } from "@/redux/course.slice";

const ModernTenantDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { students, instructors, tenant } = useSelector((state) => state.tenant);
    const { allCourseNames } = useSelector((state) => state.course);

    const [analytics, setAnalytics] = useState({
        learningActivity: [0, 0, 0, 0, 0, 0, 0],
        overallPerformance: { avgScore: 0, participationRate: 0 },
        topCourses: []
    });

    useEffect(() => {
        dispatch(fetchTenant());
        dispatch(fetchStudents());
        dispatch(fetchAllCourseNames());
        dispatch(fetchInstructors());

        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/tenants/analytics');
                if (response.data.success) {
                    setAnalytics(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
            }
        };

        fetchAnalytics();
    }, [dispatch]);

    const totalStudents = students?.length || 0;
    const totalCourses = allCourseNames?.length || 0;
    const totalInstructors = instructors?.length || 0;
    const activitySeries = Array.isArray(analytics.learningActivity) && analytics.learningActivity.length === 7
        ? analytics.learningActivity
        : [0, 0, 0, 0, 0, 0, 0];
    const weeklySubmissions = activitySeries.reduce((sum, value) => sum + (value || 0), 0);
    const recentWindow = activitySeries.slice(4).reduce((sum, value) => sum + (value || 0), 0);
    const previousWindow = activitySeries.slice(0, 3).reduce((sum, value) => sum + (value || 0), 0);
    const growthRate = previousWindow > 0
        ? Math.round(((recentWindow - previousWindow) / previousWindow) * 100)
        : (recentWindow > 0 ? 100 : 0);
    const bestDayIndex = activitySeries.findIndex((count) => count === Math.max(...activitySeries));
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const bestDayLabel = bestDayIndex >= 0
        ? weekdayLabels[new Date(Date.now() - (6 - bestDayIndex) * 24 * 60 * 60 * 1000).getDay()]
        : "N/A";
    const engagedLearners = Math.round((analytics.overallPerformance.participationRate / 100) * totalStudents);

    return (
        <div className="modern-grid">
            {/* Welcome Card */}
            <div className="modern-card" style={{ gridColumn: "span 12", background: "linear-gradient(135deg, #4c5096 0%, #667eea 100%)", color: "#fff", border: 'none' }}>
                <div className="row align-items-center g-4">
                    <div className="col-lg-8">
                        <h2 className="display-6 fw-bold mb-2">Welcome back, {tenant?.name || "Admin"}!</h2>
                        <p className="lead mb-0" style={{ color: "rgba(255,255,255,0.8)" }}>
                            Manage your academy efficiently. You have <span className="text-white fw-bold">{totalStudents}</span> students and <span className="text-white fw-bold">{totalCourses}</span> active courses.
                        </p>
                    </div>
                    <div className="col-lg-4 text-lg-end">
                        <button className="btn btn-light btn-lg px-4 rounded-pill fw-bold shadow-sm" onClick={() => navigate('/tenant/courses')}>
                            Manage Courses <i className="fa-solid fa-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="modern-card p-4" style={{ gridColumn: "span 3" }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-pink-light p-3 rounded-4">
                        <i className="fa-solid fa-user-graduate text-pink fs-3"></i>
                    </div>
                    <div>
                        <h3 className="mb-0 fw-bold">{totalStudents}</h3>
                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Students</small>
                    </div>
                </div>
            </div>

            <div className="modern-card p-4" style={{ gridColumn: "span 3" }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-4">
                        <i className="fa-solid fa-chalkboard-user text-primary fs-3"></i>
                    </div>
                    <div>
                        <h3 className="mb-0 fw-bold">{totalInstructors}</h3>
                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Instructors</small>
                    </div>
                </div>
            </div>

            <div className="modern-card p-4" style={{ gridColumn: "span 3" }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-4">
                        <i className="fa-solid fa-book text-success fs-3"></i>
                    </div>
                    <div>
                        <h3 className="mb-0 fw-bold">{totalCourses}</h3>
                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Courses</small>
                    </div>
                </div>
            </div>

            <div className="modern-card p-4" style={{ gridColumn: "span 3" }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-4">
                        <i className="fa-solid fa-calendar-check text-warning fs-3"></i>
                    </div>
                    <div>
                        <h3 className="mb-0 fw-bold">{analytics.sessionsToday || 0}</h3>
                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Sessions Today</small>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="modern-card col-span-12 lg:col-span-8" style={{ gridColumn: "span 8" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="mb-1 fw-bold">Learning Activity</h5>
                        <small className="text-muted">Intelligent overview of course progress and learner engagement</small>
                    </div>
                    <div className={`badge rounded-pill ${growthRate >= 0 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} px-3 py-2`}>
                        <i className={`fa-solid ${growthRate >= 0 ? "fa-arrow-trend-up" : "fa-arrow-trend-down"} me-1`}></i>
                        {Math.abs(growthRate)}% vs previous window
                    </div>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="p-3 rounded-4 border bg-light h-100">
                            <small className="text-muted d-block mb-1">Weekly Quiz Activity</small>
                            <h4 className="mb-0 fw-bold">{weeklySubmissions}</h4>
                            <small className="text-muted">Submissions in last 7 days</small>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 rounded-4 border bg-light h-100">
                            <small className="text-muted d-block mb-1">Engaged Learners</small>
                            <h4 className="mb-0 fw-bold">{engagedLearners}/{totalStudents}</h4>
                            <small className="text-muted">Based on participation rate</small>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 rounded-4 border bg-light h-100">
                            <small className="text-muted d-block mb-1">Peak Activity Day</small>
                            <h4 className="mb-0 fw-bold">{bestDayLabel}</h4>
                            <small className="text-muted">{Math.max(...activitySeries)} submissions</small>
                        </div>
                    </div>
                </div>

                <div style={{ height: "220px", display: "flex", alignItems: "flex-end", gap: "12px", padding: '10px 0' }}>
                    {activitySeries.map((count, i) => {
                        // Normalize height (max 100%)
                        const max = Math.max(...activitySeries, 10); // avoid div by zero
                        const height = (count / max) * 100;
                        const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).getDay()];

                        return (
                            <div key={i} className="flex-grow-1" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                <div style={{ width: '100%', maxWidth: '40px', backgroundColor: 'var(--modern-primary)', opacity: 0.85, height: `${Math.max(height, 6)}%`, borderRadius: "10px", transition: 'all 0.5s ease' }} title={`${count} submissions`}></div>
                                <span className="position-absolute bottom-0 translate-middle-y text-muted small" style={{ marginBottom: '-25px', fontSize: '11px' }}>
                                    {dayLabel}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="modern-card col-span-12 lg:col-span-4" style={{ gridColumn: "span 4" }}>
                <h5 className="mb-1 fw-bold">Overall Performance</h5>
                <p className="text-muted small mb-4">Target achievement progress</p>
                <div className="text-center py-4">
                    <div className="position-relative d-inline-block">
                        <svg width="180" height="180" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f2f5" strokeWidth="10" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--modern-primary)" strokeWidth="10" strokeDasharray={`${(analytics.overallPerformance.avgScore / 100) * 282} 282`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                        </svg>
                        <div className="position-absolute top-50 start-50 translate-middle">
                            <h2 className="mb-0 fw-bold">{analytics.overallPerformance.avgScore}%</h2>
                            <small className="text-muted">Avg Score</small>
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="small text-muted">Participation</span>
                        <span className="small fw-bold">{analytics.overallPerformance.participationRate}%</span>
                    </div>
                    <div className="progress rounded-pill mb-3" style={{ height: '6px' }}>
                        <div className="progress-bar bg-pink" style={{ width: `${analytics.overallPerformance.participationRate}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Top Courses Section */}
            <div className="modern-card" style={{ gridColumn: "span 12" }}>
                <h5 className="mb-1 fw-bold">Course Progress Overview</h5>
                <p className="text-muted small mb-4">Enrollment, activity, and quality blended into a smart progress score</p>
                <div className="row g-3">
                    {analytics.topCourses.length > 0 ? (
                        analytics.topCourses.map((course, i) => (
                            <div key={course._id} className="col-md-4 col-sm-6">
                                <div className="p-3 rounded-4 border bg-light h-100 d-flex flex-column">
                                    <div className="d-flex justify-content-between mb-2">
                                        <div className="badge bg-white text-primary shadow-sm">Rank #{i + 1}</div>
                                        <small className="text-muted"><i className="fa-solid fa-users me-1"></i> {course.students} students</small>
                                    </div>
                                    <h6 className="fw-bold mb-1 text-truncate" title={course.title}>{course.title}</h6>
                                    <div className="d-flex justify-content-between small text-muted mt-2">
                                        <span>Quiz Attempts (30d)</span>
                                        <span className="fw-semibold text-dark">{course.quizAttempts || 0}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small text-muted">
                                        <span>Active Learners</span>
                                        <span className="fw-semibold text-dark">{course.activeLearners || 0}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small text-muted">
                                        <span>Avg Score</span>
                                        <span className="fw-semibold text-dark">{course.avgScore || 0}%</span>
                                    </div>
                                    <div className="mt-auto pt-2">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <small className="text-muted">Progress Score</small>
                                            <small className="fw-bold text-primary">{course.progressScore || 0}%</small>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div className="progress-bar" style={{ width: `${course.progressScore || 0}%`, backgroundColor: 'var(--modern-primary)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center text-muted py-4">No progress data available yet.</div>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="modern-card" style={{ gridColumn: "span 12" }}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                    <div>
                        <h5 className="mb-1 fw-bold">Recent Students</h5>
                        <small className="text-muted">Latest student enrollments</small>
                    </div>
                    <button className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm" onClick={() => navigate('/tenant/students')}>
                        View All Students
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle custom-table">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0 rounded-start">Student</th>
                                <th className="border-0">Email</th>
                                <th className="border-0">Join Date</th>
                                <th className="border-0">Status</th>
                                <th className="border-0 text-end rounded-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students?.slice(0, 5).map((student, i) => (
                                <tr key={student._id || i} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tenant/student-details/${student._id}`)}>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar-placeholder bg-pink-light text-pink rounded-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                                                {student.fname?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{student.fname} {student.lname}</div>
                                                <small className="text-muted">ID: {student.user_code || `STU-${student._id?.slice(-4).toUpperCase()}`}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{student.email}</td>
                                    <td>{new Date(student.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2">Active</span>
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-light rounded-circle shadow-sm">
                                            <i className="fa-solid fa-chevron-right text-muted"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ModernTenantDashboard;
