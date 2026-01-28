import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchStudents } from "../../../redux/tenant.slice";
import api from "@/api/axiosInstance";
import { toast } from "react-toastify";
import ManageEnrollmentModal from "../../../components/tenants/ManageEnrollmentModal";

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { students } = useSelector((state) => state.tenant);
    const [student, setStudent] = useState(null);
    const [detailedStudent, setDetailedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showManageModal, setShowManageModal] = useState(false);
    useEffect(() => {
        if (!students || students.length === 0) {
            dispatch(fetchStudents());
        }
    }, [dispatch, students]);

    const fetchDetailedStudent = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tenants/students/${id}`);
            if (response.data.success) {
                setDetailedStudent(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching detailed student:", error);
            toast.error("Failed to load student details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDetailedStudent();
        }
    }, [id]);

    useEffect(() => {
        if (students && id) {
            const found = students.find((s) => s._id === id);
            setStudent(found);
        }
    }, [students, id]);

    if (loading && !detailedStudent) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-pink" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const currentStudent = detailedStudent || student;

    if (!currentStudent) {
        return <div className="text-center py-5">Student not found</div>;
    }

    return (
        <div className="modern-layout-content p-4">
            <div className="mb-4 d-flex align-items-center gap-3">
                <button className="btn btn-light rounded-circle shadow-sm" onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h2 className="mb-0 fw-bold">Student Profile</h2>
            </div>

            <div className="modern-grid">
                {/* Sidebar Column */}
                <div className="col-span-12 lg:col-span-4 space-y-4" style={{ gridColumn: 'span 4' }}>
                    {/* Profile Card */}
                    <div className="modern-card p-0 overflow-hidden text-center shadow-sm">
                        <div className="bg-pink-light h-32 w-full" style={{ height: '120px', backgroundColor: '#ffeff6', backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                        <div className="px-4 pb-4" style={{ marginTop: '-60px' }}>
                            <img
                                src={currentStudent.profile_image || `https://ui-avatars.com/api/?name=${currentStudent.fname}+${currentStudent.lname}&size=120&background=ff4d94&color=fff`}
                                className="rounded-circle border border-4 border-white mx-auto mb-3 shadow"
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                alt={currentStudent.fname}
                            />
                            <div className="badge bg-pink-light text-pink mb-2">{currentStudent.user_code || `STU-${currentStudent._id?.slice(-4).toUpperCase()}`} • Active</div>
                            <h3 className="mb-1 fw-bold">{currentStudent.fname} {currentStudent.lname}</h3>
                            <p className="text-muted small mb-3">Enrolled on {new Date(currentStudent.created_at || currentStudent.createdAt).toLocaleDateString()}</p>

                            <div className="d-flex gap-2 justify-content-center mt-3">
                                <a href={`mailto:${currentStudent.email}`} className="btn btn-light rounded-circle shadow-sm"><i className="fa-regular fa-envelope"></i></a>
                                <a href={`tel:${currentStudent.phone_number}`} className="btn btn-light rounded-circle shadow-sm"><i className="fa-solid fa-phone"></i></a>
                                <button className="btn btn-primary rounded-pill px-4 ms-2 shadow-sm"><i className="fa-regular fa-comments me-2"></i> Chat</button>
                            </div>
                        </div>
                    </div>

                    {/* Contact info card */}
                    <div className="modern-card shadow-sm">
                        <h5 className="mb-4 fw-bold">Contact Details</h5>
                        <div className="space-y-3">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="bg-light p-2 rounded-3"><i className="fa-solid fa-id-card text-muted"></i></div>
                                <div>
                                    <small className="text-muted d-block">Student ID</small>
                                    <span className="fw-bold text-primary">{currentStudent.user_code || `STU-${currentStudent._id?.slice(-4).toUpperCase()}`}</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="bg-light p-2 rounded-3"><i className="fa-regular fa-envelope text-muted"></i></div>
                                <div>
                                    <small className="text-muted d-block">Email Address</small>
                                    <span className="fw-medium">{currentStudent.email}</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="bg-light p-2 rounded-3"><i className="fa-solid fa-phone text-muted"></i></div>
                                <div>
                                    <small className="text-muted d-block">Phone Number</small>
                                    <span className="fw-medium">{currentStudent.phone_number || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-light p-2 rounded-3"><i className="fa-solid fa-location-dot text-muted"></i></div>
                                <div>
                                    <small className="text-muted d-block">Address</small>
                                    <span className="fw-medium">{currentStudent.address || "No address provided"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="btn btn-light w-100 rounded-4 py-3 shadow-sm border-0 bg-white fw-bold text-danger" onClick={() => navigate(-1)}>
                        <i className="fa-solid fa-arrow-left-long me-2"></i> Back to Students
                    </button>
                </div>

                {/* Main Content Column */}
                <div className="col-span-12 lg:col-span-8 space-y-4" style={{ gridColumn: 'span 8' }}>
                    <div className="row g-4">
                        {/* Learning Activity */}
                        <div className="col-md-7">
                            <div className="modern-card h-100 shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold">Learning Activity</h5>
                                    <div className="badge bg-light text-muted fw-normal">This Week</div>
                                </div>
                                <div className="mb-4">
                                    <h2 className="mb-0 fw-bold">12 <small className="fs-6 text-muted fw-normal">hours</small> 15 <small className="fs-6 text-muted fw-normal">minutes</small></h2>
                                    <small className="text-success"><i className="fa-solid fa-arrow-up me-1"></i> 10% from last week</small>
                                </div>
                                <div className="d-flex align-items-end justify-content-between h-40 gap-2 mb-3" style={{ height: '150px' }}>
                                    {[30, 45, 25, 60, 40, 20, 35].map((h, i) => (
                                        <div key={i} className="flex-1 rounded-top" style={{ height: `${h}%`, backgroundColor: '#ffeff6', position: 'relative', width: '100%', maxWidth: '35px' }}>
                                            <div className="rounded-top" style={{ height: '60%', width: '100%', backgroundColor: '#ff4d94', position: 'absolute', bottom: 0 }}></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="d-flex justify-content-between text-muted small px-1">
                                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                                </div>
                            </div>
                        </div>

                        {/* Performance */}
                        <div className="col-md-5">
                            <div className="modern-card h-100 shadow-sm">
                                <h5 className="mb-4 fw-bold">Performance</h5>
                                <div className="text-center py-2">
                                    <div className="position-relative d-inline-block">
                                        <svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#ff4d94" strokeWidth="8" strokeDasharray="210 251" />
                                        </svg>
                                        <div className="position-absolute top-50 start-50 translate-middle" style={{ transform: 'translate(-50%, -50%) rotate(0deg)' }}>
                                            <small className="d-block text-muted" style={{ fontSize: '10px' }}>AVG SCORE</small>
                                            <h3 className="mb-0 fw-bold">84%</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-2 small">
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff4d94' }}></div>
                                            <span>Attendance</span>
                                        </div>
                                        <span className="fw-bold small">92%</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-2 small">
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fbbf24' }}></div>
                                            <span>Assignments</span>
                                        </div>
                                        <span className="fw-bold small">78%</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-2 small">
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4c5096' }}></div>
                                            <span>Quizzes</span>
                                        </div>
                                        <span className="fw-bold small">85%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enrolled Courses & Batches */}
                    <div className="modern-card mt-4 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="mb-1 fw-bold">Enrolled Courses & Batches</h5>
                                <p className="text-muted small mb-0">Course access and batch schedules</p>
                            </div>
                            <button className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm" onClick={() => setShowManageModal(true)}>
                                <i className="fa-solid fa-pen-to-square me-2"></i>Manage
                            </button>
                        </div>

                        {detailedStudent?.enrolledCourses && detailedStudent.enrolledCourses.length > 0 ? (
                            <div className="row g-3">
                                {detailedStudent.enrolledCourses.map((course, i) => {
                                    // Find associated batch
                                    const courseBatch = detailedStudent.enrolledBatches?.find(
                                        b => (b.course_id?._id || b.course_id) === course._id
                                    );

                                    return (
                                        <div key={course._id} className="col-12">
                                            <div className="p-3 border rounded-4 hover-shadow-sm transition-all" style={{ borderStyle: 'solid !important' }}>
                                                <div className="d-flex align-items-start gap-3">
                                                    {/* Course Icon */}
                                                    <div className="bg-pink-light p-3 rounded-4 text-pink">
                                                        <i className="fa-solid fa-graduation-cap fs-4"></i>
                                                    </div>

                                                    {/* Course Details */}
                                                    <div className="flex-1">
                                                        <div className="d-flex justify-content-between">
                                                            <div>
                                                                <h6 className="mb-1 fw-bold text-dark">{course.course_title}</h6>
                                                                <small className="text-muted d-block mb-2">
                                                                    <i className="fa-regular fa-calendar me-1"></i>
                                                                    Enrolled: {new Date(course.purchased_at).toLocaleDateString()}
                                                                </small>
                                                            </div>
                                                            <div className="text-end">
                                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Active</span>
                                                            </div>
                                                        </div>

                                                        {/* Batch Details Section */}
                                                        <div className="bg-light rounded-3 p-2 mt-2 border border-light-subtle">
                                                            {courseBatch ? (
                                                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                                                    <div className="badge bg-white text-primary border border-primary-subtle rounded-pill px-3 py-2">
                                                                        <i className="fa-solid fa-users-rectangle me-2"></i>
                                                                        {courseBatch.batch_name}
                                                                    </div>
                                                                    <div className="small text-muted border-start ps-3">
                                                                        <i className="fa-regular fa-clock me-1"></i>
                                                                        {courseBatch.start_time || "Time not set"}
                                                                    </div>
                                                                    <div className="small text-muted border-start ps-3">
                                                                        <i className="fa-solid fa-calendar-days me-1"></i>
                                                                        {courseBatch.recurring_days?.map(d => d.slice(0, 3)).join(', ') || "No days set"}
                                                                    </div>
                                                                    {courseBatch.meeting_link && (
                                                                        <a href={courseBatch.meeting_link} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success rounded-pill py-0 px-2 ms-auto" style={{ fontSize: '0.75rem' }}>
                                                                            <i className="fa-solid fa-video me-1"></i> Join
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="d-flex align-items-center text-muted small">
                                                                    <i className="fa-solid fa-circle-exclamation me-2 text-warning"></i>
                                                                    <span>No batch assigned for this course.</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-5 bg-light rounded-4 border-dashed">
                                <i className="fa-solid fa-book-open fs-1 text-muted mb-3 d-block"></i>
                                <p className="text-muted">No courses enrolled yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ManageEnrollmentModal
                show={showManageModal}
                onHide={() => setShowManageModal(false)}
                student={currentStudent}
                onSuccess={fetchDetailedStudent}
            />
        </div>
    );
};

export default StudentDetails;
