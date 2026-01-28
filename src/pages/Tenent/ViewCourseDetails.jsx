import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";

import {
  fetchCourseDetails,
  fetchModulesByCourseId,
} from "../../redux/course.slice";

function renderLessonContent(lesson) {
  if (!lesson) return null;
  const type = lesson.lesson_type_id?.lesson_type;
  const api_url = import.meta.env.VITE_API_URL;

  switch (type) {
    case "video":
      let videoId = "";
      if (lesson.video_url) {
        if (lesson.video_url.includes("youtu.be/")) {
          videoId = lesson.video_url.split("youtu.be/")[1];
        } else if (lesson.video_url.includes("youtube.com/watch?v=")) {
          const urlParams = new URLSearchParams(new URL(lesson.video_url).search);
          videoId = urlParams.get('v');
        } else if (lesson.video_url.includes("youtube.com/embed/")) {
          videoId = lesson.video_url.split("youtube.com/embed/")[1];
        }
        if (videoId && videoId.includes("&")) {
          videoId = videoId.split("&")[0];
        }
      }

      return videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allowFullScreen
          className="w-100 h-100 border-0"
        />
      ) : (
        <div className="d-flex align-items-center justify-content-center h-100 bg-dark text-white text-opacity-50">
          <div className="text-center">
            <i className="fa-brands fa-youtube fs-1 mb-3"></i>
            <p>Invalid Video URL</p>
          </div>
        </div>
      );

    case "pdf":
    case "ppt":
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white p-5 text-center">
          <div className={`p-4 rounded-circle mb-3 ${type === 'pdf' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-warning bg-opacity-10 text-warning'}`}>
            <i className={`fa-solid ${type === 'pdf' ? 'fa-file-pdf' : 'fa-file-powerpoint'} fs-1`}></i>
          </div>
          <h4 className="fw-bold text-dark">{lesson.lesson_title}</h4>
          <p className="text-muted mb-4">{type.toUpperCase()} documents are better viewed in a dedicated tab.</p>
          <a
            href={`${api_url}/${lesson.file_path ? lesson.file_path.replace(/\\/g, "/") : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-lg ${type === 'pdf' ? 'btn-danger' : 'btn-warning'} fw-bold px-5 rounded-pill shadow-sm`}
          >
            Open {type.toUpperCase()} in New Tab <i className="fa-solid fa-arrow-up-right-from-square ms-2"></i>
          </a>
        </div>
      );

    case "link":
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white p-5 text-center">
          <div className="p-4 rounded-circle mb-3 bg-primary bg-opacity-10 text-primary">
            <i className="fa-solid fa-link fs-1"></i>
          </div>
          <h4 className="fw-bold text-dark">{lesson.lesson_title}</h4>
          <p className="text-muted mb-4">This lesson contains external learning resources.</p>
          <a
            href={lesson.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg btn-primary fw-bold px-5 rounded-pill shadow-sm"
          >
            Go to Resource <i className="fa-solid fa-arrow-up-right-from-square ms-2"></i>
          </a>
        </div>
      );

    case "text":
      return (
        <div className="bg-white h-100 overflow-auto p-4 p-md-5">
          <h2 className="fw-bold text-dark mb-4">{lesson.lesson_title}</h2>
          <div className="lesson-text-content fs-5 text-dark opacity-85" style={{ lineHeight: '1.8' }}>
            {lesson.description || lesson.lesson_description}
          </div>
        </div>
      );

    default:
      return (
        <div className="d-flex align-items-center justify-content-center h-100 bg-light">
          <div className="text-center text-muted">
            <i className="fa-solid fa-circle-question fs-1 mb-3"></i>
            <p>Unsupported lesson type: {type}</p>
          </div>
        </div>
      );
  }
}

const ViewCourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [courseStudents, setCourseStudents] = useState([]);
  const [currentEnrollment, setCurrentEnrollment] = useState(0);
  const [maxEnrollment, setMaxEnrollment] = useState(0);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  const getBatches = async () => {
    try {
      const res = await axios.get(`${api_url}/batch/course/${id}`, { withCredentials: true });
      if (res.data.success) {
        setBatches(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  // Get course data from Redux state
  const courseDetails = useSelector((state) => state.course.courseDetails);
  const modules = useSelector((state) => state.course.modules);
  const modulesLoading = useSelector((state) => state.course.modulesLoading);
  const api_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const getCourseDetails = async () => {
      await dispatch(fetchCourseDetails(id));
    };

    const getModules = async () => {
      await dispatch(fetchModulesByCourseId(id));
    };

    const getCurrentEnrollment = async () => {
      try {
        const res = await axios.get(
          `${api_url}/tenants/tenant/getstudents/${id}`,
          { withCredentials: true }
        );
        setCurrentEnrollment(res.data.coursePurchasedStudentsCount || 0);
        setMaxEnrollment(courseDetails?.max_enrollment || 0);
      } catch (error) {
        console.error("Error fetching enrollment count:", error);
        setCurrentEnrollment(0);
      }
    };

    getCourseDetails();
    getModules();
    getCurrentEnrollment();
    getBatches();
  }, [id, dispatch]);

  useEffect(() => {
    if (courseDetails?.max_enrollment) {
      setMaxEnrollment(courseDetails.max_enrollment);
    }
  }, [courseDetails]);

  useEffect(() => {
    if (showModal) {
      // Refresh batches when modal opens
      getBatches();

      axios
        .get(`${api_url}/tenants/tenant/getstudents/${id}`, {
          withCredentials: true,
        })
        .then((res) => {
          const allStudentsData = res.data.all_students || [];
          const enrolledStudents = res.data.coursePurchasedStudents || [];
          const enrolledStudentIds = enrolledStudents.map((s) => s.user_id);

          const studentsWithEnrollmentStatus = allStudentsData.map(
            (student) => {
              const enrollment = enrolledStudents.find((s) => s.user_id === student._id);
              return {
                ...student,
                isEnrolled: !!enrollment,
                batch_name: enrollment?.batch_name || null,
              };
            }
          );

          setAllStudents(studentsWithEnrollmentStatus);
          setCourseStudents(enrolledStudents);
          setCurrentEnrollment(res.data.coursePurchasedStudentsCount || 0);
        })
        .catch(() => {
          setAllStudents([]);
          setCourseStudents([]);
          setCurrentEnrollment(0);
        });
    }
  }, [showModal, id]);

  const handleCheckboxChange = (studentId) => {
    if (courseStudents.some((obj) => obj.user_id === studentId)) {
      setCourseStudents(
        courseStudents.filter((obj) => obj.user_id !== studentId)
      );
    } else {
      setCourseStudents([...courseStudents, { user_id: studentId }]);
    }
  };

  const isAssignButtonDisabled = () => {
    const currentlyEnrolledStudentIds = allStudents
      .filter((student) => student.isEnrolled)
      .map((student) => student._id);

    const newStudentsToAdd = courseStudents.filter(
      (student) => !currentlyEnrolledStudentIds.includes(student.user_id)
    );

    const studentsToRemove = currentlyEnrolledStudentIds.filter(
      (studentId) => !courseStudents.some((s) => s.user_id === studentId)
    );

    const finalEnrollmentCount = currentEnrollment - studentsToRemove.length + newStudentsToAdd.length;
    return finalEnrollmentCount > maxEnrollment;
  };

  const getEnrollmentStatusMessage = () => {
    const currentlyEnrolledStudentIds = allStudents
      .filter((student) => student.isEnrolled)
      .map((student) => student._id);

    const newStudentsToAdd = courseStudents.filter(
      (student) => !currentlyEnrolledStudentIds.includes(student.user_id)
    );

    const studentsToRemove = currentlyEnrolledStudentIds.filter(
      (studentId) => !courseStudents.some((s) => s.user_id === studentId)
    );

    const finalEnrollmentCount = currentEnrollment - studentsToRemove.length + newStudentsToAdd.length;

    if (finalEnrollmentCount > maxEnrollment) {
      return `Cannot enroll: Would exceed limit by ${finalEnrollmentCount - maxEnrollment} students`;
    } else if (newStudentsToAdd.length > 0 || studentsToRemove.length > 0) {
      return `Will enroll ${newStudentsToAdd.length} new students, remove ${studentsToRemove.length} students (${finalEnrollmentCount}/${maxEnrollment})`;
    } else {
      return `Current enrollment: ${currentEnrollment}/${maxEnrollment}`;
    }
  };

  const enrollStudents = async () => {
    try {
      const response = await axios.post(
        `${api_url}/tenants/tenant/enrollstudents-course/${id}`,
        {
          courseStudents,
          batch_id: selectedBatch || null
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (response.data.errors && response.data.errors.length > 0) {
          alert(`Enrollment processed with warnings:\n${response.data.errors.join("\n")}`);
        } else {
          alert("Students enrolled successfully!");
        }
        setCurrentEnrollment(response.data.currentEnrollment);
      }
      setShowModal(false);
      setSelectedBatch("");
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("An error occurred while enrolling students. Please try again.");
    }
  };

  if (!courseDetails || modulesLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-light">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const course = courseDetails;

  const handleModuleClick = (idx) => {
    if (showAll) return;
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.clear();
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const handleShowAll = () => {
    setShowAll(true);
    setExpandedModules(new Set(modules.map((_, idx) => idx)));
  };
  const handleLess = () => {
    setShowAll(false);
    setExpandedModules(new Set());
  };

  const handleGoBack = () => {
    if (location.state?.fromInstructor) {
      navigate(`/tenant/instructor/${location.state.instructorId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-100 d-flex flex-column">
      <main className="container-wrapper-scroll flex-grow-1 bg-light">
        {/* Premium Header */}
        <section className="dashboard-header py-4 bg-white border-bottom sticky-top shadow-sm" style={{ zIndex: 10 }}>
          <div className="container-fluid px-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <button
                  onClick={handleGoBack}
                  className="btn btn-light rounded-circle p-2 border shadow-sm transition-all"
                  style={{ width: "40px", height: "40px" }}
                >
                  <FaArrowLeft className="text-primary" />
                </button>
                <div>
                  <h2 className="fw-bold text-dark mb-0">{course.course_title}</h2>
                  <div className="d-flex align-items-center gap-3 mt-1">
                    <span className="badge bg-soft-primary text-primary px-3 rounded-pill">
                      {course.category?.category}
                    </span>
                    <span className="text-muted small fw-medium border-start ps-3">
                      {modules?.length || 0} Modules Total
                    </span>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 fw-bold rounded-pill shadow"
                  style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" }}
                  onClick={() => setShowModal(true)}
                >
                  <i className="fa-solid fa-user-plus"></i>
                  Manage Students
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="course-content-area py-4">
          <div className="container-fluid px-4">
            <div className="row g-4">
              {/* Left: Player and description */}
              <div className="col-xl-9 col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                  <div className="ratio ratio-16x9 bg-dark">
                    {selectedLesson ? (
                      renderLessonContent(selectedLesson)
                    ) : (
                      <div className="d-flex flex-column align-items-center justify-content-center text-white text-opacity-50 h-100">
                        <div className="mb-4">
                          <i className="fa-solid fa-play-circle" style={{ fontSize: "5rem", opacity: 0.3 }}></i>
                        </div>
                        <h4 className="fw-bold text-white">Welcome to {course.course_title}</h4>
                        <p className="text-white-50">Select a lesson from the curriculum to start learning</p>
                      </div>
                    )}
                  </div>
                  <div className="card-body p-4 bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <h3 className="fw-bold text-dark mb-1">{selectedLesson?.lesson_title || "Course Overview"}</h3>
                        <p className="text-muted mb-0">{selectedLesson?.lesson_type_id?.lesson_type || "Lecture"} • {selectedLesson?.lesson_duration || 0} minutes</p>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-light border p-2 rounded-circle" title="Mark as Complete">
                          <i className="fa-solid fa-check text-success"></i>
                        </button>
                        <button className="btn btn-light border p-2 rounded-circle" title="Share">
                          <i className="fa-solid fa-share-nodes text-primary"></i>
                        </button>
                      </div>
                    </div>

                    <ul className="nav nav-pills mb-4 bg-light p-1 rounded-pill d-inline-flex" style={{ width: 'fit-content' }}>
                      <li className="nav-item">
                        <button className="nav-link active rounded-pill fw-bold" data-bs-toggle="pill">Description</button>
                      </li>
                      <li className="nav-item">
                        <button className="nav-link rounded-pill fw-bold" data-bs-toggle="pill">Resources</button>
                      </li>
                    </ul>

                    <div className="lesson-info text-dark" style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                      {selectedLesson?.description || course.description}
                    </div>
                  </div>
                </div>

                {/* Course Meta Info */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                  <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                    <h5 className="fw-bold text-dark mb-0">Course Information</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-4">
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-4 border">
                          <small className="d-block text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Level</small>
                          <span className="fw-bold text-dark">{course.level?.course_level}</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-4 border">
                          <small className="d-block text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Language</small>
                          <span className="fw-bold text-dark">{course.language?.language}</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-4 border">
                          <small className="d-block text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Duration</small>
                          <span className="fw-bold text-dark">Self-Paced</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-4 border">
                          <small className="d-block text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Enrolled</small>
                          <span className="fw-bold text-dark">{currentEnrollment} / {course.max_enrollment}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-top">
                      <h6 className="fw-bold text-dark mb-3">Teaching Instructors</h6>
                      <div className="d-flex flex-wrap gap-3">
                        {course.instructors?.map((inst, idx) => (
                          <div key={idx} className="d-flex align-items-center gap-2 bg-white border p-2 rounded-pill pe-3">
                            <img
                              src={inst.profile_image ? `${api_url}/uploads/profiles/${inst.profile_image}` : "/img/default-avatar.png"}
                              alt=""
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                            />
                            <span className="small fw-bold text-dark">{inst.fname} {inst.lname}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Curriculum */}
              <div className="col-xl-3 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 sticky-sidebar">
                  <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0 fw-bold text-dark">Curriculum</h5>
                    <button className="btn btn-sm btn-link text-primary fw-bold text-decoration-none" onClick={showAll ? handleLess : handleShowAll}>
                      {showAll ? "Collapse" : "Expand All"}
                    </button>
                  </div>
                  <div className="card-body p-0 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {modulesLoading ? (
                      <div className="text-center p-5">
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      </div>
                    ) : modules && modules.length > 0 ? (
                      <div className="accordion accordion-flush" id="curriculumAccordion">
                        {modules.map((mod, idx) => (
                          <div className="accordion-item border-bottom" key={mod._id}>
                            <h2 className="accordion-header">
                              <button
                                className={`accordion-button ${expandedModules.has(idx) ? "" : "collapsed"} py-3 px-4 bg-white shadow-none`}
                                type="button"
                                onClick={() => handleModuleClick(idx)}
                              >
                                <div>
                                  <div className="fw-bold text-dark mb-0 fs-6">{mod.module_title}</div>
                                  <small className="text-muted d-flex align-items-center gap-1">
                                    <i className="fa-regular fa-square-play"></i> {mod.lessons?.length || 0} Lessons
                                  </small>
                                </div>
                              </button>
                            </h2>
                            <div className={`accordion-collapse collapse ${expandedModules.has(idx) ? "show" : ""}`}>
                              <div className="accordion-body p-0 bg-light bg-opacity-50">
                                <div className="list-group list-group-flush">
                                  {mod.lessons?.map((lesson) => (
                                    <button
                                      key={lesson._id}
                                      className={`list-group-item list-group-item-action border-0 py-3 px-4 d-flex gap-3 align-items-start transition-all ${selectedLesson?._id === lesson._id ? "bg-white border-start border-primary border-4 shadow-sm" : "bg-transparent"}`}
                                      onClick={() => {
                                        const type = lesson.lesson_type_id?.lesson_type;
                                        if ((type === "pdf" || type === "ppt") && lesson.file_path) {
                                          const api_url = import.meta.env.VITE_API_URL;
                                          window.open(`${api_url}/${lesson.file_path.replace(/\\/g, "/")}`, "_blank");
                                        } else if (type === "link" && lesson.video_url) {
                                          window.open(lesson.video_url, "_blank");
                                        } else {
                                          setSelectedLesson(lesson);
                                        }
                                      }}
                                    >
                                      <div className={`p-2 rounded-3 ${selectedLesson?._id === lesson._id ? "bg-primary text-white" : "bg-white border text-muted"}`}>
                                        <i className={`fa-solid ${lesson.lesson_type_id?.lesson_type === 'video' ? 'fa-play' :
                                          lesson.lesson_type_id?.lesson_type === 'pdf' ? 'fa-file-pdf' :
                                            lesson.lesson_type_id?.lesson_type === 'ppt' ? 'fa-file-powerpoint' :
                                              lesson.lesson_type_id?.lesson_type === 'link' ? 'fa-link' :
                                                'fa-file-lines'
                                          } small`}></i>
                                      </div>
                                      <div className="flex-grow-1">
                                        <div className={`fw-medium mb-0 ${selectedLesson?._id === lesson._id ? "text-primary fw-bold" : "text-dark"}`} style={{ fontSize: '0.9rem' }}>
                                          {lesson.lesson_title}
                                        </div>
                                        <small className="text-muted opacity-75">{lesson.lesson_duration || 0} mins</small>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="fa-solid fa-book-open-reader text-muted opacity-25" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3 text-muted">No content available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer-wrapper mt-auto py-4 bg-white border-top">
          <div className="container text-center">
            <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} Edulayne. All rights reserved.</p>
          </div>
        </footer>
      </main>

      {/* Enrollment Modal */}
      {showModal && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg w-100" style={{ maxWidth: '800px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-white border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold text-dark">Enroll Students</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4 bg-light bg-opacity-50">
                <div className="row g-3 mb-4">
                  <div className="col-12 mb-2">
                    <label className="fw-bold mb-2">Assign to Batch (Optional)</label>
                    <select
                      className="form-select border-0 shadow-sm rounded-3 py-2"
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                      <option value="">Select a Batch...</option>
                      {batches.map(b => (
                        <option key={b._id} value={b._id}>{b.batch_name} ({b.start_date ? new Date(b.start_date).toLocaleDateString() : 'No date'})</option>
                      ))}
                    </select>
                    <div className="form-text small">Selected students will be enrolled in the course AND this batch.</div>
                  </div>

                  <div className="col-md-7">
                    <div className="search-wrapper position-relative">
                      <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                      <input
                        type="text"
                        className="form-control border-0 shadow-sm ps-5 py-2 rounded-3"
                        placeholder="Search student by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className={`p-2 px-3 rounded-3 shadow-sm d-flex align-items-center justify-content-between ${isAssignButtonDisabled() ? "bg-soft-danger text-danger border border-danger-subtle" : "bg-white border text-primary"}`}>
                      <span className="small fw-bold">ENROLLMENT LIMIT</span>
                      <span className="fw-bold">{getEnrollmentStatusMessage().split(' (')[1]?.replace(')', '') || `${currentEnrollment}/${maxEnrollment}`}</span>
                    </div>
                  </div>
                </div>

                {isAssignButtonDisabled() && (
                  <div className="alert alert-danger py-2 px-3 d-flex align-items-center gap-2 rounded-3 mb-4">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span className="small fw-medium">{getEnrollmentStatusMessage().split(': ')[1]}</span>
                  </div>
                )}

                <div className="student-grid" style={{ height: "350px", overflowY: "auto" }}>
                  <div className="row g-3">
                    {allStudents
                      .filter((student) =>
                        (student.fname + " " + student.lname + " " + student.email)
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((student) => {
                        const isSelected = courseStudents.some((obj) => obj.user_id === student._id);
                        return (
                          <div key={student._id} className="col-md-6">
                            <div
                              className={`card h-100 border-0 shadow-sm rounded-3 transition-all cursor-pointer ${isSelected ? "bg-soft-primary border-primary border-opacity-25 border ring-2 ring-primary" : "bg-white border border-transparent"}`}
                              onClick={() => handleCheckboxChange(student._id)}
                            >
                              <div className="card-body p-3 d-flex align-items-center gap-3">
                                <div className="form-check m-0">
                                  <input
                                    type="checkbox"
                                    className="form-check-input mt-0"
                                    checked={isSelected}
                                    readOnly
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="mb-0 fw-bold text-dark">{student.fname} {student.lname}</h6>
                                  <small className="text-muted d-block text-truncate" style={{ maxWidth: '180px' }}>{student.email}</small>
                                </div>
                                {student.isEnrolled && (
                                  <div className="text-end">
                                    <span className="badge bg-soft-success text-success border-success-subtle border rounded-pill small d-block mb-1">Active</span>
                                    {student.batch_name && (
                                      <span className="badge bg-soft-info text-info border-info-subtle border rounded-pill small d-block text-truncate" style={{ maxWidth: '100px' }}>{student.batch_name}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-white border-top p-3 px-4">
                <button type="button" className="btn btn-light px-4 fw-medium" onClick={() => setShowModal(false)}>Cancel</button>
                <button
                  type="button"
                  className={`btn px-5 fw-bold rounded-pill shadow-sm transition-all ${isAssignButtonDisabled() ? "btn-secondary" : "btn-primary"}`}
                  style={!isAssignButtonDisabled() ? { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" } : {}}
                  onClick={enrollStudents}
                  disabled={isAssignButtonDisabled()}
                >
                  Confirm Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
         .bg-soft-primary { background: #eef2ff !important; }
         .bg-soft-success { background: #ecfdf5 !important; }
         .bg-soft-danger { background: #fef2f2 !important; }
         .bg-soft-info { background: #f0f9ff !important; }
         .ring-primary { box-shadow: 0 0 0 2px #667eea; }
         .sticky-sidebar { position: sticky; top: 120px; }
         .ratio-16x9 { border-radius: 12px; overflow: hidden; }
         .nav-pills .nav-link.active { background: #667eea !important; color: white !important; }
         .nav-pills .nav-link { color: #667eea; }
         .accordion-button:not(.collapsed) { background: #f8fafc; color: #667eea; }
         .list-group-item-action:hover { background: #f1f5f9; }
      `}</style>
    </div>
  );
};

export default ViewCourseDetails;
