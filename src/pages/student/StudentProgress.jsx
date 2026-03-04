import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaTrophy, FaChartLine, FaCheckCircle } from "react-icons/fa";
import api from "@/api/axiosInstance";

const StudentProgress = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledBatches = async () => {
      try {
        setLoading(true);
        const res = await api.get("/batch-student/student/enrolled-batches");
        if (res.data?.success) {
          setBatches(Array.isArray(res.data?.batches) ? res.data.batches : []);
        } else {
          setBatches([]);
        }
      } catch (err) {
        setBatches([]);
        toast.error(err?.response?.data?.message || "Failed to load your progress");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledBatches();
  }, []);

  const rows = useMemo(() => {
    const clampProgress = (value) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return 0;
      return Math.min(100, Math.max(0, Math.round(parsed)));
    };

    const getCourseTitle = (course) =>
      course?.course_title || course?.title || course?.course_name || "Untitled Course";

    const resolveStatus = (enrollment) => {
      const progress = clampProgress(enrollment?.progress);
      const enrollmentStatus = enrollment?.enrollment_status || enrollment?.status;

      if (enrollmentStatus === "dropped") return "Dropped";
      if (enrollmentStatus === "suspended") return "Suspended";
      if (enrollmentStatus === "completed" || progress >= 100) return "Completed";
      if (progress > 0) return "In Progress";
      return "Not Started";
    };

    return (Array.isArray(batches) ? batches : []).map((enrollment) => {
      const course = enrollment?.course_id;
      const progress = clampProgress(enrollment?.progress);
      const status = resolveStatus(enrollment);
      const enrolledDate = enrollment?.joined_at ? new Date(enrollment.joined_at) : null;

      return {
        id: enrollment?._id || enrollment?.batch_id || `${getCourseTitle(course)}-${progress}`,
        batchId: enrollment?.batch_id,
        batchName: enrollment?.batch_name || "Batch",
        courseId: course?._id,
        courseTitle: getCourseTitle(course),
        status,
        progress,
        enrolledAtLabel: enrolledDate ? enrolledDate.toLocaleDateString() : "-",
      };
    });
  }, [batches]);

  const stats = useMemo(() => {
    const progressValues = rows.map((r) => r.progress).filter((v) => Number.isFinite(v));
    const averageProgress = progressValues.length
      ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
      : 0;

    const completedCount = rows.filter((r) => r.status === "Completed").length;
    const inProgressCount = rows.filter((r) => r.status === "In Progress").length;

    const topActivity = [...rows]
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 7);

    return {
      averageProgress,
      completedCount,
      inProgressCount,
      total: rows.length,
      topActivity,
    };
  }, [rows]);

  const overallPercent = stats.averageProgress;

  const badgeClassForStatus = (status) => {
    if (status === "Completed") return "bg-success bg-opacity-10 text-success";
    if (status === "In Progress") return "bg-primary bg-opacity-10 text-primary";
    if (status === "Suspended") return "bg-warning bg-opacity-10 text-warning";
    if (status === "Dropped") return "bg-danger bg-opacity-10 text-danger";
    return "bg-secondary bg-opacity-10 text-secondary";
  };

  return (
    <div className="modern-grid fade-in">
      {/* Header with Back Button */}
      <div className="modern-card" style={{ gridColumn: "span 12" }}>
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light rounded-circle shadow-sm border d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <FaArrowLeft className="text-secondary" />
          </button>
          <div>
            <h4 className="fw-bold mb-0">My Progress</h4>
            <p className="text-muted small mb-0">Your enrolled batches and course completion</p>
          </div>
        </div>
      </div>

      {/* Overview + Table */}
      <div className="col-span-12 lg:col-span-8" style={{ gridColumn: "span 8" }}>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="modern-card h-100 bg-primary text-white border-0 position-relative overflow-hidden">
              <div className="position-relative z-10">
                <h2 className="display-4 fw-bold mb-0">{overallPercent}%</h2>
                <p className="opacity-75 mb-0">Overall Completion Rate</p>
                <div className="progress bg-white bg-opacity-25 mt-3" style={{ height: "8px" }}>
                  <div className="progress-bar bg-white" style={{ width: `${overallPercent}%` }}></div>
                </div>
                <small className="opacity-75 d-block mt-2">
                  {stats.total ? `${stats.total} enrolled batch${stats.total === 1 ? "" : "es"}` : "No enrollments yet"}
                </small>
              </div>
              <FaChartLine
                className="position-absolute bottom-0 end-0 opacity-25"
                style={{ fontSize: "8rem", marginBottom: "-1rem", marginRight: "-1rem" }}
              />
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
                      <h5 className="fw-bold mb-0">{stats.completedCount}</h5>
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
                      <h5 className="fw-bold mb-0">{stats.inProgressCount}</h5>
                      <small className="text-muted">In Progress</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Progress Table */}
        <div className="modern-card mt-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <h5 className="fw-bold mb-0">Course Progress</h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3"
              onClick={() => navigate("/student/batches")}
            >
              View My Batches
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted mb-0">Loading your progress...</p>
            </div>
          ) : rows.length ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 rounded-start ps-3">Course</th>
                    <th className="border-0">Batch</th>
                    <th className="border-0">Status</th>
                    <th className="border-0" style={{ width: "28%" }}>
                      Progress
                    </th>
                    <th className="border-0">Enrolled</th>
                    <th className="border-0 rounded-end text-end pe-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-3 fw-semibold text-dark">{item.courseTitle}</td>
                      <td className="text-muted small">{item.batchName}</td>
                      <td>
                        <span className={`badge rounded-pill ${badgeClassForStatus(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar ${item.progress >= 100 ? "bg-success" : "bg-primary"}`}
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                          <small className="text-muted w-25 text-end">{item.progress}%</small>
                        </div>
                      </td>
                      <td className="text-muted small">{item.enrolledAtLabel}</td>
                      <td className="text-end pe-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          disabled={!item.courseId}
                          onClick={() => item.courseId && navigate(`/student/viewcourse/${item.courseId}`)}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted mb-2">No progress to show yet.</p>
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill px-3"
                onClick={() => navigate("/student/courses")}
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="col-span-12 lg:col-span-4" style={{ gridColumn: "span 4" }}>
        <div className="modern-card h-100">
          <h5 className="fw-bold mb-4">Learning Activity</h5>

          <div
            className="d-flex align-items-end justify-content-between px-2 pb-2 border-bottom mb-4"
            style={{ minHeight: "150px" }}
          >
            {stats.topActivity.length ? (
              stats.topActivity.map((item) => (
                <div
                  key={item.id}
                  className="bg-primary bg-opacity-75 rounded-top"
                  style={{ width: "10%", height: `${Math.max(6, item.progress)}%` }}
                  title={`${item.courseTitle}: ${item.progress}%`}
                ></div>
              ))
            ) : (
              <div className="text-muted small w-100 text-center py-4">No activity yet</div>
            )}
          </div>

          <h6 className="fw-bold mb-3">Highlights</h6>
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
              <FaCheckCircle className="text-success fs-4" />
              <div>
                <h6 className="fw-bold mb-0">{stats.completedCount ? "Completed" : "Get Started"}</h6>
                <small className="text-muted">
                  {stats.completedCount
                    ? `${stats.completedCount} course${stats.completedCount === 1 ? "" : "s"} completed`
                    : "Start a course to see progress here"}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
              <FaTrophy className="text-warning fs-4" />
              <div>
                <h6 className="fw-bold mb-0">Keep Going</h6>
                <small className="text-muted">
                  {stats.inProgressCount
                    ? `${stats.inProgressCount} course${stats.inProgressCount === 1 ? "" : "s"} in progress`
                    : "Enroll in a batch to start learning"}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
