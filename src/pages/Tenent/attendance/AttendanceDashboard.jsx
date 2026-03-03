import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/api/axiosInstance";
import "./attendance-dashboard.css";

const AttendanceDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    viewMode: "daily",
    courseId: "",
    batchId: "",
    date: new Date().toISOString().split("T")[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const STATUS_COLORS = {
    present: "#25b579",
    late: "#f3b42a",
    absent: "#ef5d63",
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        if (response.data?.success) {
          setCourses(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setErrorMessage("Failed to load courses.");
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!filters.courseId) {
        setBatches([]);
        return;
      }

      try {
        const response = await api.get(`/batch/course/${filters.courseId}`);
        if (response.data?.success) {
          setBatches(response.data.data || []);
        } else {
          setBatches([]);
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
        setBatches([]);
      }
    };

    fetchBatches();
  }, [filters.courseId]);

  const selectedCourseName = useMemo(() => {
    const selected = courses.find((course) => course._id === filters.courseId);
    return selected?.course_title || "Not selected";
  }, [courses, filters.courseId]);

  const selectedBatchName = useMemo(() => {
    const selected = batches.find((batch) => batch._id === filters.batchId);
    return selected?.batch_name || "Not selected";
  }, [batches, filters.batchId]);

  const dailyStatusData = useMemo(() => {
    return [
      { status: "Present", value: Number(summary.present || 0), fill: STATUS_COLORS.present },
      { status: "Late", value: Number(summary.late || 0), fill: STATUS_COLORS.late },
      { status: "Absent", value: Number(summary.absent || 0), fill: STATUS_COLORS.absent },
    ];
  }, [summary]);

  const monthlyStudentChartData = useMemo(() => {
    return (attendanceData || [])
      .map((item) => ({
        name: `${item.student?.fname || ""} ${item.student?.lname || ""}`.trim() || "Unknown",
        attendance_percentage: Number(item.summary?.attendance_percentage || 0),
      }))
      .sort((a, b) => b.attendance_percentage - a.attendance_percentage)
      .slice(0, 10);
  }, [attendanceData]);

  const monthlyPieData = useMemo(() => {
    const avg = Number(summary.average_attendance_percentage || 0);
    const clipped = Math.min(100, Math.max(0, avg));
    return [
      { name: "Average Attendance", value: clipped },
      { name: "Gap", value: 100 - clipped },
    ];
  }, [summary]);

  const isReady = Boolean(filters.courseId && filters.batchId);

  const filteredTableRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return attendanceData;

    if (filters.viewMode === "daily") {
      return attendanceData.filter((row) => {
        const fullName = `${row.student_id?.fname || ""} ${row.student_id?.lname || ""}`.toLowerCase();
        const status = String(row.status || "").toLowerCase();
        const code = String(row.student_id?.user_code || "").toLowerCase();
        return fullName.includes(query) || status.includes(query) || code.includes(query);
      });
    }

    return attendanceData.filter((row) => {
      const fullName = `${row.student?.fname || ""} ${row.student?.lname || ""}`.toLowerCase();
      const code = String(row.student?.user_code || "").toLowerCase();
      return fullName.includes(query) || code.includes(query);
    });
  }, [attendanceData, filters.viewMode, searchTerm]);

  const fetchAttendanceData = async (forcedFilters = filters) => {
    if (!forcedFilters.courseId || !forcedFilters.batchId) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      let response;
      if (forcedFilters.viewMode === "daily") {
        response = await api.get("/attendance/daily-summary", {
          params: {
            date: forcedFilters.date,
            course_id: forcedFilters.courseId,
            batch_id: forcedFilters.batchId,
          },
        });
      } else {
        response = await api.get("/attendance/monthly-summary", {
          params: {
            student_id: "",
            course_id: forcedFilters.courseId,
            batch_id: forcedFilters.batchId,
            month: forcedFilters.month,
            year: forcedFilters.year,
          },
        });
      }

      if (response.data?.success) {
        if (forcedFilters.viewMode === "daily") {
          setAttendanceData(response.data.data?.records || []);
        } else {
          setAttendanceData(response.data.data?.students || []);
        }
        setSummary(response.data.data?.summary || {});
      } else {
        setAttendanceData([]);
        setSummary({});
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
      setSummary({});
      setErrorMessage("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    if (!isReady) return;
    setHasApplied(true);
    await fetchAttendanceData(filters);
  };

  const handleReset = () => {
    setFilters({
      viewMode: "daily",
      courseId: "",
      batchId: "",
      date: new Date().toISOString().split("T")[0],
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setBatches([]);
    setAttendanceData([]);
    setSummary({});
    setSearchTerm("");
    setHasApplied(false);
    setErrorMessage("");
  };

  const downloadDailyPDF = async () => {
    try {
      const response = await api.get("/attendance/daily-pdf", {
        params: {
          date: filters.date,
          course_id: filters.courseId,
          batch_id: filters.batchId,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `daily-attendance-${filters.date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading daily PDF:", error);
    }
  };

  const downloadMonthlyPDF = async () => {
    try {
      const response = await api.get("/attendance/monthly-pdf", {
        params: {
          course_id: filters.courseId,
          batch_id: filters.batchId,
          month: filters.month,
          year: filters.year,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `monthly-attendance-${filters.month}-${filters.year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading monthly PDF:", error);
    }
  };

  const summaryCards =
    filters.viewMode === "daily"
      ? [
          { label: "Total Records", value: summary.total || 0, tone: "primary", icon: "fa-users" },
          { label: "Present", value: summary.present || 0, tone: "success", icon: "fa-check" },
          { label: "Late", value: summary.late || 0, tone: "warning", icon: "fa-clock" },
          { label: "Absent", value: summary.absent || 0, tone: "danger", icon: "fa-xmark" },
        ]
      : [
          { label: "Students", value: summary.total_students || 0, tone: "primary", icon: "fa-users" },
          { label: "Classes", value: summary.total_classes || 0, tone: "info", icon: "fa-calendar-days" },
          { label: "Attended", value: summary.total_attended || 0, tone: "success", icon: "fa-check-circle" },
          {
            label: "Average",
            value: `${Number(summary.average_attendance_percentage || 0).toFixed(1)}%`,
            tone: "secondary",
            icon: "fa-percent",
          },
        ];

  return (
    <div className="attendance-dashboard-page">
      <div className="modern-card attendance-header-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold mb-1">Attendance Dashboard</h3>
            <p className="text-muted mb-0">
              Fast attendance insights for selected course and batch.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary rounded-pill px-3"
              onClick={() => navigate("/tenant/attendance/course-batch")}
            >
              Course-Batch View
            </button>
            <button className="btn btn-outline-secondary rounded-pill px-3" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="modern-card attendance-filter-card">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label">Mode</label>
            <select
              className="form-select"
              value={filters.viewMode}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  viewMode: e.target.value,
                }))
              }
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={filters.courseId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  courseId: e.target.value,
                  batchId: "",
                }))
              }
            >
              <option value="">Choose course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.course_title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label">Batch</label>
            <select
              className="form-select"
              value={filters.batchId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  batchId: e.target.value,
                }))
              }
              disabled={!filters.courseId}
            >
              <option value="">Choose batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.batch_name}
                </option>
              ))}
            </select>
          </div>

          {filters.viewMode === "daily" ? (
            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </div>
          ) : (
            <>
              <div className="col-12 col-sm-6 col-lg-1">
                <label className="form-label">Month</label>
                <select
                  className="form-select"
                  value={filters.month}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      month: Number(e.target.value),
                    }))
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((monthValue) => (
                    <option key={monthValue} value={monthValue}>
                      {monthValue}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6 col-lg-1">
                <label className="form-label">Year</label>
                <select
                  className="form-select"
                  value={filters.year}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      year: Number(e.target.value),
                    }))
                  }
                >
                  {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 4 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="col-12 col-lg-1 d-grid">
            <button
              className="btn btn-primary"
              onClick={handleApplyFilters}
              disabled={!isReady || loading}
            >
              {loading ? "..." : "Apply"}
            </button>
          </div>
        </div>
      </div>

      {!isReady && (
        <div className="alert alert-info">
          <i className="fa-solid fa-circle-info me-2"></i>
          Select course and batch, then click Apply.
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {errorMessage}
        </div>
      )}

      {hasApplied && !loading && isReady && (
        <>
          <div className="modern-card attendance-context-card">
            <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
              <div>
                <h6 className="fw-bold mb-1">Context</h6>
                <p className="mb-0 text-muted small">
                  {selectedCourseName} | {selectedBatchName}
                </p>
              </div>
              <button
                className="btn btn-success rounded-pill px-3"
                onClick={filters.viewMode === "daily" ? downloadDailyPDF : downloadMonthlyPDF}
                disabled={attendanceData.length === 0}
              >
                <i className="fa-solid fa-file-arrow-down me-2"></i>
                Download PDF
              </button>
            </div>
          </div>

          {attendanceData.length > 0 ? (
            <>
              <div className="attendance-stat-grid">
                {summaryCards.map((card) => (
                  <div className={`modern-card attendance-stat-card ${card.tone}`} key={card.label}>
                    <div className="attendance-stat-icon">
                      <i className={`fa-solid ${card.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">{card.value}</h4>
                      <p className="text-muted mb-0 small">{card.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="attendance-chart-grid">
                <div className="modern-card">
                  <h6 className="fw-bold mb-3">
                    {filters.viewMode === "daily" ? "Status Summary" : "Top 10 Attendance"}
                  </h6>
                  <ResponsiveContainer width="100%" height={300}>
                    {filters.viewMode === "daily" ? (
                      <BarChart data={dailyStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Count">
                          {dailyStatusData.map((entry) => (
                            <Cell key={entry.status} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <BarChart data={monthlyStudentChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} interval={0} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                        <Legend />
                        <Bar dataKey="attendance_percentage" name="Attendance %" fill="#3478f6" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="modern-card">
                  <h6 className="fw-bold mb-3">Distribution</h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={filters.viewMode === "daily" ? dailyStatusData : monthlyPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        nameKey={filters.viewMode === "daily" ? "status" : "name"}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {(filters.viewMode === "daily"
                          ? dailyStatusData
                          : [
                              { fill: "#25b579" },
                              { fill: "#d9dee8" },
                            ]
                        ).map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="modern-card">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                  <h6 className="fw-bold mb-0">
                    {filters.viewMode === "daily" ? "Daily Records" : "Monthly Records"}
                  </h6>
                  <div className="attendance-search-wrap">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search student or status..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-responsive attendance-table-wrap">
                  <table className="table table-hover align-middle attendance-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        {filters.viewMode === "daily" ? <th>Date</th> : <th>Month</th>}
                        <th>Status</th>
                        <th>{filters.viewMode === "daily" ? "Duration" : "Classes"}</th>
                        {filters.viewMode === "monthly" && <th>Attendance %</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTableRows.length > 0 ? (
                        filteredTableRows.map((row, idx) => (
                          <tr key={idx}>
                            <td>
                              {filters.viewMode === "daily"
                                ? `${row.student_id?.fname || ""} ${row.student_id?.lname || ""}`.trim()
                                : `${row.student?.fname || ""} ${row.student?.lname || ""}`.trim()}
                            </td>
                            <td>
                              {filters.viewMode === "daily"
                                ? new Date(row.date).toLocaleDateString()
                                : `${new Date(0, filters.month - 1).toLocaleString("default", { month: "short" })} ${filters.year}`}
                            </td>
                            <td>
                              {filters.viewMode === "daily" ? (
                                <span
                                  className={`badge ${
                                    row.status === "present"
                                      ? "bg-success"
                                      : row.status === "late"
                                      ? "bg-warning text-dark"
                                      : "bg-danger"
                                  }`}
                                >
                                  {String(row.status || "").toUpperCase()}
                                </span>
                              ) : (
                                <span
                                  className={`badge ${
                                    Number(row.summary?.attendance_percentage || 0) >= 75
                                      ? "bg-success"
                                      : Number(row.summary?.attendance_percentage || 0) >= 50
                                      ? "bg-warning text-dark"
                                      : "bg-danger"
                                  }`}
                                >
                                  {Number(row.summary?.attendance_percentage || 0).toFixed(1)}%
                                </span>
                              )}
                            </td>
                            <td>
                              {filters.viewMode === "daily"
                                ? `${Math.round(Number(row.total_duration_seconds || 0) / 60)} min`
                                : `${row.summary?.attended || 0}/${row.summary?.total_classes || 0}`}
                            </td>
                            {filters.viewMode === "monthly" && (
                              <td>
                                <div className="attendance-progress-cell">
                                  <span>{Number(row.summary?.attendance_percentage || 0).toFixed(1)}%</span>
                                  <div className="progress">
                                    <div
                                      className="progress-bar"
                                      style={{ width: `${Math.min(100, Math.max(0, Number(row.summary?.attendance_percentage || 0)))}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={filters.viewMode === "daily" ? 4 : 5} className="text-center py-4">
                            No records match the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="modern-card attendance-empty">
              <i className="fa-solid fa-calendar-xmark"></i>
              <h5 className="mt-3 mb-1">No attendance data found</h5>
              <p className="text-muted mb-0">
                Try another date/month or verify that classes were conducted.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceDashboard;
