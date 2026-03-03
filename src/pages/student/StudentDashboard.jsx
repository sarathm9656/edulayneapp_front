import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "@/redux/user.slice";
import { fetchTenantCourses } from "@/redux/course.slice";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaChevronRight,
  FaBookOpen,
  FaLayerGroup,
  FaChartLine,
  FaPlayCircle,
  FaClock,
  FaVideo,
  FaCalendarAlt,
} from "react-icons/fa";
import "./student-dashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);
  const tenantCourses = useSelector((state) => state.course?.tenantCourses || []);
  const coursesLoading = useSelector((state) => state.course?.coursesLoading);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const api_url = import.meta.env.VITE_API_URL;

  // Check if batch is live
  const checkIsLive = (batch) => {
    if (batch.meeting_link) return true;
    if (!batch.start_time || !batch.recurring_days) return false;

    const now = new Date();
    const days = Array.isArray(batch.recurring_days) ? batch.recurring_days : [];
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const isToday = days.some(d => d === currentDay);
    if (!isToday) return false;

    try {
      let timeStr = batch.batch_time;
      if (timeStr && timeStr.includes(" - ")) {
        timeStr = timeStr.split(" - ")[0];
      }
      if (!timeStr) return false;

      let [time, modifier] = timeStr.trim().split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const startTimeDesc = new Date(now);
      startTimeDesc.setHours(hours, minutes, 0, 0);
      const diff = (now - startTimeDesc) / 1000 / 60;
      return diff >= -15 && diff <= 120;
    } catch (e) {
      return false;
    }
  };

  // Handle Join Class
  const handleJoinClass = async (batch) => {
    try {
      const batchId = batch._id || batch.batch_id;
      const response = await axios.post(
        `${api_url}/dyte/join-meeting`,
        { batchId },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (response.data.authToken) {
          const meetingId = response.data.meeting_id || response.data.meetingId || "";
          const role = response.data.role || 'student';
          const url = `${window.location.origin}/meeting?authToken=${encodeURIComponent(response.data.authToken)}&role=${encodeURIComponent(role)}&batchId=${encodeURIComponent(batchId)}&meetingId=${encodeURIComponent(meetingId)}`;
          window.open(url, 'DyteMeetingWindow');
          toast.success("Joined class successfully!");
        } else if (response.data.meeting_link) {
          window.open(response.data.meeting_link, 'DyteMeetingWindow');
          toast.success("Joined class successfully!");
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to join class";
      if (errorMessage.includes("not been started")) {
        toast.info("The meeting has not been started by the instructor yet. Please wait.");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchTenantCourses());
  }, [dispatch]);

  useEffect(() => {
    const fetchEnrolledBatches = async () => {
      try {
        setBatchesLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(
          `${apiUrl}/batch-student/student/enrolled-batches`,
          { withCredentials: true }
        );
        if (response.data?.success) {
          setBatches(response.data?.batches || []);
        } else {
          setBatches([]);
        }
      } catch {
        setBatches([]);
      } finally {
        setBatchesLoading(false);
      }
    };

    fetchEnrolledBatches();
  }, []);

  const userName = user?.user_id?.fname || user?.user?.user_id?.fname || "Student";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const activeBatches = useMemo(
    () => batches.filter((batch) => batch?.status === "active"),
    [batches]
  );

  const averageProgress = useMemo(() => {
    if (!batches.length) return 0;
    const values = batches
      .map((batch) => Number(batch?.progress || 0))
      .filter((value) => Number.isFinite(value));
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }, [batches]);

  const nextBatch = activeBatches[0];

  const statCards = [
    {
      label: "Available Courses",
      value: tenantCourses.length,
      icon: <FaBookOpen />,
      hint: "Start a new learning path",
    },
    {
      label: "My Batches",
      value: batchesLoading ? "..." : batches.length,
      icon: <FaLayerGroup />,
      hint: "All enrolled classes",
    },
    {
      label: "Active Classes",
      value: batchesLoading ? "..." : activeBatches.length,
      icon: <FaPlayCircle />,
      hint: "Currently running batches",
    },
    {
      label: "Avg. Progress",
      value: `${averageProgress}%`,
      icon: <FaChartLine />,
      hint: "Overall class completion",
    },
  ];

  const topCourses = tenantCourses.slice(0, 4);

  return (
    <div className="modern-grid student-dashboard">
      <div className="modern-card student-hero" style={{ gridColumn: "span 12" }}>
        <div className="row align-items-center g-4">
          <div className="col-xl-8">
            <p className="student-eyebrow mb-2">{greeting}</p>
            <h2 className="student-hero-title mb-2">
              {userName}, ready to continue learning?
            </h2>
            <p className="student-hero-subtitle mb-3">
              Overview of your courses, batches, and learning momentum in one place.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="student-chip">
                <FaBookOpen /> {tenantCourses.length} Courses
              </span>
              <span className="student-chip">
                <FaLayerGroup /> {batchesLoading ? "..." : batches.length} Batches
              </span>
              <span className="student-chip">
                <FaChartLine /> {averageProgress}% Progress
              </span>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="student-hero-actions">
              <button
                className="btn btn-light fw-semibold rounded-pill px-4 py-2"
                onClick={() => navigate("/student/courses")}
              >
                Browse Courses <FaChevronRight className="ms-2 small" />
              </button>
              <button
                className="btn btn-outline-light fw-semibold rounded-pill px-4 py-2"
                onClick={() => navigate("/student/batches")}
              >
                Open My Batches
              </button>
            </div>
          </div>
        </div>
      </div>

      {statCards.map((card) => (
        <div
          key={card.label}
          className="modern-card student-stat-card"
          style={{ gridColumn: "span 3" }}
        >
          <div className="student-stat-icon">{card.icon}</div>
          <p className="student-stat-label mb-1">{card.label}</p>
          <h4 className="student-stat-value mb-1">{card.value}</h4>
          <small className="text-muted">{card.hint}</small>
        </div>
      ))}

      <div className="modern-card" style={{ gridColumn: "span 8" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Continue Learning</h5>
            <p className="text-muted small mb-0">
              Quick access to available courses.
            </p>
          </div>
          <button
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={() => navigate("/student/courses")}
          >
            View All
          </button>
        </div>

        {coursesLoading ? (
          <p className="text-muted mb-0">Loading courses...</p>
        ) : topCourses.length > 0 ? (
          <div className="student-course-list">
            {topCourses.map((course) => (
              <button
                key={course?._id}
                className="student-course-row"
                onClick={() => navigate(`/student/viewcourse/${course?._id}`)}
              >
                <span className="student-course-icon">
                  <FaBookOpen />
                </span>
                <span className="student-course-content">
                  <strong>{course?.course_title || "Untitled Course"}</strong>
                  <small>
                    {course?.level?.course_level || "General"} -{" "}
                    {course?.language?.language || "Any language"}
                  </small>
                </span>
                <FaChevronRight className="text-muted" />
              </button>
            ))}
          </div>
        ) : (
          <div className="student-empty-state">
            <p className="mb-2">No courses available yet.</p>
            <button
              className="btn btn-sm btn-primary rounded-pill px-3"
              onClick={() => navigate("/student/courses")}
            >
              Explore Courses
            </button>
          </div>
        )}
      </div>

      <div className="modern-card student-activity-card" style={{ gridColumn: "span 12" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">My Enrolled Batches</h5>
            <p className="text-muted small mb-0">Join your live classes</p>
          </div>
          <button
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={() => navigate("/student/batches")}
          >
            View All <FaChevronRight className="ms-1 small" />
          </button>
        </div>

        {batchesLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading your batches...</p>
          </div>
        ) : batches.length > 0 ? (
          <div className="row g-3">
            {batches.slice(0, 4).map((batch) => {
              const isLive = checkIsLive(batch);
              return (
                <div key={batch._id} className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className={`badge rounded-pill ${isLive ? 'bg-danger' : batch.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {isLive ? 'LIVE' : batch.status}
                        </span>
                        {isLive && (
                          <span className="badge bg-danger bg-opacity-10 text-danger">
                            <FaVideo className="me-1" size={10} /> Live Now
                          </span>
                        )}
                      </div>
                      
                      <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>
                        {batch.batch_name}
                      </h6>
                      <p className="small text-muted mb-2 text-truncate">
                        {batch.course_id?.course_title}
                      </p>
                      
                      <div className="d-flex align-items-center gap-2 mb-2 small text-muted">
                        <FaCalendarAlt className="text-primary" size={12} />
                        <span style={{ fontSize: '0.75rem' }}>
                          {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2 mb-2 small text-muted">
                        <FaClock className="text-primary" size={12} />
                        <span style={{ fontSize: '0.75rem' }}>
                          {batch.batch_time || 'Time TBD'}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${batch.progress || 0}%`, borderRadius: '10px' }}
                          ></div>
                        </div>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {batch.progress || 0}% Complete
                        </small>
                      </div>
                      
                      {isLive ? (
                        <button
                          className="btn btn-danger btn-sm w-100 rounded-pill fw-bold"
                          onClick={() => handleJoinClass(batch)}
                          style={{ 
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            border: 'none'
                          }}
                        >
                          <FaVideo className="me-2" size={12} /> Join Class
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-secondary btn-sm w-100 rounded-pill"
                          disabled
                          style={{ fontSize: '0.75rem' }}
                        >
                          <FaClock className="me-2" size={12} /> Class Not Started
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <FaLayerGroup className="text-muted mb-2" size={40} />
            <p className="text-muted">You haven't enrolled in any batches yet.</p>
            <button
              className="btn btn-sm btn-primary rounded-pill px-3 mt-2"
              onClick={() => navigate("/student/courses")}
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
