import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./ViewCourseDetailsInstructor.css";
import { FaArrowLeft } from "react-icons/fa";

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
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`}
          title="YouTube video"
          allowFullScreen
          className="w-100 h-100 border-0"
          style={{ minHeight: "450px" }}
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

const ViewCourseDetailsInstructor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [modulesWithLessons, setModulesWithLessons] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Moved Hooks before conditional return
  const api_url = useMemo(() => import.meta.env.VITE_API_URL, []);

  const courseImageSrc = useMemo(() => {
    if (!courseData) return "/img/chessthumbnail.jpg";
    if (imageError) return "/img/chessthumbnail.jpg";
    return courseData.image
      ? `${api_url}/uploads/courses/${courseData.image}`
      : "/img/chessthumbnail.jpg";
  }, [courseData, api_url, imageError]);

  const fetchModulesAndlessons = useCallback(async () => {
    if (!id) return;

    setLoadingModules(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/modules/get-modules-associated-with-the-course/${id}`,
        { withCredentials: true }
      );
      console.log(response.data.data, "modules and lessons");

      const { modules: modulesData, lessons: lessonsData } = response.data.data;
      setModules(modulesData);
      setLessons(lessonsData);

      const modulesWithLessonsData = modulesData.map((module) => ({
        ...module,
        lessons: lessonsData.filter(
          (lesson) => lesson.module_id === module._id
        ),
      }));

      setModulesWithLessons(modulesWithLessonsData);

      if (
        modulesWithLessonsData.length > 0 &&
        modulesWithLessonsData[0].lessons.length > 0
      ) {
        setSelectedLesson(modulesWithLessonsData[0].lessons[0]);
        setExpandedModules(new Set([0]));
      }
    } catch (error) {
      console.error("Error fetching modules and lessons:", error);
      toast.error("Failed to load course content");
    } finally {
      setLoadingModules(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const getCourseDetails = async () => {
      if (!id) return;

      setLoadingCourse(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/instructors/getcoursedatabyid/${id}`,
          { withCredentials: true }
        );
        console.log(res.data.data, "course details");

        if (res.status === 200 && isMounted) {
          setCourseData(res.data.data);
          setImageError(false);
          setImageLoading(true);
          await fetchModulesAndlessons();
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        if (isMounted) {
          toast.error("Failed to load course details");
        }
      } finally {
        if (isMounted) {
          setLoadingCourse(false);
        }
      }
    };

    getCourseDetails();

    return () => {
      isMounted = false;
    };
  }, [id, fetchModulesAndlessons]);

  // Handlers
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
    setExpandedModules(
      new Set(modulesWithLessons?.map((_, idx) => idx) || [])
    );
  };
  const handleLess = () => {
    setShowAll(false);
    setExpandedModules(new Set());
  };

  const handleGoBack = () => {
    navigate(-1);
  }

  if (loadingCourse || !courseData) {
    return (
      <div
        className="d-flex justify-content-center align-items-center w-100"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading course details...</p>
        </div>
      </div>
    );
  }

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
                  <h2 className="fw-bold text-dark mb-0">{courseData.course_title}</h2>
                  <div className="d-flex align-items-center gap-3 mt-1">
                    <span className="badge bg-soft-primary text-primary px-3 rounded-pill">
                      {courseData.category?.category}
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
                  onClick={() => navigate(`/instructor/curriculum/${id}`)}
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  Manage Curriculum
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
                        <h4 className="fw-bold text-white">Welcome to {courseData.course_title}</h4>
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
                    </div>

                    <div className="lesson-info text-dark" style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                      {selectedLesson?.description || courseData.description}
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
                          <span className="fw-bold text-dark">{courseData.level?.course_level}</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-4 border">
                          <small className="d-block text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Language</small>
                          <span className="fw-bold text-dark">{courseData.language?.language}</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-4 border">
                          <small className="d-block text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Modules</small>
                          <span className="fw-bold text-dark">{modules?.length || 0}</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded-4 border">
                          <small className="d-block text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Status</small>
                          <span className="fw-bold text-dark">{courseData.is_active ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-top">
                      <p className="course-description mb-4">{courseData.description}</p>
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
                    {loadingModules ? (
                      <div className="text-center p-5">
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      </div>
                    ) : modulesWithLessons && modulesWithLessons.length > 0 ? (
                      <div className="accordion accordion-flush" id="curriculumAccordion">
                        {modulesWithLessons.map((mod, idx) => (
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
      <style>{`
         .bg-soft-primary { background: #eef2ff !important; }
         .bg-soft-success { background: #ecfdf5 !important; }
         .ratio-16x9 { border-radius: 12px; overflow: hidden; }
         .nav-pills .nav-link.active { background: #667eea !important; color: white !important; }
         .nav-pills .nav-link { color: #667eea; }
         .accordion-button:not(.collapsed) { background: #f8fafc; color: #667eea; }
         .list-group-item-action:hover { background: #f1f5f9; }
      `}</style>
    </div>
  );
};

export default ViewCourseDetailsInstructor;
