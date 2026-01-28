import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./ViewCourseDetailsInstructor.css";

function renderLessonContent(lesson) {
  if (!lesson) return null;
  const lessonType = lesson.lesson_type_id?.lesson_type;
  switch (lessonType) {
    case "video":
      return (
        <div className="lesson-content-wrapper">
          <iframe
            width="100%"
            height="450px"
            className="lesson-video"
            src={`https://www.youtube.com/embed/${lesson.video_url?.split("youtu.be/")[1] || ""
              }`}
            title={lesson.lesson_title}
          />
        </div>
      );
    case "pdf":
      return (
        <div className="lesson-content-wrapper">
          <iframe
            src={lesson.file_path}
            title={lesson.lesson_title}
            className="lesson-pdf"
          />
        </div>
      );
    case "text":
      return (
        <div className="lesson-content-wrapper">
          <div className="lesson-text-content">{lesson.description}</div>
        </div>
      );
    default:
      if (lesson.video_url) {
        return (
          <div className="lesson-content-wrapper">
            <iframe
              width="100%"
              height="450px"
              className="lesson-video"
              src={`https://www.youtube.com/embed/${lesson.video_url?.split("youtu.be/")[1] || ""
                }`}
              title={lesson.lesson_title}
            />
          </div>
        );
      }
      return (
        <div className="lesson-content-wrapper">
          <div className="lesson-unsupported">Unsupported lesson type</div>
        </div>
      );
  }
}

const ViewCourseDetailsInstructor = () => {
  const { id } = useParams();
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
    <div className="modern-grid">
      {/* Breadcrumb */}
      <div className="modern-card py-3 px-4" style={{ gridColumn: "span 12" }}>
        <div className="breadcrumb-content">
          <span className="breadcrumb-item text-muted">Home</span>
          <span className="breadcrumb-separator mx-2 text-muted">&gt;</span>
          <span className="breadcrumb-item active fw-bold text-primary">
            Course Details
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="modern-card" style={{ gridColumn: "span 8" }}>
        {/* Course Header */}
        <div className="course-header-wrapper mb-4">
          <div className="course-image-section mb-3">
            <div className="course-image-container">
              {imageLoading && (
                <div className="image-loading">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
              )}
              <img
                src={courseImageSrc}
                alt={courseData.course_title}
                className="course-main-image"
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                onLoad={() => {
                  setImageError(false);
                  setImageLoading(false);
                }}
                style={{ display: imageLoading ? "none" : "block" }}
              />
            </div>
            <div className="course-status-badges mt-2 d-flex gap-2">
              {courseData.is_active && (
                <span className="badge bg-success">Active</span>
              )}
              {courseData.is_archived && (
                <span className="badge bg-warning text-dark">Archived</span>
              )}
            </div>
          </div>

          <div className="course-title-section">
            <h1 className="course-title h3 fw-bold mb-2">
              {courseData.course_title}
            </h1>
            <div className="course-category mb-2">
              <span className="badge bg-info text-dark">
                {courseData.category?.category}
              </span>
            </div>
            <div className="course-instructors text-muted">
              {courseData.instructors?.map((inst) => (
                <span key={inst.id} className="instructor-name me-2">
                  <i className="fa-solid fa-chalkboard-user me-1"></i>
                  {inst.fname} {inst.lname}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="lesson-display-wrapper mb-4">
          {selectedLesson ? (
            renderLessonContent(selectedLesson)
          ) : (
            <div className="no-lesson-content text-center py-5 bg-light rounded-3">
              <div className="no-lesson-message">
                <i className="fa-solid fa-play-circle fs-1 text-muted mb-3"></i>
                <p className="fw-bold fs-5">No lesson available</p>
                <span className="text-muted">
                  Select a lesson from the course content to start learning
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Course Description */}
        <div className="course-description-wrapper mb-4">
          <h2 className="h5 fw-bold mb-3 border-bottom pb-2">About this course</h2>
          <p className="course-short-description text-muted mb-3 fst-italic">
            {courseData.short_description}
          </p>
          <h3 className="h6 fw-bold mb-2">Description</h3>
          <p className="course-description mb-4">{courseData.description}</p>

          {/* Batch Information */}
          {courseData.isFromBatch &&
            courseData.batchInfo &&
            courseData.batchInfo.length > 0 && (
              <div className="batch-info-section">
                <h3 className="h6 fw-bold mb-3">Batch Information</h3>
                <div className="batch-list">
                  {courseData.batchInfo.map((batch, index) => (
                    <div key={index} className="batch-item">
                      <div className="batch-header">
                        <span className="batch-name">{batch.batch_name}</span>
                        <span className={`batch-status ${batch.status}`}>
                          {batch.status}
                        </span>
                      </div>
                      <div className="batch-dates">
                        <span>
                          Start:{" "}
                          {new Date(batch.start_date).toLocaleDateString()}
                        </span>
                        <span>
                          End: {new Date(batch.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Course Details Grid */}
        <div className="course-details-wrapper">
          <h3 className="h5 fw-bold mb-3 border-bottom pb-2">Course Details</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="fw-semibold text-muted">Max Enrollment:</span>
                <span>{courseData.max_enrollment}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="fw-semibold text-muted">Level:</span>
                <span>{courseData.level?.course_level}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="fw-semibold text-muted">Language:</span>
                <span>{courseData.language?.language}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="fw-semibold text-muted">Subcategory:</span>
                <span>{courseData.subcategory?.subcategory_name}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="fw-semibold text-muted">Start Date:</span>
                <span>
                  {courseData.start_date
                    ? new Date(courseData.start_date).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="fw-semibold text-muted">End Date:</span>
                <span>
                  {courseData.end_date
                    ? new Date(courseData.end_date).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="fw-semibold text-muted">Drip Content:</span>
                <span>
                  {courseData.drip_content_enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="fw-semibold text-muted">Status:</span>
                <span>{courseData.is_active ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="modern-card" style={{ gridColumn: "span 4" }}>
        <div className="course-content-sidebar">
          <div className="sidebar-header d-flex justify-content-between align-items-center mb-3">
            <h3 className="h6 fw-bold mb-0">Modules & Lessons</h3>
            {modulesWithLessons && modulesWithLessons.length > 0 && (
              <button
                onClick={showAll ? handleLess : handleShowAll}
                className="btn btn-sm btn-outline-primary"
              >
                {showAll ? "Show Less" : "Show All"}
              </button>
            )}
          </div>

          {loadingModules ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
              <p className="mt-2 mb-0 small text-muted">Loading modules...</p>
            </div>
          ) : modulesWithLessons && modulesWithLessons.length > 0 ? (
            <div className="modules-list d-flex flex-column gap-2">
              {modulesWithLessons.map((mod, idx) => (
                <div key={mod._id} className="module-item border rounded">
                  <div
                    className={`module-header p-3 d-flex justify-content-between align-items-center cursor-pointer ${expandedModules.has(idx) ? "bg-light" : ""
                      }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleModuleClick(idx)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary rounded-circle">{idx + 1}</span>
                      <span className="fw-semibold small">{mod.module_title}</span>
                    </div>
                    <span className="text-muted small">
                      {expandedModules.has(idx) ? (
                        <i className="fa-solid fa-chevron-up"></i>
                      ) : (
                        <i className="fa-solid fa-chevron-down"></i>
                      )}
                    </span>
                  </div>

                  {expandedModules.has(idx) && (
                    <div className="lessons-list border-top p-2 bg-white">
                      {mod.lessons?.length > 0 ? (
                        mod.lessons.map((lesson) => (
                          <div
                            key={lesson._id}
                            className={`lesson-item p-2 rounded d-flex align-items-center gap-2 mb-1 ${selectedLesson && selectedLesson._id === lesson._id
                                ? "bg-primary bg-opacity-10 text-primary"
                                : "hover-bg-light"
                              }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              const type = lesson.lesson_type_id?.lesson_type;
                              if (type === "pdf" && lesson.file_path) {
                                const fileName = lesson.file_path
                                  .split(/[/\\]/)
                                  .pop();
                                window.open(
                                  `${api_url}/uploads/lessons/${fileName}`,
                                  "_blank"
                                );
                              } else {
                                setSelectedLesson(lesson);
                              }
                            }}
                          >
                            <i className={`fa-solid ${lesson.lesson_type_id?.lesson_type === 'video' ? 'fa-play-circle' :
                                lesson.lesson_type_id?.lesson_type === 'pdf' ? 'fa-file-pdf' :
                                  'fa-file-text'
                              } small`}></i>
                            <span className="small text-truncate flex-grow-1">
                              {lesson.lesson_title}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-2 text-muted small">
                          No lessons yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted border rounded border-dashed">
              <i className="fa-solid fa-book-open fs-3 mb-2"></i>
              <p className="mb-0 small">No modules available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="modern-card text-center py-3 text-muted small"
        style={{ gridColumn: "span 12" }}
      >
        <p className="mb-0">
          &copy; Copyright {new Date().getFullYear()} Edulayne. All rights
          reserved.
        </p>
      </div>
    </div>
  );
};

export default ViewCourseDetailsInstructor;
