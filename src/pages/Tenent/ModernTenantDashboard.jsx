import React, { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchTenant,
    fetchStudents,
    fetchInstructors,
} from "@/redux/tenant.slice";
import { fetchCourses } from "@/redux/course.slice";

const ModernTenantDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { students, instructors, tenant } = useSelector((state) => state.tenant);
    const { courses } = useSelector((state) => state.course);

    const [analytics, setAnalytics] = useState({
        learningActivity: [0, 0, 0, 0, 0, 0, 0],
        overallPerformance: { avgScore: 0, participationRate: 0 },
        topCourses: []
    });

    useEffect(() => {
        dispatch(fetchTenant());
        dispatch(fetchStudents());
        dispatch(fetchCourses(1));
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
    const totalCourses = courses?.length || 0;
    const totalInstructors = instructors?.length || 0;

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
                        <h3 className="mb-0 fw-bold">12</h3>
                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Sessions Today</small>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="modern-card col-span-12 lg:col-span-8" style={{ gridColumn: "span 8" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="mb-1 fw-bold">Learning Activity</h5>
                        <small className="text-muted">Overview of course progress</small>
                    </div>
                    <div className="d-flex gap-2">
                        <div className="d-flex align-items-center gap-2 small me-3">
                            <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: 'var(--modern-primary)' }}></span>
                            <span>Hours</span>
                        </div>
                        <select className="form-select form-select-sm border-0 bg-light rounded-pill px-3">
                            <option>This Week</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                </div>
                <div style={{ height: "300px", display: "flex", alignItems: "flex-end", gap: "12px", padding: '20px 0' }}>
                    {analytics.learningActivity.map((count, i) => {
                        // Normalize height (max 100%)
                        const max = Math.max(...analytics.learningActivity, 10); // avoid div by zero
                        const height = (count / max) * 100;
                        const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).getDay()];

                        return (
                            <div key={i} className="flex-grow-1" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                <div style={{ width: '100%', maxWidth: '40px', backgroundColor: 'var(--modern-primary)', opacity: 0.8, height: `${Math.max(height, 5)}%`, borderRadius: "10px", transition: 'all 0.5s ease' }} title={`${count} submissions`}></div>
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
                <h5 className="mb-4 fw-bold">Popular Courses</h5>
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
                                    <div className="mt-auto pt-2">
                                        <div className="progress" style={{ height: '4px' }}>
                                            <div className="progress-bar" style={{ width: `${Math.min((course.students / (analytics.topCourses[0]?.students || 1)) * 100, 100)}%`, backgroundColor: 'var(--modern-primary)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center text-muted py-4">No course data available yet.</div>
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
