import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserTie,
  FaBook,
  FaUsers,
  FaStar,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaGraduationCap,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import axios from "axios";
import { fetchInstructorById, deleteInstructor } from "../../../redux/tenant.slice";
import EditInstructorModal from "../../../components/tenants/EditInstructorModal";
import { toast } from "react-toastify";

const InstructorDetailsPage = () => {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { instructorDetails } = useSelector((state) => state.tenant);
  const { courses } = useSelector((state) => state.course);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [openEditInstructorModal, setOpenEditInstructorModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingInstructor, setDeletingInstructor] = useState(null);

  // Fetch instructor details on mount or instructorId change
  useEffect(() => {
    if (instructorId) {
      setLoading(true);
      dispatch(fetchInstructorById(instructorId));
    }
  }, [instructorId, dispatch]);

  // When instructorDetails is loaded, set loading to false
  useEffect(() => {
    if (instructorDetails && instructorDetails.user && instructorDetails.user._id) {
      setLoading(false);
    }
  }, [instructorDetails]);

  const handleEdit = () => {
    setOpenEditInstructorModal(true);
  };

  // Transform instructorDetails to match the format expected by EditInstructorModal
  const getInstructorForEdit = () => {
    if (!instructorDetails) return null;

    return {
      _id: instructorDetails.user?._id, // User document ID (for API call)
      user_id: instructorDetails.user?._id, // User document ID
      id: instructorDetails.user?._id,
      fname: instructorDetails.user?.fname || "",
      lname: instructorDetails.user?.lname || "",
      dob: instructorDetails.user?.dob || "",
      phone_number: instructorDetails.user?.phone_number || "",
      email: instructorDetails.email || "",
      payment_type: instructorDetails.payment_type || "salary",
      payment_amount: instructorDetails.payment_amount || "",
      assigned_courses: instructorDetails.assigned_courses || [],
      assigned_batches: instructorDetails.assigned_batches || [],
      price_per_hour: instructorDetails.price_per_hour || "",
      status: instructorDetails.is_active ? "active" : "inactive",
      name: `${instructorDetails.user?.fname || ''} ${instructorDetails.user?.lname || ''}`.trim(),
      gender: instructorDetails.gender || instructorDetails.user?.gender || "",
      address: instructorDetails.address || instructorDetails.user?.address || "",
      bio: instructorDetails.bio || instructorDetails.user?.bio || "",
    };
  };

  const handleDeleteClick = () => {
    setDeletingInstructor(instructorDetails);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInstructor) return;

    try {
      await dispatch(deleteInstructor(deletingInstructor)).unwrap();
      setIsDeleteModalOpen(false);
      setDeletingInstructor(null);
      toast.success("Instructor deleted successfully");
      navigate('/tenant/instructors'); // Navigate back to instructor list
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to delete instructor");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingInstructor(null);
  };

  const handleInstructorUpdated = (updatedInstructor) => {
    setOpenEditInstructorModal(false);
    // Refresh instructor details
    dispatch(fetchInstructorById(instructorId));
    toast.success("Instructor updated successfully");
  };

  const handleBack = () => {
    navigate('/tenant/instructors');
  };

  if (loading) {
    return (
      <main className="container-wrapper-scroll">
        <section className="course-single-page container-height">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading instructor details...</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!instructorDetails || !instructorDetails.user) {
    return (
      <main className="container-wrapper-scroll">
        <section className="course-single-page container-height">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-12 text-center py-5">
                <div className="alert alert-warning" role="alert">
                  <h4 className="alert-heading">Instructor not found</h4>
                  <p>The instructor you're looking for could not be found.</p>
                  <hr />
                  <button
                    onClick={handleBack}
                    className="btn btn-primary"
                  >
                    <FaArrowLeft className="me-2" />
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const stats = [
    {
      label: "Total Courses",
      value: instructorDetails?.courses?.length || 0,
      icon: <FaBook className="h-5 w-5" />,
      color: "text-primary",
      bgColor: "bg-primary bg-opacity-10"
    },
    {
      label: "Active Courses",
      value: instructorDetails?.courses?.filter((course) => course.is_active).length || 0,
      icon: <FaCheckCircle className="h-5 w-5" />,
      color: "text-success",
      bgColor: "bg-success bg-opacity-10"
    },
    {
      label: "Total Students",
      value: instructorDetails?.courses?.reduce((total, course) => total + (course.studentsEnrolled || 0), 0) || 0,
      icon: <FaUsers className="h-5 w-5" />,
      color: "text-info",
      bgColor: "bg-info bg-opacity-10"
    },
    {
      label: "Member Since",
      value: instructorDetails?.user?.createdAt ? new Date(instructorDetails.user.createdAt).getFullYear() : "N/A",
      icon: <FaGraduationCap className="h-5 w-5" />,
      color: "text-warning",
      bgColor: "bg-warning bg-opacity-10"
    },
  ];

  return (
    <>
      {/* Main Content */}
      <main className="container-wrapper-scroll">
        <section className="course-single-page container-height">
          <div className="container-fluid">
            {/* Header */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <button
                      onClick={handleBack}
                      className="btn btn-outline-secondary me-3"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '8px 16px'
                      }}
                    >
                      <FaArrowLeft className="me-2" />
                      Back
                    </button>
                    <div>
                      <h2 className="mb-1" style={{ color: 'var(--HeadingColor)', fontWeight: 'bold' }}>
                        Instructor Details
                      </h2>
                      <p className="text-muted mb-0">Manage instructor information and courses</p>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={handleEdit}
                      className="btn btn-outline-primary"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px'
                      }}
                    >
                      <FaEdit className="me-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="btn btn-outline-danger"
                      style={{
                        background: 'linear-gradient(135deg, #ed1b76 0%, #f5576c 100%)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px'
                      }}
                    >
                      <FaTrash className="me-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Left Column - Instructor Profile */}
              <div className="col-lg-4 mb-4">
                <div className="card shadow-sm" style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '12px',
                  border: 'none'
                }}>
                  <div className="card-body p-4">
                    {/* Profile Image */}
                    <div className="text-center mb-4">
                      <div className="position-relative d-inline-block">
                        {instructorDetails.user?.profile_image ? (
                          <img
                            src={instructorDetails.user.profile_image}
                            alt={instructorDetails.user?.fname && instructorDetails.user?.lname ? `${instructorDetails.user.fname} ${instructorDetails.user.lname}` : instructorDetails.user?.fname || "Instructor"}
                            className="rounded-circle"
                            style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid #e9ecef' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '120px',
                            height: '120px',
                            backgroundColor: 'var(--PrimaryColor)',
                            color: 'white',
                            fontSize: '48px',
                            fontWeight: 'bold',
                            border: '4px solid #e9ecef',
                            display: instructorDetails.user?.profile_image ? 'none' : 'flex'
                          }}
                        >
                          {instructorDetails.user?.fname ? instructorDetails.user.fname.charAt(0).toUpperCase() : 'I'}
                        </div>
                        <div className={`position-absolute bottom-0 end-0 rounded-circle border border-white d-flex align-items-center justify-content-center ${instructorDetails.is_active ? 'bg-success' : 'bg-secondary'}`}
                          style={{ width: '32px', height: '32px' }}>
                          {instructorDetails.is_active ? (
                            <FaCheckCircle className="text-white" style={{ fontSize: '14px' }} />
                          ) : (
                            <FaTimesCircle className="text-white" style={{ fontSize: '14px' }} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="text-center mb-4">
                      <h3 className="mb-2" style={{ color: 'var(--HeadingColor)', fontWeight: 'bold' }}>
                        {instructorDetails.user?.fname && instructorDetails.user?.lname ? `${instructorDetails.user.fname} ${instructorDetails.user.lname}` : instructorDetails.user?.fname || "Instructor"}
                      </h3>
                      <p className="text-muted mb-2">
                        <FaUserTie className="me-2" />
                        Instructor &bull; <span className="text-primary">{instructorDetails.user?.user_code || instructorDetails.user_code || "N/A"}</span>
                      </p>
                      <span className={`badge ${instructorDetails.is_active ? 'bg-success' : 'bg-secondary'} px-3 py-2`}>
                        {instructorDetails.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Payment Information */}
                    <div className="mb-4">
                      <h5 className="mb-3" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                        Payment Information
                      </h5>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-3 bg-light me-3">
                          <FaUserTie className="text-primary" />
                        </div>
                        <div>
                          <small className="text-muted d-block">Type</small>
                          <span className="text-capitalize" style={{ color: 'var(--TextColor)', fontWeight: '500' }}>
                            {instructorDetails.payment_type || "Salary"}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-3 bg-light me-3">
                          <strong className="text-success">₹</strong>
                        </div>
                        <div>
                          <small className="text-muted d-block">Amount</small>
                          <span style={{ color: 'var(--TextColor)', fontWeight: '600' }}>
                            ₹{instructorDetails.payment_amount || "0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-4">
                      <h5 className="mb-3" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                        Contact Information
                      </h5>

                      <div className="d-flex align-items-center mb-3">
                        <FaEnvelope className="text-muted me-3" style={{ fontSize: '18px' }} />
                        <div>
                          <small className="text-muted d-block">Email</small>
                          <span style={{ color: 'var(--TextColor)' }}>{instructorDetails.email}</span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <FaPhone className="text-muted me-3" style={{ fontSize: '18px' }} />
                        <div>
                          <small className="text-muted d-block">Phone</small>
                          <span style={{ color: 'var(--TextColor)' }}>
                            {instructorDetails.user?.phone_number || "Not provided"}
                          </span>
                        </div>
                      </div>

                      {instructorDetails.user?.dob && (
                        <div className="d-flex align-items-center mb-3">
                          <FaCalendarAlt className="text-muted me-3" style={{ fontSize: '18px' }} />
                          <div>
                            <small className="text-muted d-block">Date of Birth</small>
                            <span style={{ color: 'var(--TextColor)' }}>
                              {new Date(instructorDetails.user.dob).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {instructorDetails.user?.age && (
                        <div className="d-flex align-items-center mb-3">
                          <FaClock className="text-muted me-3" style={{ fontSize: '18px' }} />
                          <div>
                            <small className="text-muted d-block">Age</small>
                            <span style={{ color: 'var(--TextColor)' }}>
                              {instructorDetails.user.age} years
                            </span>
                          </div>
                        </div>
                      )}



                      {instructorDetails.user?.gender && (
                        <div className="d-flex align-items-center mb-3">
                          <FaUserTie className="text-muted me-3" style={{ fontSize: '18px' }} />
                          <div>
                            <small className="text-muted d-block">Gender</small>
                            <span style={{ color: 'var(--TextColor)', textTransform: 'capitalize' }}>
                              {instructorDetails.user.gender}
                            </span>
                          </div>
                        </div>
                      )}

                      {instructorDetails.user?.address && (
                        <div className="d-flex align-items-center mb-3">
                          <FaMapMarkerAlt className="text-muted me-3" style={{ fontSize: '18px' }} />
                          <div>
                            <small className="text-muted d-block">Address</small>
                            <span style={{ color: 'var(--TextColor)' }}>
                              {instructorDetails.user.address}
                            </span>
                          </div>
                        </div>
                      )}

                      {instructorDetails.user?.createdAt && (
                        <div className="d-flex align-items-center mb-3">
                          <FaCalendarAlt className="text-muted me-3" style={{ fontSize: '18px' }} />
                          <div>
                            <small className="text-muted d-block">Member Since</small>
                            <span style={{ color: 'var(--TextColor)' }}>
                              {new Date(instructorDetails.user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div>
                      <h5 className="mb-3" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                        Statistics
                      </h5>
                      <div className="row g-2">
                        {stats.map((stat, index) => (
                          <div key={index} className="col-6">
                            <div className={`p-3 rounded-3 text-center ${stat.bgColor}`}>
                              <div className={`${stat.color} mb-2 d-flex justify-content-center`}>
                                {stat.icon}
                              </div>
                              <h4 className="mb-1 fw-bold" style={{ color: 'var(--HeadingColor)' }}>
                                {stat.value}
                              </h4>
                              <small className="text-muted">{stat.label}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Content */}
              <div className="col-lg-8">
                <div className="card shadow-sm" style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '12px',
                  border: 'none'
                }}>
                  {/* Tabs */}
                  <div className="card-header bg-transparent border-bottom">
                    <ul className="nav nav-tabs card-header-tabs" id="instructorTabs" role="tablist">
                      {[
                        { id: "overview", label: "Overview", icon: <FaUserTie className="me-2" /> },
                        { id: "courses", label: "Assigned Courses", icon: <FaBook className="me-2" /> },
                        { id: "batches", label: "Assigned Batches", icon: <FaUsers className="me-2" /> },
                        // { id: "performance", label: "Performance", icon: <FaStar className="me-2" /> },
                      ].map((tab) => (
                        <li className="nav-item" role="presentation" key={tab.id}>
                          <button
                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                              border: 'none',
                              color: activeTab === tab.id ? 'var(--PrimaryColor)' : 'var(--TextColor)',
                              fontWeight: activeTab === tab.id ? '600' : '400'
                            }}
                          >
                            {tab.icon}
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tab Content */}
                  <div className="card-body p-4">
                    {activeTab === "overview" && (
                      <div>
                        <div className="mb-4">
                          <h5 className="mb-3" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                            About
                          </h5>
                          <p style={{ color: 'var(--TextColor)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {instructorDetails.bio || instructorDetails.user?.bio || `${instructorDetails.user?.fname || "This instructor"} is a dedicated instructor with expertise in various subjects. They are committed to providing quality education and fostering student growth.`}
                          </p>
                        </div>

                        <div className="mb-4">
                          <h5 className="mb-3" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                            Expertise
                          </h5>
                          <div className="d-flex flex-wrap gap-2">
                            {["Teaching", "Course Development", "Student Mentoring", "Curriculum Design"].map((skill) => (
                              <span
                                key={skill}
                                className="badge"
                                style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '20px',
                                  fontSize: '12px'
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="mb-3" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                            Recent Activity
                          </h5>
                          <div className="space-y-3">
                            {[
                              { text: "Updated course materials", time: "2 hours ago", color: "success" },
                              { text: "Graded student assignments", time: "1 day ago", color: "primary" },
                              { text: "Created new lesson", time: "3 days ago", color: "info" }
                            ].map((activity, index) => (
                              <div key={index} className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                <div className={`bg-${activity.color} rounded-circle me-3`} style={{ width: '8px', height: '8px' }}></div>
                                <span className="flex-grow-1" style={{ color: 'var(--TextColor)' }}>{activity.text}</span>
                                <small className="text-muted">{activity.time}</small>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "courses" && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="mb-0" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                            Assigned Courses ({instructorDetails?.courses?.length || 0})
                          </h5>
                          {instructorDetails.is_active ? (
                            <button
                              onClick={() => navigate(`/tenant/instructor/select-courses/${instructorId}/${instructorDetails.user._id}`)}
                              className="btn btn-primary"
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '8px 20px'
                              }}
                            >
                              Assign New Course
                            </button>
                          ) : (
                            <span className="text-muted small">Cannot assign course to inactive instructor</span>
                          )}
                        </div>

                        {!instructorDetails?.courses || instructorDetails.courses.length === 0 ? (
                          <div className="text-center py-5">
                            <FaBook className="text-muted mb-3" style={{ fontSize: '48px' }} />
                            <h5 className="text-muted mb-2">No courses assigned</h5>
                            <p className="text-muted">This instructor hasn't been assigned to any courses yet.</p>
                          </div>
                        ) : (
                          <div className="row g-3">
                            {instructorDetails.courses.map((course) => (
                              <div key={course._id} className="col-12">
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div className="flex-grow-1">
                                        <h6 className="mb-2" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                                          {course.course_title}
                                        </h6>
                                        <p className="text-muted mb-3 small">{course.short_description}</p>
                                        <div className="d-flex align-items-center gap-4 text-muted small">
                                          <span className="d-flex align-items-center">
                                            <FaUsers className="me-1" />
                                            {course.studentCount || 0} students
                                          </span>
                                          <span className="d-flex align-items-center">
                                            <FaBook className="me-1" />
                                            {course.moduleCount || 0} modules
                                          </span>
                                          <span className={`badge ${course.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                            {course.is_active ? "Active" : "Inactive"}
                                          </span>
                                        </div>
                                      </div>
                                      <Link
                                        to={`/tenant/view-course-details/${course._id}`}
                                        state={{ fromInstructor: true, instructorId: instructorId }}
                                      >
                                        <button className="btn btn-outline-primary btn-sm" style={{ borderRadius: '20px' }}>
                                          View Details
                                        </button>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "batches" && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="mb-0" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                            Assigned Batches ({instructorDetails?.assigned_batches?.length || 0})
                          </h5>
                        </div>

                        {!instructorDetails?.assigned_batches || instructorDetails.assigned_batches.length === 0 ? (
                          <div className="text-center py-5">
                            <FaUsers className="text-muted mb-3" style={{ fontSize: '48px' }} />
                            <h5 className="text-muted mb-2">No batches assigned</h5>
                            <p className="text-muted">This instructor hasn't been assigned to any batches yet.</p>
                          </div>
                        ) : (
                          <div className="row g-3">
                            {instructorDetails.assigned_batches.map((batch) => (
                              <div key={batch._id} className="col-12">
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                          <h6 className="mb-0 me-2" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                                            {batch.batch_name}
                                          </h6>
                                          <span className={`badge ${batch.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                            {batch.status || 'Active'}
                                          </span>
                                        </div>
                                        <div className="mb-3">
                                          <span className="text-primary me-3 small">
                                            <FaBook className="me-1" /> {batch.course_id?.course_title || "Unknown Course"}
                                          </span>
                                        </div>
                                        <div className="d-flex flex-wrap gap-3 text-muted small">
                                          <span className="d-flex align-items-center">
                                            <FaCalendarAlt className="me-1" />
                                            {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : "N/A"} - {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : "N/A"}
                                          </span>
                                          <span className="d-flex align-items-center">
                                            <FaClock className="me-1" />
                                            {batch.batch_time || "Time not set"}
                                          </span>
                                          <span className="d-flex align-items-center">
                                            <FaUsers className="me-1" />
                                            {batch.students?.length || 0} / {batch.max_students || "∞"} Students
                                          </span>
                                        </div>
                                        {batch.recurring_days && batch.recurring_days.length > 0 && (
                                          <div className="mt-2">
                                            <small className="text-muted">Days: </small>
                                            {batch.recurring_days.map(day => (
                                              <span key={day} className="badge bg-light text-dark border me-1">{day.slice(0, 3)}</span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* {activeTab === "performance" && (
                          <div>
                        <div className="row g-3 mb-4">
                          {[
                            { label: "Average Rating", value: "4.8", icon: <FaStar />, color: "warning" },
                            { label: "Completion Rate", value: "92%", icon: <FaCheckCircle />, color: "success" },
                            { label: "Response Time", value: "2.4h", icon: <FaClock />, color: "info" }
                          ].map((metric, index) => (
                            <div key={index} className="col-md-4">
                              <div className="card border-0 shadow-sm text-center" style={{ borderRadius: '12px' }}>
                                <div className="card-body">
                                  <div className={`text-${metric.color} mb-2`} style={{ fontSize: '24px' }}>
                                    {metric.icon}
                          </div>
                                  <h4 className="mb-1 fw-bold" style={{ color: 'var(--HeadingColor)' }}>
                                    {metric.value}
                                  </h4>
                                  <small className="text-muted">{metric.label}</small>
                          </div>
                        </div>
                      </div>
                          ))}
                    </div>

                    <div>
                          <h5 className="mb-3" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                        Student Feedback
                          </h5>
                          <div className="row g-3">
                            {[
                              { rating: 5, student: "Anonymous Student", time: "2 days ago", comment: "Excellent teaching methodology and very helpful in understanding complex topics." },
                              { rating: 5, student: "Anonymous Student", time: "1 week ago", comment: "Great instructor with clear explanations and engaging content." }
                            ].map((feedback, index) => (
                              <div key={index} className="col-12">
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <div className="d-flex align-items-center gap-2">
                                        <div className="text-warning">
                                          {[...Array(feedback.rating)].map((_, i) => (
                                            <FaStar key={i} className="d-inline" />
                                ))}
                              </div>
                                        <span className="text-muted small">{feedback.student}</span>
                            </div>
                                      <small className="text-muted">{feedback.time}</small>
                          </div>
                                    <p className="mb-0" style={{ color: 'var(--TextColor)' }}>{feedback.comment}</p>
                        </div>
                                </div>
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>
                )} */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="footer-wrapper">
          <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </section>
      </main >

      {/* Edit Instructor Modal */}
      {
        openEditInstructorModal && instructorDetails && (
          <EditInstructorModal
            setOpenEditInstructorModal={setOpenEditInstructorModal}
            instructor={getInstructorForEdit()}
            onInstructorUpdated={handleInstructorUpdated}
          />
        )
      }

      {/* Delete Confirmation Modal */}
      {
        isDeleteModalOpen && deletingInstructor && (
          <>
            {/* Modal Backdrop */}
            <div
              className="modal-backdrop fade show"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1040
              }}
              onClick={handleDeleteCancel}
            ></div>

            {/* Modal */}
            <div
              className="modal fade show d-block"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1050,
                overflow: 'auto'
              }}
              tabIndex="-1"
              role="dialog"
              aria-labelledby="deleteInstructorModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  {/* Modal Header */}
                  <div className="modal-header">
                    <h5 className="modal-title text-danger" id="deleteInstructorModalLabel">
                      <i className="fa-solid fa-exclamation-triangle me-2"></i>
                      Confirm Delete
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleDeleteCancel}
                      aria-label="Close"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        lineHeight: '1',
                        opacity: '0.75',
                        position: 'relative'
                      }}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="modal-body">
                    <div className="alert alert-warning" role="alert">
                      <h6 className="alert-heading">Warning!</h6>
                      <p className="mb-0">
                        You are about to delete the instructor <strong>"{deletingInstructor.user?.fname} {deletingInstructor.user?.lname}"</strong>.
                        This action cannot be undone.
                      </p>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <strong>Name:</strong>
                        <p>{deletingInstructor.user?.fname} {deletingInstructor.user?.lname}</p>
                      </div>
                      <div className="col-md-6">
                        <strong>Email:</strong>
                        <p>{deletingInstructor.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleDeleteCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteConfirm}
                    >
                      <i className="fa-solid fa-trash-can me-2"></i>
                      Delete Instructor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      }
    </>
  );
};

export default InstructorDetailsPage;
