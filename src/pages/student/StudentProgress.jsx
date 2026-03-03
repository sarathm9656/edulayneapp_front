import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrophy, FaChartLine, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';

const StudentProgress = () => {
    const navigate = useNavigate();

    // Mock Data for Draft UI (Generic)
    const progressData = [
        { id: 1, course: 'Introduction to Web Development', progress: 75, status: 'In Progress', lastActive: '2 hours ago' },
        { id: 2, course: 'Digital Marketing Fundamentals', progress: 100, status: 'Completed', lastActive: '1 week ago' },
        { id: 3, course: 'Data Science Basics', progress: 30, status: 'In Progress', lastActive: '1 day ago' },
        { id: 4, course: 'Graphic Design Essentials', progress: 0, status: 'Not Started', lastActive: '-' },
    ];

    return (
        <div className="modern-grid fade-in">
            {/* Header with Back Button */}
            <div className="modern-card" style={{ gridColumn: 'span 12' }}>
                <div className="d-flex align-items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-light rounded-circle shadow-sm border d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <FaArrowLeft className="text-secondary" />
                    </button>
                    <div>
                        <h4 className="fw-bold mb-0">My Progress</h4>
                        <p className="text-muted small mb-0">Track your learning journey and achievements</p>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="col-span-12 lg:col-span-8" style={{ gridColumn: 'span 8' }}>
                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="modern-card h-100 bg-primary text-white border-0 position-relative overflow-hidden">
                            <div className="position-relative z-10">
                                <h2 className="display-4 fw-bold mb-0">75%</h2>
                                <p className="opacity-75">Overall Completion Rate</p>
                                <div className="progress bg-white bg-opacity-25 mt-3" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-white" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <FaChartLine className="position-absolute bottom-0 end-0 opacity-25" style={{ fontSize: '8rem', marginBottom: '-1rem', marginRight: '-1rem' }} />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="row g-4">
                            <div className="col-12">
                                <div className="modern-card py-3 px-4 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-3 bg-success bg-opacity-10 rounded-pill text-success">
                                            <FaCheckCircle size={20} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">12</h5>
                                            <small className="text-muted">Completed Courses</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="modern-card py-3 px-4 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-3 bg-warning bg-opacity-10 rounded-pill text-warning">
                                            <FaTrophy size={20} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">5</h5>
                                            <small className="text-muted">Certificates Earned</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Progress Table */}
                <div className="modern-card mt-4">
                    <h5 className="fw-bold mb-4">Course Progress</h5>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle custom-table">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 rounded-start ps-3">Course Name</th>
                                    <th className="border-0">Status</th>
                                    <th className="border-0" style={{ width: '30%' }}>Progress</th>
                                    <th className="border-0 rounded-end text-end pe-3">Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {progressData.map(item => (
                                    <tr key={item.id}>
                                        <td className="ps-3 fw-semibold text-dark">{item.course}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${item.status === 'Completed' ? 'bg-success bg-opacity-10 text-success' :
                                                item.status === 'In Progress' ? 'bg-primary bg-opacity-10 text-primary' :
                                                    'bg-secondary bg-opacity-10 text-secondary'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                                    <div
                                                        className={`progress-bar ${item.progress === 100 ? 'bg-success' : 'bg-primary'}`}
                                                        style={{ width: `${item.progress}%` }}
                                                    ></div>
                                                </div>
                                                <small className="text-muted w-25 text-end">{item.progress}%</small>
                                            </div>
                                        </td>
                                        <td className="text-end pe-3 text-muted small">{item.lastActive}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Sidebar / Extra Stats */}
            <div className="col-span-12 lg:col-span-4" style={{ gridColumn: 'span 4' }}>
                <div className="modern-card h-100">
                    <h5 className="fw-bold mb-4">Learning Activity</h5>
                    {/* Mock Graph Placeholder */}
                    <div className="d-flex align-items-end justify-content-between h-50 px-2 pb-2 border-bottom mb-4" style={{ minHeight: '150px' }}>
                        {[40, 70, 30, 85, 50, 65, 90].map((h, i) => (
                            <div key={i} className="bg-primary bg-opacity-75 rounded-top" style={{ width: '8%', height: `${h}%` }} title={`Day ${i + 1}`}></div>
                        ))}
                    </div>

                    <h6 className="fw-bold mb-3">Recent Achievements</h6>
                    <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                            <FaTrophy className="text-warning fs-4" />
                            <div>
                                <h6 className="fw-bold mb-0">Fast Learner</h6>
                                <small className="text-muted">Completed 5 lessons in 1 day</small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                            <FaCheckCircle className="text-success fs-4" />
                            <div>
                                <h6 className="fw-bold mb-0">Week Streak</h6>
                                <small className="text-muted">Logged in for 7 days straight</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProgress;
