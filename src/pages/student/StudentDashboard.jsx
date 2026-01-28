import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "@/redux/user.slice";
import { fetchTenantCourses } from "@/redux/course.slice";
import { fetchStudentLiveSessions, fetchStudentBatches } from "@/redux/student.slice";
import axios from "axios";
import { FaBook, FaUsers, FaVideo, FaTrophy, FaPlay, FaClock, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);
  const courses = useSelector((state) => state.course.tenantCourses || []);
  const { liveSessions, enrolledBatches, liveSessionsLoading } = useSelector((state) => state.student);
  const [studentStats, setStudentStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalLiveSessions: 0,
    totalBatches: 0,
    certificates: 0
  });

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchTenantCourses());
    dispatch(fetchStudentLiveSessions());
    dispatch(fetchStudentBatches());
    fetchStudentStats();
  }, [dispatch]);

  const fetchStudentStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/student/stats`, {
        withCredentials: true
      });

      if (response.data && response.data.success) {
        setStudentStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching student stats:", error);
    }
  };

  // Helper to check if a batch is currently live
  const checkIsLive = (batch) => {
    if (!batch.days || !batch.start_time) return false;

    const now = new Date();
    const days = Array.isArray(batch.days) ? batch.days : [];
    const currentDayShort = now.toLocaleDateString('en-US', { weekday: 'short' }); // Mon
    const currentDayLong = now.toLocaleDateString('en-US', { weekday: 'long' }); // Monday

    // Check Day
    const isToday = days.some(d => d === currentDayShort || d === currentDayLong || d.includes(currentDayShort));
    if (!isToday) return false;

    // Check Time ( +/- 15 mins window around start time )
    try {
      const timeStr = batch.start_time; // Expecting "10:00 AM" or "14:00"
      let [time, modifier] = timeStr.trim().split(' ');
      let [hours, minutes] = time.split(':');

      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const startTimeDesc = new Date(now);
      startTimeDesc.setHours(hours, minutes, 0, 0);

      // Assume class is 1 hour default if no duration
      const duration = batch.course_id?.duration ? 60 : 60; // Just assume 60 mins for "Live" window if duration is total hours
      // Actually duration is total course duration.
      // We'll assume a 60 min session.

      const diff = (now - startTimeDesc) / 1000 / 60; // difference in minutes

      // Allow joining 10 mins before and up to 60 mins after
      return diff >= -10 && diff <= 60;
    } catch (e) {
      return false;
    }
  };

  const handleJoinClass = async (batchId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/dyte/join-meeting`,
        { batchId },
        { withCredentials: true }
      );

      if (response.data.success) {
        const { authToken, role } = response.data;
        // Redirect to meeting room with token
        const url = `${window.location.origin}/meeting?authToken=${authToken}&role=${role || 'student'}`;
        window.open(url, 'DyteMeetingWindow');
      }
    } catch (error) {
      console.error("Join Class Error:", error);
      const errorMessage = error.response?.data?.message || "Failed to join class";

      if (errorMessage.includes("not been started")) {
        toast.info("The meeting has not been started by the instructor yet. Please wait.");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const upcomingSessions = liveSessions?.filter(session => ['scheduled', 'ongoing'].includes(session.status)) || [];

  return (
    <div className="modern-grid">
      {/* Welcome Card */}
      <div className="modern-card p-4 text-white border-0" style={{ gridColumn: "span 12", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <h2 className="display-6 fw-bold mb-2">Hello, {user?.user?.user_id.fname || 'Student'}!</h2>
            <p className="lead mb-0 text-white-50">
              Ready to continue your learning journey? You have <span className="text-white fw-bold">{upcomingSessions.length}</span> upcoming live sessions.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <button className="btn btn-light rounded-pill px-4 fw-bold shadow-sm" onClick={() => navigate('/student/courses')}>
              Browse Courses <FaChevronRight className="ms-2 small" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="modern-card p-4" style={{ gridColumn: "span 3" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 p-3 rounded-4">
            <FaBook className="text-primary fs-3" />
          </div>
          <div>
            <h3 className="mb-0 fw-bold">{studentStats.totalCourses}</h3>
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Enrolled Courses</small>
          </div>
        </div>
      </div>

      <div className="modern-card p-4" style={{ gridColumn: "span 3" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-success bg-opacity-10 p-3 rounded-4">
            <FaUsers className="text-success fs-3" />
          </div>
          <div>
            <h3 className="mb-0 fw-bold">{studentStats.totalBatches}</h3>
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Active Batches</small>
          </div>
        </div>
      </div>

      <div className="modern-card p-4" style={{ gridColumn: "span 3" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-warning bg-opacity-10 p-3 rounded-4">
            <FaVideo className="text-warning fs-3" />
          </div>
          <div>
            <h3 className="mb-0 fw-bold">{studentStats.totalLiveSessions}</h3>
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Live Sessions</small>
          </div>
        </div>
      </div>

      <div className="modern-card p-4" style={{ gridColumn: "span 3" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-info bg-opacity-10 p-3 rounded-4">
            <FaTrophy className="text-info fs-3" />
          </div>
          <div>
            <h3 className="mb-0 fw-bold">{studentStats.certificates}</h3>
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Certificates</small>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="col-span-12 lg:col-span-8" style={{ gridColumn: "span 8" }}>
        {/* Upcoming Live Sessions */}
        <div className="modern-card mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">Upcoming Live Sessions</h5>
            <button className="btn btn-sm btn-light rounded-pill" onClick={() => navigate('/student/livesession')}>View All</button>
          </div>

          {liveSessionsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading sessions...</p>
            </div>
          ) : upcomingSessions.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {upcomingSessions.slice(0, 3).map(session => (
                <div key={session._id} className="p-3 rounded-3 border bg-light d-flex align-items-center justify-content-between flex-wrap gap-3 session-card-hover" style={{ transition: 'all 0.2s' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className={`p-3 rounded-3 ${session.status === 'ongoing' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                      <FaVideo className="fs-4" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">{session.topic}</h6>
                      <div className="d-flex align-items-center gap-3 text-muted small">
                        <span><FaClock className="me-1" />{session.scheduled_start_time}</span>
                        <span><FaCalendarAlt className="me-1" />{new Date(session.start_time).toLocaleDateString()}</span>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border">{session.batch_id?.batch_name}</span>
                      </div>
                    </div>
                  </div>
                  {(session.status === 'ongoing' || session.meeting_link || checkIsLive(session.batch_id)) ? (
                    <button onClick={() => handleJoinClass(session.batch_id._id)} className="btn btn-danger btn-sm px-4 rounded-pill fw-bold animate-pulse">
                      Join Now
                    </button>
                  ) : (
                    <button disabled className="btn btn-light btn-sm px-4 rounded-pill border">
                      Scheduled
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted bg-light rounded-3 border border-dashed">
              <FaVideo className="fs-1 opacity-25 mb-3" />
              <p className="mb-0">No upcoming sessions scheduled.</p>
            </div>
          )}
        </div>

        {/* Enrolled Batches */}
        <div className="modern-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">My Enrolled Batches</h5>
            <button className="btn btn-sm btn-light rounded-pill" onClick={() => navigate('/student/batches')}>View All</button>
          </div>

          <div className="row g-3">
            {enrolledBatches && enrolledBatches.length > 0 ? (
              enrolledBatches.slice(0, 4).map(batch => (
                <div key={batch._id} className="col-md-6">
                  <div className="border rounded-3 p-3 h-100 hover-shadow transition-all bg-white" style={{ cursor: 'pointer' }} onClick={() => batch.course_id && navigate(`/student/viewcourse/${batch.course_id._id}`)}>
                    <div className="d-flex gap-3">
                      <img
                        src={batch.course_id?.course_thumbnail || "/img/chessthumbnail.jpg"}
                        alt="Course"
                        className="rounded-3 object-fit-cover"
                        style={{ width: '100px', height: '100px' }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{batch.batch_name}</h6>
                          <span className={`badge rounded-pill ${batch.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '10px' }}>
                            {batch.status}
                          </span>
                        </div>
                        <p className="small text-muted mb-2 text-truncate fw-medium">{batch.course_id?.course_title}</p>

                        <div className="d-flex flex-wrap gap-x-3 gap-y-1 mb-2" style={{ fontSize: '0.75rem' }}>
                          <div className="text-muted w-100"><i className="fa-regular fa-calendar me-1"></i> {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}</div>
                          <div className="text-dark fw-medium w-100 mb-1"><i className="fa-solid fa-clock me-1 text-primary"></i> {batch.start_time || 'TBD'} <span className="text-muted fw-normal">({Array.isArray(batch.days) ? batch.days.join(', ') : 'Days TBD'})</span></div>
                          <div className="text-muted"><i className="fa-regular fa-hourglass me-1"></i> {batch.course_id?.duration || 0} Hrs</div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between mt-auto">
                          <div className="d-flex align-items-center gap-2 flex-grow-1 me-2">
                            <div className="progress flex-grow-1" style={{ height: '4px' }}>
                              <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${batch.progress || 0}%` }}></div>
                            </div>
                            <small className="text-muted" style={{ fontSize: '10px' }}>{batch.progress || 0}%</small>
                          </div>

                          {/* Dyte Link Button */}
                          {(batch.meeting_link || checkIsLive(batch)) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleJoinClass(batch._id); }}
                              className="btn btn-danger btn-sm py-1 px-3 rounded-pill fw-bold"
                              style={{ fontSize: '0.7rem' }}
                            >
                              Join Class
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-muted py-4">
                You haven't enrolled in any batches yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="col-span-12 lg:col-span-4" style={{ gridColumn: "span 4" }}>

        {/* Progress Overview */}
        <div className="modern-card mb-4">
          <h5 className="fw-bold mb-4">Learning Progress</h5>
          <div className="text-center position-relative mb-4">
            <svg width="160" height="160" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f2f5" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--modern-primary)"
                strokeWidth="8"
                strokeDasharray={`${(studentStats.totalCourses > 0 ? (studentStats.completedCourses / studentStats.totalCourses) * 283 : 0)} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="position-absolute top-50 start-50 translate-middle text-center">
              <h3 className="mb-0 fw-bold">{studentStats.totalCourses > 0 ? Math.round((studentStats.completedCourses / studentStats.totalCourses) * 100) : 0}%</h3>
              <small className="text-muted">Overall</small>
            </div>
          </div>
          <div className="d-flex justify-content-between text-center border-top pt-3">
            <div>
              <h6 className="fw-bold mb-0">{studentStats.completedCourses}</h6>
              <small className="text-muted">Completed</small>
            </div>
            <div>
              <h6 className="fw-bold mb-0">{studentStats.totalCourses}</h6>
              <small className="text-muted">In Progress</small>
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-warning">0</h6>
              <small className="text-muted">Pending</small>
            </div>
          </div>
        </div>

        {/* Quick Actions / Explore */}
        <div className="modern-card bg-pink-light text-center p-4 border-0">
          <div className="mb-3">
            <img src="/img/explore-image.png" alt="Explore" style={{ width: '80px', opacity: 0.9 }} />
          </div>
          <h5 className="fw-bold text-dark">Explore More Courses</h5>
          <p className="text-muted small mb-3">Discover new skills and advance your career with our top-rated courses.</p>
          <button className="btn btn-dark rounded-pill px-4 shadow-sm" onClick={() => navigate('/student/courses')}>
            View All Courses
          </button>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
