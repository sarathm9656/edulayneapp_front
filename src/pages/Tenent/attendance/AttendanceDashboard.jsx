import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/api/axiosInstance';

const AttendanceDashboard = () => {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    // Only fetch data when required parameters are selected
    if (selectedCourse && selectedBatch) {
      fetchAttendanceData();
    } else {
      // Reset data when course or batch not selected
      setAttendanceData([]);
      setSummary({});
    }
  }, [selectedCourse, selectedBatch, selectedDate, selectedMonth, selectedYear, viewMode]);

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

  useEffect(() => {
    if (selectedCourse) {
      fetchBatchesForCourse(selectedCourse);
    } else {
      setBatches([]);
    }
  }, [selectedCourse]);

  const fetchAttendanceData = async () => {
    try {
      // Only fetch if required parameters are provided
      if (!selectedCourse || !selectedBatch) {
        setAttendanceData([]);
        setSummary({});
        return;
      }

      setLoading(true);

      let response;
      if (viewMode === 'daily') {
        response = await api.get('/attendance/daily-summary', {
          params: {
            date: selectedDate,
            course_id: selectedCourse,
            batch_id: selectedBatch
          }
        });
      } else {
        response = await api.get('/attendance/monthly-summary', {
          params: {
            student_id: '', // Empty to get all students for admin view
            course_id: selectedCourse,
            batch_id: selectedBatch,
            month: selectedMonth,
            year: selectedYear
          }
        });
      }

      if (response.data.success) {
        if (viewMode === 'daily') {
          // For daily view, use records
          setAttendanceData(response.data.data.records || []);
          setSummary(response.data.data.summary || {});
        } else {
          // For monthly view, use students data
          setAttendanceData(response.data.data.students || []);
          setSummary(response.data.data.summary || {});
        }
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDailyPDF = async () => {
    try {
      const response = await api.get('/attendance/daily-pdf', {
        params: {
          date: selectedDate,
          course_id: selectedCourse,
          batch_id: selectedBatch
        },
        responseType: 'blob' // Important for downloading files
      });

      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daily-attendance-report-${selectedDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading daily PDF:', error);
      // Handle error appropriately
    }
  };

  const downloadMonthlyPDF = async () => {
    try {
      const response = await api.get('/attendance/monthly-pdf', {
        params: {
          course_id: selectedCourse,
          batch_id: selectedBatch,
          month: selectedMonth,
          year: selectedYear
        },
        responseType: 'blob' // Important for downloading files
      });

      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `monthly-attendance-report-${selectedMonth}-${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading monthly PDF:', error);
      // Handle error appropriately
    }
  };

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
    <div className="modern-layout-content p-4">
      <div className="mb-4">
        <h2 className="fw-bold">Attendance Dashboard</h2>
        <p className="text-muted">Track and monitor student attendance across courses and batches</p>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-2">
          <label className="form-label">View Mode</label>
          <select
            className="form-select"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Select Course</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedBatch('');
            }}
          >
            <option value="">Choose Course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.course_title}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Select Batch</label>
          <select
            className="form-select"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            disabled={!selectedCourse}
          >
            <option value="">Choose Batch</option>
            {batches.map(batch => (
              <option key={batch._id} value={batch._id}>
                {batch.batch_name}
              </option>
            ))}
          </select>
        </div>

        {viewMode === 'daily' ? (
          <div className="col-md-2">
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="col-md-2">
              <label className="form-label">Select Month</label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Select Year</label>
              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-primary w-100"
            onClick={fetchAttendanceData}
            disabled={!selectedCourse || !selectedBatch}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Show message when no course or batch selected */}
      {(!selectedCourse || !selectedBatch) && (
        <div className="alert alert-info">
          <i className="fa-solid fa-info-circle me-2"></i>
          Please select a course and batch to view attendance data.
        </div>
      )}

      {/* Action Buttons - Only show when data is loaded */}
      {(selectedCourse && selectedBatch && attendanceData.length > 0) && (
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="d-flex gap-2">
              {viewMode === 'daily' ? (
                <button
                  className="btn btn-success"
                  onClick={downloadDailyPDF}
                  disabled={attendanceData.length === 0}
                >
                  <i className="fa-solid fa-download me-2"></i>
                  Download Daily Attendance PDF
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={downloadMonthlyPDF}
                  disabled={attendanceData.length === 0}
                >
                  <i className="fa-solid fa-download me-2"></i>
                  Download Monthly Attendance PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards - Only show when data is loaded */}
      {(selectedCourse && selectedBatch && attendanceData.length > 0) && (
        <div className="row mb-4">
          {viewMode === 'daily' ? (
            <>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="fa-solid fa-users text-primary fs-3"></i>
                    </div>
                    <h3 className="fw-bold mb-1">{summary.total || 0}</h3>
                    <p className="text-muted mb-0">Total Records</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="fa-solid fa-check-circle text-success fs-3"></i>
                    </div>
                    <h3 className="fw-bold mb-1">{summary.present || 0}</h3>
                    <p className="text-muted mb-0">Present</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="fa-solid fa-clock text-warning fs-3"></i>
                    </div>
                    <h3 className="fw-bold mb-1">{summary.late || 0}</h3>
                    <p className="text-muted mb-0">Late</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="fa-solid fa-times-circle text-danger fs-3"></i>
                    </div>
                    <h3 className="fw-bold mb-1">{summary.absent || 0}</h3>
                    <p className="text-muted mb-0">Absent</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="fa-solid fa-users text-primary fs-3"></i>
                    </div>
                    <h3 className="fw-bold mb-1">{summary.total_students || 0}</h3>
                    <p className="text-muted mb-0">Total Students</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="fa-solid fa-calendar-day text-info fs-3"></i>
                    </div>
                    <h3 className="fw-bold mb-1">{summary.total_classes || 0}</h3>
                    <p className="text-muted mb-0">Total Classes</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="fa-solid fa-check-circle text-success fs-3"></i>
                    </div>
                    <h3 className="fw-bold mb-1">{summary.total_attended || 0}</h3>
                    <p className="text-muted mb-0">Total Attended</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="fa-solid fa-percentage text-secondary fs-3"></i>
                    </div>
                    <h3 className="fw-bold mb-1">{summary.average_attendance_percentage ? summary.average_attendance_percentage.toFixed(2) : 0}%</h3>
                    <p className="text-muted mb-0">Avg. Attendance</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Charts Row - Only show when data is loaded */}
      {(selectedCourse && selectedBatch && attendanceData.length > 0) && (
        <div className="row mb-4">
          {/* Attendance Chart */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">
                  {viewMode === 'daily' ? 'Daily Attendance Trend' : 'Monthly Attendance Distribution'}
                </h5>
                <ResponsiveContainer width="100%" height={300}>
                  {viewMode === 'daily' ? (
                    <BarChart data={attendanceData.length > 0 ?
                      attendanceData.reduce((acc, record) => {
                        const dateStr = new Date(record.date).toLocaleDateString();
                        const existingDay = acc.find(day => day.date === dateStr);

                        if (existingDay) {
                          existingDay[record.status]++;
                        } else {
                          acc.push({
                            date: dateStr,
                            present: record.status === 'present' ? 1 : 0,
                            late: record.status === 'late' ? 1 : 0,
                            absent: record.status === 'absent' ? 1 : 0
                          });
                        }

                        return acc;
                      }, []) : []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#00C49F" />
                      <Bar dataKey="late" name="Late" fill="#FFBB28" />
                      <Bar dataKey="absent" name="Absent" fill="#FF8042" />
                    </BarChart>
                  ) : (
                    <BarChart data={attendanceData.map(student => ({
                      name: `${student.student?.fname} ${student.student?.lname}`,
                      attendance_percentage: student.summary?.attendance_percentage || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                      <Legend />
                      <Bar dataKey="attendance_percentage" name="Attendance %" fill="#8884d8" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Status Distribution Chart */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Attendance Status Distribution</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    {viewMode === 'daily' ? (
                      <Pie
                        data={[
                          { name: 'Present', value: summary.present || 0 },
                          { name: 'Late', value: summary.late || 0 },
                          { name: 'Absent', value: summary.absent || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#00C49F" />
                        <Cell fill="#FFBB28" />
                        <Cell fill="#FF8042" />
                      </Pie>
                    ) : (
                      <Pie
                        data={[
                          { name: 'Avg. Attendance', value: summary.average_attendance_percentage || 0 },
                          { name: 'Below Avg.', value: 100 - (summary.average_attendance_percentage || 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#00C49F" />
                        <Cell fill="#FF6B6B" />
                      </Pie>
                    )}
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table - Only show when data is loaded */}
      {(selectedCourse && selectedBatch && attendanceData.length > 0) && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title">
                {viewMode === 'daily' ? 'Daily Attendance Records' : 'Monthly Attendance Records'}
              </h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    {viewMode === 'daily' && <th>Course</th>}
                    {viewMode === 'daily' && <th>Batch</th>}
                    {viewMode === 'daily' ? <th>Date</th> : <th>Month/Year</th>}
                    <th>Status</th>
                    <th>Total Duration</th>
                    {viewMode === 'monthly' && <th>Attendance %</th>}
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.length > 0 ? (
                    attendanceData.map((record, index) => (
                      <tr key={index}>
                        <td>
                          {viewMode === 'daily'
                            ? `${record.student_id?.fname} ${record.student_id?.lname}`
                            : `${record.student?.fname} ${record.student?.lname}`}
                        </td>
                        {viewMode === 'daily' && <td>{record.course_id?.course_title}</td>}
                        {viewMode === 'daily' && <td>{record.batch_id?.batch_name}</td>}
                        {viewMode === 'daily' ? (
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                        ) : (
                          <td>{new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}</td>
                        )}
                        <td>
                          {viewMode === 'daily' ? (
                            <span className={`badge ${record.status === 'present' ? 'bg-success' :
                                record.status === 'late' ? 'bg-warning' : 'bg-danger'
                              }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          ) : (
                            <span className={`badge ${record.summary?.attendance_percentage >= 75 ? 'bg-success' :
                                record.summary?.attendance_percentage >= 50 ? 'bg-warning' : 'bg-danger'
                              }`}>
                              {record.summary?.attendance_percentage || 0}%
                            </span>
                          )}
                        </td>
                        <td>
                          {viewMode === 'daily'
                            ? `${Math.round(record.total_duration_seconds / 60)} min`
                            : `${record.summary?.total_classes || 0} classes`}
                        </td>
                        {viewMode === 'monthly' && (
                          <td>
                            <span className="fw-bold">{record.summary?.attendance_percentage || 0}%</span>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={viewMode === 'monthly' ? 7 : 6} className="text-center">
                        No attendance records found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;