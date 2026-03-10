import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/api/axiosInstance';
import './attendance-dashboard.css';

const performanceTone = (value) => {
  if (value >= 85) return { label: 'Excellent', className: 'success' };
  if (value >= 65) return { label: 'Stable', className: 'warning' };
  return { label: 'Needs Attention', className: 'danger' };
};

const CourseBatchAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const COLORS = ['#0f766e', '#f59e0b', '#dc2626'];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchBatchesForCourse(selectedCourse);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse && selectedBatch) {
      fetchAttendanceData();
    }
  }, [selectedCourse, selectedBatch, dateRange]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchBatchesForCourse = async (courseId) => {
    try {
      const response = await api.get(`/batch/course/${courseId}`);
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance/course-batch-summary', {
        params: {
          course_id: selectedCourse,
          batch_id: selectedBatch,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        }
      });
      
      if (response.data.success) {
        setAttendanceData(response.data.data.students);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await api.get('/attendance/course-batch-pdf', {
        params: {
          course_id: selectedCourse,
          batch_id: selectedBatch,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        },
        responseType: 'blob' // Important for downloading files
      });

      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `course-batch-attendance-${dateRange.startDate}-${dateRange.endDate}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Handle error appropriately
    }
  };

  // Prepare data for charts
  const studentAttendanceData = attendanceData.map(student => ({
    name: `${student.student.fname} ${student.student.lname}`,
    attendance_percentage: student.summary.attendance_percentage,
    present: student.summary.present,
    late: student.summary.late,
    absent: student.summary.absent
  }));

  const overallStats = attendanceData.reduce((acc, student) => {
    acc.totalClasses += student.summary.total_classes;
    acc.attended += student.summary.attended;
    acc.present += student.summary.present;
    acc.late += student.summary.late;
    acc.absent += student.summary.absent;
    return acc;
  }, { totalClasses: 0, attended: 0, present: 0, late: 0, absent: 0 });

  const overallAttendanceRate = overallStats.totalClasses > 0 
    ? (overallStats.attended / overallStats.totalClasses) * 100 
    : 0;

  const punctualityRate = overallStats.attended > 0
    ? (overallStats.present / overallStats.attended) * 100
    : 0;

  const averageClassesPerStudent = attendanceData.length > 0
    ? overallStats.totalClasses / attendanceData.length
    : 0;

  const rankedStudents = [...attendanceData].sort(
    (a, b) => b.summary.attendance_percentage - a.summary.attendance_percentage
  );
  const topPerformer = rankedStudents[0];
  const atRiskStudents = attendanceData.filter(
    (student) => Number(student.summary.attendance_percentage || 0) < 50
  );

  const selectedCourseName = courses.find((course) => course._id === selectedCourse)?.course_title || 'Not selected';
  const selectedBatchName = batches.find((batch) => batch._id === selectedBatch)?.batch_name || 'Not selected';
  const dateSpanDays = Math.max(
    1,
    Math.round((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-layout-content p-4 attendance-dashboard-page course-batch-report-page">
      <div className="modern-card course-batch-hero">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <span className="course-batch-kicker">Attendance Intelligence</span>
            <h2 className="fw-bold mb-2">Course & Batch Attendance Report</h2>
            <p className="mb-0 course-batch-hero-copy">
              Review participation trends, identify low-attendance learners early, and export a cleaner report for your team.
            </p>
          </div>
          <div className="course-batch-hero-meta">
            <div>
              <span>Range</span>
              <strong>{dateRange.startDate} to {dateRange.endDate}</strong>
            </div>
            <div>
              <span>Window</span>
              <strong>{dateSpanDays} day{dateSpanDays === 1 ? '' : 's'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-card attendance-filter-card">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
          <label className="form-label">Select Course</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedBatch('');
            }}
          >
            <option value="">Choose a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.course_title}
              </option>
            ))}
          </select>
          </div>
          <div className="col-md-3">
          <label className="form-label">Select Batch</label>
          <select
            className="form-select"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            disabled={!selectedCourse}
          >
            <option value="">Choose a batch</option>
            {batches.map(batch => (
              <option key={batch._id} value={batch._id}>
                {batch.batch_name}
              </option>
            ))}
          </select>
          </div>
          <div className="col-md-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
          </div>
          <div className="col-md-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
          </div>
        </div>
      </div>

      <div className="modern-card attendance-context-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h6 className="fw-bold mb-1">Current Report Scope</h6>
            <p className="mb-0 text-muted small">
              {selectedCourseName} | {selectedBatchName}
            </p>
          </div>
          <button 
            className="btn btn-success rounded-pill px-4 course-batch-download-btn"
            onClick={downloadPDF}
            disabled={attendanceData.length === 0}
          >
            <i className="fa-solid fa-download me-2"></i>
            Download Detailed PDF
          </button>
        </div>
      </div>

      {selectedCourse && selectedBatch && (
        <>
          <div className="attendance-stat-grid">
            <div className="modern-card attendance-stat-card primary">
              <div className="attendance-stat-icon">
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1">{attendanceData.length}</h4>
                <p className="text-muted mb-0 small">Students in Report</p>
              </div>
            </div>
            <div className="modern-card attendance-stat-card info">
              <div className="attendance-stat-icon">
                <i className="fa-solid fa-calendar-day"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1">{overallStats.totalClasses}</h4>
                <p className="text-muted mb-0 small">Total Class Records</p>
              </div>
            </div>
            <div className="modern-card attendance-stat-card success">
              <div className="attendance-stat-icon">
                <i className="fa-solid fa-check-circle"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1">{overallAttendanceRate.toFixed(1)}%</h4>
                <p className="text-muted mb-0 small">Overall Attendance Rate</p>
              </div>
            </div>
            <div className="modern-card attendance-stat-card secondary">
              <div className="attendance-stat-icon">
                <i className="fa-solid fa-stopwatch"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1">{punctualityRate.toFixed(1)}%</h4>
                <p className="text-muted mb-0 small">Punctuality Among Attendees</p>
              </div>
            </div>
          </div>

          <div className="attendance-chart-grid">
            <div className="modern-card course-batch-chart-card">
              <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
                <div>
                  <h5 className="card-title mb-1">Student Attendance Percentage</h5>
                  <p className="text-muted small mb-0">Quick comparison across the selected date range</p>
                </div>
                <span className="course-batch-chip">{averageClassesPerStudent.toFixed(1)} avg classes/student</span>
              </div>
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={studentAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                      <Legend />
                      <Bar dataKey="attendance_percentage" name="Attendance %" fill="#0f5ab8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
            </div>

            <div className="modern-card course-batch-chart-card">
              <h5 className="card-title mb-1">Overall Status Distribution</h5>
              <p className="text-muted small mb-3">Present, late, and absent records in the current report</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: overallStats.present },
                          { name: 'Late', value: overallStats.late },
                          { name: 'Absent', value: overallStats.absent }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((fill) => (
                          <Cell key={fill} fill={fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
              <div className="course-batch-distribution-legend">
                <span><i style={{ backgroundColor: COLORS[0] }}></i>Present</span>
                <span><i style={{ backgroundColor: COLORS[1] }}></i>Late</span>
                <span><i style={{ backgroundColor: COLORS[2] }}></i>Absent</span>
              </div>
            </div>
          </div>

          <div className="course-batch-insights-grid">
            <div className="modern-card course-batch-insight-card">
              <div className="course-batch-insight-label">Top Performer</div>
              <h5 className="fw-bold mb-1">
                {topPerformer ? `${topPerformer.student.fname} ${topPerformer.student.lname}` : 'No data'}
              </h5>
              <p className="text-muted mb-0">
                {topPerformer ? `${Number(topPerformer.summary.attendance_percentage).toFixed(1)}% attendance with ${topPerformer.summary.attended}/${topPerformer.summary.total_classes} attended classes.` : 'No attendance records in the selected period.'}
              </p>
            </div>
            <div className="modern-card course-batch-insight-card">
              <div className="course-batch-insight-label">Needs Attention</div>
              <h5 className="fw-bold mb-1">{atRiskStudents.length}</h5>
              <p className="text-muted mb-0">
                Students below 50% attendance in this report window.
              </p>
            </div>
          </div>

          <div className="modern-card">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div>
                <h5 className="card-title mb-1">Student Attendance Details</h5>
                <p className="text-muted small mb-0">Detailed breakdown for review and follow-up</p>
              </div>
            </div>
              <div className="table-responsive attendance-table-wrap course-batch-table-wrap">
                <table className="table table-hover attendance-table course-batch-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student Name</th>
                      <th>Total Classes</th>
                      <th>Attended</th>
                      <th>Present</th>
                      <th>Late</th>
                      <th>Absent</th>
                      <th>Performance</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedStudents.map((student, index) => {
                      const tone = performanceTone(Number(student.summary.attendance_percentage || 0));
                      return (
                      <tr key={index}>
                        <td data-label="Rank">
                          <span className="course-batch-rank-badge">#{index + 1}</span>
                        </td>
                        <td data-label="Student Name">
                          {student.student.fname} {student.student.lname}
                          <br />
                          <small className="text-muted">{student.student.user_code}</small>
                        </td>
                        <td data-label="Total Classes">{student.summary.total_classes}</td>
                        <td data-label="Attended">{student.summary.attended}</td>
                        <td data-label="Present">
                          <span className="badge bg-success">{student.summary.present}</span>
                        </td>
                        <td data-label="Late">
                          <span className="badge bg-warning">{student.summary.late}</span>
                        </td>
                        <td data-label="Absent">
                          <span className="badge bg-danger">{student.summary.absent}</span>
                        </td>
                        <td data-label="Performance">
                          <span className={`badge text-bg-${tone.className}`}>{tone.label}</span>
                        </td>
                        <td data-label="Attendance %">
                          <div className="d-flex align-items-center course-batch-progress-cell">
                            <span className="fw-bold me-2">{Number(student.summary.attendance_percentage || 0).toFixed(1)}%</span>
                            <div className="progress flex-grow-1" style={{ height: '10px' }}>
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${student.summary.attendance_percentage}%`,
                                  backgroundColor: student.summary.attendance_percentage >= 75 ? '#16a34a' : 
                                                  student.summary.attendance_percentage >= 50 ? '#f59e0b' : '#dc2626'
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
          </div>
        </>
      )}

      {!selectedCourse && (
        <div className="alert alert-info">
          <i className="fa-solid fa-info-circle me-2"></i>
          Please select a course and batch to view attendance data.
        </div>
      )}
    </div>
  );
};

export default CourseBatchAttendance;
