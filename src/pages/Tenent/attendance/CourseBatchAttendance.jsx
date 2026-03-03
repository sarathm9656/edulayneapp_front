import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/api/axiosInstance';

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
      // For course-batch view, we'll use the monthly PDF endpoint with the start date's month
      const startDate = new Date(dateRange.startDate);
      const month = startDate.getMonth() + 1;
      const year = startDate.getFullYear();

      const response = await api.get('/attendance/monthly-pdf', {
        params: {
          course_id: selectedCourse,
          batch_id: selectedBatch,
          month: month,
          year: year
        },
        responseType: 'blob' // Important for downloading files
      });

      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `course-batch-attendance-${selectedCourse}-${selectedBatch}-${month}-${year}.pdf`;
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
        <h2 className="fw-bold">Course & Batch Attendance</h2>
        <p className="text-muted">View attendance statistics by course and batch</p>
      </div>

      {/* Filters */}
      <div className="row mb-4">
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

      {/* Action Button */}
      <div className="row mb-4">
        <div className="col-md-12">
          <button 
            className="btn btn-success"
            onClick={downloadPDF}
            disabled={attendanceData.length === 0}
          >
            <i className="fa-solid fa-download me-2"></i>
            Download Course & Batch Attendance PDF
          </button>
        </div>
      </div>

      {selectedCourse && selectedBatch && (
        <>
          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className="fa-solid fa-users text-primary fs-3"></i>
                  </div>
                  <h3 className="fw-bold mb-1">{attendanceData.length}</h3>
                  <p className="text-muted mb-0">Students</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className="fa-solid fa-calendar-day text-info fs-3"></i>
                  </div>
                  <h3 className="fw-bold mb-1">{overallStats.totalClasses}</h3>
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
                  <h3 className="fw-bold mb-1">{overallStats.attended}</h3>
                  <p className="text-muted mb-0">Attended</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className="fa-solid fa-percentage text-secondary fs-3"></i>
                  </div>
                  <h3 className="fw-bold mb-1">{overallAttendanceRate.toFixed(2)}%</h3>
                  <p className="text-muted mb-0">Attendance Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="row mb-4">
            {/* Student Attendance Chart */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">Student Attendance Percentage</h5>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={studentAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                      <Legend />
                      <Bar dataKey="attendance_percentage" name="Attendance %" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Overall Status Distribution Chart */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">Overall Status Distribution</h5>
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
                        <Cell fill="#00C49F" />
                        <Cell fill="#FFBB28" />
                        <Cell fill="#FF8042" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Student Details Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Student Attendance Details</h5>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Total Classes</th>
                      <th>Attended</th>
                      <th>Present</th>
                      <th>Late</th>
                      <th>Absent</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((student, index) => (
                      <tr key={index}>
                        <td>
                          {student.student.fname} {student.student.lname}
                          <br />
                          <small className="text-muted">{student.student.user_code}</small>
                        </td>
                        <td>{student.summary.total_classes}</td>
                        <td>{student.summary.attended}</td>
                        <td>
                          <span className="badge bg-success">{student.summary.present}</span>
                        </td>
                        <td>
                          <span className="badge bg-warning">{student.summary.late}</span>
                        </td>
                        <td>
                          <span className="badge bg-danger">{student.summary.absent}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="fw-bold me-2">{student.summary.attendance_percentage}%</span>
                            <div className="progress flex-grow-1" style={{ height: '10px' }}>
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${student.summary.attendance_percentage}%`,
                                  backgroundColor: student.summary.attendance_percentage >= 75 ? '#28a745' : 
                                                  student.summary.attendance_percentage >= 50 ? '#ffc107' : '#dc3545'
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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