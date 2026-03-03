import { Card } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { 
  FaGraduationCap, 
  FaChartLine, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaInfoCircle,
  FaCalendarAlt,
  FaTrophy,
  FaFire
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { attendanceService } from "@/services/attendance.service";

const CourseCard = ({ course }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch attendance data for the course
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!course?._id) return;

      setLoading(true);
      try {
        const response = await attendanceService.getStudentPerformance({
          course_id: course._id
        });

        if (response.data.success) {
          setAttendanceData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setAttendanceData({
          attendance_percentage: 0,
          total_classes: 0,
          attended_classes: 0,
          performance_grade: 'N/A'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [course?._id]);

  // Calculate performance grade based on attendance
  const getPerformanceGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Excellent' };
    if (percentage >= 80) return { grade: 'A', color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', label: 'Great' };
    if (percentage >= 70) return { grade: 'B', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', label: 'Good' };
    if (percentage >= 60) return { grade: 'C', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', label: 'Average' };
    if (percentage >= 50) return { grade: 'D', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Needs Improvement' };
    return { grade: 'F', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Critical' };
  };

  const performance = attendanceData ? getPerformanceGrade(attendanceData.attendance_percentage) : { 
    grade: 'N/A', 
    color: '#9ca3af', 
    bg: 'rgba(156, 163, 175, 0.1)',
    label: 'No Data'
  };
  
  const attendancePercentage = attendanceData?.attendance_percentage || 0;
  const missedClasses = attendanceData?.total_classes - attendanceData?.attended_classes || 0;

  // Calculate circular progress rotation
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (attendancePercentage / 100) * circumference;

  return (
    <Card className="mt-4 w-100 border-0 shadow-lg" style={{ 
      maxWidth: '420px',
      borderRadius: '20px',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
    }}>
      {/* Header with Gradient */}
      <div className="position-relative" style={{ 
        height: '180px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${course.image || "/img/chessthumbnail.jpg"})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          filter: 'blur(2px)'
        }}></div>
        
        {/* Course Title Overlay */}
        <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
        }}>
          <h5 className="fw-bold text-white mb-0" style={{ 
            fontSize: '1.1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            lineHeight: '1.3'
          }}>
            {course.course_title}
          </h5>
        </div>

        {/* Attendance Badge */}
        {attendanceData && (
          <div className="position-absolute top-0 end-0 m-3">
            <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-lg"
              style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}>
              <FaChartLine style={{ color: performance.color }} size={16} />
              <span className="fw-bold" style={{ color: performance.color, fontSize: '0.9rem' }}>
                {attendancePercentage}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status" style={{ 
              color: '#667eea',
              width: '3rem',
              height: '3rem'
            }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <small className="text-muted d-block mt-2">Loading your performance...</small>
          </div>
        ) : attendanceData ? (
          <div>
            {/* Circular Progress with Grade */}
            <div className="text-center mb-4">
              <div className="position-relative d-inline-flex align-items-center justify-content-center">
                {/* SVG Circular Progress */}
                <svg width="140" height="140" className="transform">
                  {/* Background Circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r="45"
                    fill="none"
                    stroke={performance.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 70 70)"
                    style={{
                      transition: 'stroke-dashoffset 1s ease-in-out'
                    }}
                  />
                </svg>
                
                {/* Center Content */}
                <div className="position-absolute text-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle mb-1"
                    style={{ 
                      width: '40px', 
                      height: '40px',
                      backgroundColor: performance.bg,
                      margin: '0 auto'
                    }}>
                    <FaTrophy style={{ color: performance.color }} size={18} />
                  </div>
                  <div className="fw-bold" style={{ 
                    fontSize: '2rem',
                    color: performance.color,
                    lineHeight: 1
                  }}>
                    {performance.grade}
                  </div>
                </div>
              </div>
              
              {/* Performance Label */}
              <div className="mt-2">
                <span className="badge px-3 py-2 rounded-pill" style={{
                  backgroundColor: performance.bg,
                  color: performance.color,
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  <FaFire className="me-1" size={12} />
                  {performance.label}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-2 mb-3">
              <div className="col-4">
                <div className="text-center p-2 rounded-3" style={{
                  background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                  boxShadow: '0 2px 8px rgba(52, 211, 153, 0.2)'
                }}>
                  <FaCheckCircle className="text-success mb-1" size={20} />
                  <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
                    {attendanceData.attended_classes}
                  </div>
                  <div className="tiny text-success" style={{ fontSize: '9px', fontWeight: 600 }}>ATTENDED</div>
                </div>
              </div>
              
              <div className="col-4">
                <div className="text-center p-2 rounded-3" style={{
                  background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                }}>
                  <FaTimesCircle className="text-danger mb-1" size={20} />
                  <div className="fw-bold text-danger" style={{ fontSize: '1.1rem' }}>
                    {missedClasses}
                  </div>
                  <div className="tiny text-danger" style={{ fontSize: '9px', fontWeight: 600 }}>MISSED</div>
                </div>
              </div>
              
              <div className="col-4">
                <div className="text-center p-2 rounded-3" style={{
                  background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
                  boxShadow: '0 2px 8px rgba(96, 165, 250, 0.2)'
                }}>
                  <FaCalendarAlt className="text-info mb-1" size={20} />
                  <div className="fw-bold text-info" style={{ fontSize: '1.1rem' }}>
                    {attendanceData.total_classes}
                  </div>
                  <div className="tiny text-info" style={{ fontSize: '9px', fontWeight: 600 }}>TOTAL</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted fw-medium">
                  <FaChartLine className="me-1" style={{ color: '#667eea' }} /> 
                  Progress to 100%
                </small>
                <small className="fw-bold" style={{ color: performance.color }}>
                  {attendancePercentage}%
                </small>
              </div>
              <div className="progress" style={{ 
                height: '12px', 
                borderRadius: '10px',
                background: '#e5e7eb',
                overflow: 'hidden'
              }}>
                <div 
                  className="progress-bar"
                  role="progressbar" 
                  style={{ 
                    width: `${attendancePercentage}%`,
                    background: `linear-gradient(90deg, ${performance.color} 0%, ${performance.color}dd 100%)`,
                    borderRadius: '10px',
                    transition: 'width 1s ease-in-out'
                  }}
                  aria-valuenow={attendancePercentage} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            {attendancePercentage >= 75 ? (
              <div className="alert alert-success border-0 rounded-3 mb-0" style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)',
                borderLeft: `4px solid ${performance.color}`
              }}>
                <div className="d-flex align-items-center gap-2">
                  <FaTrophy style={{ color: performance.color }} size={18} />
                  <small className="fw-medium" style={{ color: performance.color }}>
                    {attendancePercentage >= 90 
                      ? "Outstanding! Keep up the excellent work! 🎉" 
                      : "Great attendance! You're doing awesome! 👏"}
                  </small>
                </div>
              </div>
            ) : attendancePercentage >= 50 ? (
              <div className="alert alert-warning border-0 rounded-3 mb-0" style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                borderLeft: `4px solid ${performance.color}`
              }}>
                <div className="d-flex align-items-center gap-2">
                  <FaFire style={{ color: performance.color }} size={18} />
                  <small className="fw-medium" style={{ color: performance.color }}>
                    You can do better! Try to attend more classes! 💪
                  </small>
                </div>
              </div>
            ) : (
              <div className="alert alert-danger border-0 rounded-3 mb-0" style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                borderLeft: `4px solid ${performance.color}`
              }}>
                <div className="d-flex align-items-center gap-2">
                  <FaInfoCircle style={{ color: performance.color }} size={18} />
                  <small className="fw-medium" style={{ color: performance.color }}>
                    Attention needed! Your attendance is critically low! ⚠️
                  </small>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="d-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto"
              style={{ 
                width: '80px', 
                height: '80px',
                background: '#f3f4f6'
              }}>
              <FaInfoCircle className="text-muted" size={32} />
            </div>
            <h6 className="fw-bold text-muted mb-1">No Data Available</h6>
            <p className="small text-muted mb-0">Attendance data will appear once classes begin</p>
          </div>
        )}
      </div>

      {/* Card Footer with Button */}
      <div className="p-3 pt-0">
        <button
          className="btn w-100 rounded-pill fw-bold text-white"
          onClick={() => navigate(`/student/course/${course._id}`)}
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            padding: '12px 24px',
            fontSize: '0.95rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          <FaEye className="me-2" /> View Course Details
        </button>
      </div>
    </Card>
  );
};

export default CourseCard;
