import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCourses,
  fetchAllStudentsForInstructor,
  fetchMyBatches,
} from "../../redux/instructor/instructor.slice";
import { fetchUser } from "../../redux/user.slice";

export default function InstructorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  // Instructor Redux State
  const {
    courses: allCourses,
    allStudents,
    myBatches: activeBatches,
    myBatchesLoading: activeBatchesLoading,
  } = useSelector((state) => state.instructor);

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchCourses());
    dispatch(fetchAllStudentsForInstructor());
    dispatch(fetchMyBatches());
  }, [dispatch]);

  // Calculate Stats
  const totalStudents = allStudents?.total_students || 0;
  const totalCourses = allCourses?.length || 0;
  const totalBatches = activeBatches?.length || 0;

  // Get recent batches (first 3)
  const recentBatches = activeBatches?.slice(0, 3) || [];

  return (
    <div className="modern-grid">
      {/* Welcome Card */}
      <div
        className="modern-card"
        style={{
          gridColumn: "span 12",
          background: "linear-gradient(135deg, #4c5096 0%, #667eea 100%)",
          color: "#fff",
          border: "none",
        }}
      >
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <h2 className="display-6 fw-bold mb-2">
              Welcome back, {user?.user?.user_id?.fname || "Instructor"}!
            </h2>
            <p
              className="lead mb-0"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Here's what's happening with your courses and students today.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <button
              className="btn btn-light btn-lg px-4 rounded-pill fw-bold shadow-sm"
              onClick={() => navigate("/instructor/instructor_courses")}
            >
              View Courses <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="modern-card p-4" style={{ gridColumn: "span 4" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-pink-light p-3 rounded-4">
            <i className="fa-solid fa-user-graduate text-pink fs-3"></i>
          </div>
          <div>
            <h3 className="mb-0 fw-bold">{totalStudents}</h3>
            <small
              className="text-muted text-uppercase fw-semibold"
              style={{ fontSize: "10px", letterSpacing: "1px" }}
            >
              Total Students
            </small>
          </div>
        </div>
      </div>

      <div className="modern-card p-4" style={{ gridColumn: "span 4" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 p-3 rounded-4">
            <i className="fa-solid fa-book text-primary fs-3"></i>
          </div>
          <div>
            <h3 className="mb-0 fw-bold">{totalCourses}</h3>
            <small
              className="text-muted text-uppercase fw-semibold"
              style={{ fontSize: "10px", letterSpacing: "1px" }}
            >
              Active Courses
            </small>
          </div>
        </div>
      </div>

      <div className="modern-card p-4" style={{ gridColumn: "span 4" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-success bg-opacity-10 p-3 rounded-4">
            <i className="fa-solid fa-layer-group text-success fs-3"></i>
          </div>
          <div>
            <h3 className="mb-0 fw-bold">{totalBatches}</h3>
            <small
              className="text-muted text-uppercase fw-semibold"
              style={{ fontSize: "10px", letterSpacing: "1px" }}
            >
              Active Batches
            </small>
          </div>
        </div>
      </div>

      {/* Recent Batches / Courses */}
      <div className="modern-card" style={{ gridColumn: "span 12" }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h5 className="mb-1 fw-bold">Active Batches</h5>
            <small className="text-muted">Your currently running batches</small>
          </div>
          <button
            className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
            onClick={() => navigate("/instructor/batches")}
          >
            View All Batches
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle custom-table">
            <thead className="bg-light">
              <tr>
                <th className="border-0 rounded-start">Batch Name</th>
                <th className="border-0">Course</th>
                <th className="border-0">Start Date</th>
                <th className="border-0">Status</th>
                <th className="border-0 text-end rounded-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeBatchesLoading ? (
                <tr><td colSpan="5" className="text-center py-4">Loading batches...</td></tr>
              ) : recentBatches.length > 0 ? (
                recentBatches.map((batch, i) => (
                  <tr key={batch.id || i}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="avatar-placeholder bg-soft-primary text-indigo rounded-3 d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {batch.batch_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">
                            {batch.batch_name}
                          </div>
                          <small className="text-muted">
                            Code: {batch.batch_code || "N/A"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{batch.course_title}</td>
                    <td>{new Date(batch.start_date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2">
                        Active
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-light rounded-circle shadow-sm"
                        onClick={() => navigate('/instructor/batches')}
                      >
                        <i className="fa-solid fa-chevron-right text-muted"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No active batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
