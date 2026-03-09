import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaPlay,
  FaFileAlt,
  FaFilePowerpoint,
  FaLink,
  FaQuestionCircle,
  FaDownload,
  FaStickyNote,
  FaChevronLeft,
  FaChevronRight,
  FaListUl,
  FaBookOpen,
  FaRegCircle,
  FaTimesCircle,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import toast from "react-hot-toast";
import QuizTakingModal from "../../components/quiz/QuizTakingModal";
import api from "@/api/axiosInstance";

const ViewCourse = () => {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user?.user);

  const [courseData, setCourseData] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizIdToTake, setQuizIdToTake] = useState(null);
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);
  const [savingLessonState, setSavingLessonState] = useState(false);
  const [notesFocusMode, setNotesFocusMode] = useState(false);
  const [isMediaFullscreen, setIsMediaFullscreen] = useState(false);
  const mediaContainerRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/student/getstudentcourse/${course_id}`);
        const data = res.data?.data;
        setCourseData(data);

        const firstModuleWithLesson = data?.modules?.find((module) => module.lessons?.length);
        const firstLesson = firstModuleWithLesson?.lessons?.[0] || null;
        if (firstLesson) {
          setSelectedLessonId(firstLesson._id);
          setExpandedModules(new Set([firstModuleWithLesson._id]));
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Failed to load course content");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [course_id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsMediaFullscreen(document.fullscreenElement === mediaContainerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const modules = courseData?.modules || [];

  const allLessons = useMemo(
    () =>
      modules.flatMap((module) =>
        (module.lessons || []).map((lesson) => ({
          ...lesson,
          module_id: module._id,
          module_title: module.module_title,
        }))
      ),
    [modules]
  );

  const selectedLesson = useMemo(
    () => allLessons.find((lesson) => lesson._id === selectedLessonId) || null,
    [allLessons, selectedLessonId]
  );

  const totalLessons = courseData?.totalLessons || allLessons.length;
  const completedLessons =
    courseData?.completedLessons || allLessons.filter((lesson) => lesson.is_completed).length;
  const progress = courseData?.progress || 0;

  const selectedLessonIndex = allLessons.findIndex((lesson) => lesson._id === selectedLessonId);
  const hasPrevLesson = selectedLessonIndex > 0;
  const hasNextLesson = selectedLessonIndex >= 0 && selectedLessonIndex < allLessons.length - 1;

  const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";
  const appBaseUrl = apiBaseUrl.endsWith("/api")
    ? apiBaseUrl.slice(0, -4)
    : apiBaseUrl.replace(/\/$/, "");

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const selectLesson = (lesson, moduleId) => {
    setSelectedLessonId(lesson._id);
    setExpandedModules((prev) => new Set([...prev, moduleId]));
    setMobileOutlineOpen(false);
    setNotesFocusMode(false);
  };

  const goToAdjacentLesson = (direction) => {
    if (!selectedLesson) return;
    const nextIndex = direction === "next" ? selectedLessonIndex + 1 : selectedLessonIndex - 1;
    if (nextIndex >= 0 && nextIndex < allLessons.length) {
      setSelectedLessonId(allLessons[nextIndex]._id);
    }
  };

  const updateSelectedLessonProgress = async (isCompleted) => {
    if (!selectedLesson?._id || savingLessonState) return;

    setSavingLessonState(true);
    try {
      const res = await api.patch(
        `/users/student/getstudentcourse/${course_id}/lessons/${selectedLesson._id}/progress`,
        { is_completed: isCompleted }
      );

      const responseData = res.data?.data || {};

      setCourseData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          progress: responseData.progress ?? prev.progress,
          completedLessons: responseData.completedLessons ?? prev.completedLessons,
          totalLessons: responseData.totalLessons ?? prev.totalLessons,
          modules: (prev.modules || []).map((module) => ({
            ...module,
            lessons: (module.lessons || []).map((lesson) =>
              lesson._id === selectedLesson._id
                ? {
                    ...lesson,
                    is_completed: isCompleted,
                    completed_at: responseData.completed_at || (isCompleted ? new Date().toISOString() : null),
                  }
                : lesson
            ),
          })),
        };
      });

      toast.success(isCompleted ? "Lesson marked complete" : "Lesson marked incomplete");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update lesson status");
    } finally {
      setSavingLessonState(false);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <FaPlay className="small" />;
      case "pdf":
        return <FaFileAlt className="small" />;
      case "ppt":
        return <FaFilePowerpoint className="small" />;
      case "link":
        return <FaLink className="small" />;
      case "quiz":
        return <FaQuestionCircle className="small" />;
      default:
        return <FaBookOpen className="small" />;
    }
  };

  const getEmbedVideoUrl = (videoUrl) => {
    if (!videoUrl) return null;

    try {
      if (videoUrl.includes("youtu.be/")) {
        return `https://www.youtube-nocookie.com/embed/${videoUrl.split("youtu.be/")[1].split("?")[0]}?rel=0&modestbranding=1`;
      }

      if (videoUrl.includes("youtube.com/watch")) {
        const videoId = new URL(videoUrl).searchParams.get("v");
        return videoId
          ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
          : null;
      }

      if (videoUrl.includes("youtube.com/embed/")) {
        return `https://www.youtube-nocookie.com/embed/${videoUrl.split("youtube.com/embed/")[1].split("?")[0]}?rel=0&modestbranding=1`;
      }
    } catch (error) {
      console.warn("Failed to parse video url", error);
    }

    return null;
  };

  const renderLessonContent = (lesson) => {
    if (!lesson) {
      return (
        <div className="student-course-empty-state">
          <h4>Select a lesson</h4>
          <p>Choose any lesson from the course outline to begin learning.</p>
        </div>
      );
    }

    const type = lesson.lesson_type_id?.lesson_type || "text";
    const youtubeEmbedUrl = getEmbedVideoUrl(lesson.video_url);
    const lessonFileUrl = lesson.file_path
      ? `${appBaseUrl}/${String(lesson.file_path).replace(/\\/g, "/").replace(/^\/+/, "")}`
      : "";

    switch (type) {
      case "video":
        if (youtubeEmbedUrl) {
          return (
            <iframe
              className="student-course-media-frame"
              src={youtubeEmbedUrl}
              title={lesson.lesson_title || "Lesson video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          );
        }

        if (lesson.video_url) {
          return (
            <video className="student-course-media-frame" controls playsInline src={lesson.video_url}>
              Your browser does not support the video tag.
            </video>
          );
        }

        if (lessonFileUrl) {
          return (
            <video className="student-course-media-frame" controls playsInline src={lessonFileUrl}>
              Your browser does not support the video tag.
            </video>
          );
        }

        return (
          <div className="student-course-empty-state dark">
            <h4>Video unavailable</h4>
            <p>This lesson does not have a playable video source yet.</p>
          </div>
        );

      case "quiz":
        return (
          <div className="student-course-centered-card">
            <div className="student-course-icon-badge primary">
              <FaQuestionCircle size={38} />
            </div>
            <h3>{lesson.lesson_title}</h3>
            <p>Test your understanding and submit the quiz when you are ready.</p>
            <button
              className="btn btn-primary rounded-pill px-4 fw-bold"
              onClick={() => {
                const quizId = lesson.quiz_id?._id || lesson.quiz_id;
                if (!quizId) {
                  toast.error("Quiz content not found for this lesson");
                  return;
                }
                setQuizIdToTake(quizId);
                setShowQuizModal(true);
              }}
            >
              Start Quiz
            </button>
          </div>
        );

      case "pdf":
      case "ppt":
        return (
          <div className="student-course-centered-card">
            <div className={`student-course-icon-badge ${type === "pdf" ? "danger" : "warning"}`}>
              {type === "pdf" ? <FaFileAlt size={38} /> : <FaFilePowerpoint size={38} />}
            </div>
            <h3>{lesson.lesson_title}</h3>
            <p>Open the lesson document in a new tab for a better reading experience.</p>
            <a
              href={lessonFileUrl}
              target="_blank"
              rel="noreferrer"
              className={`btn ${type === "pdf" ? "btn-danger" : "btn-warning"} rounded-pill px-4 fw-bold`}
            >
              Open {type.toUpperCase()}
            </a>
          </div>
        );

      case "link":
        return (
          <div className="student-course-centered-card">
            <div className="student-course-icon-badge primary">
              <FaLink size={38} />
            </div>
            <h3>{lesson.lesson_title}</h3>
            <p>Open the external learning resource for this lesson.</p>
            <a href={lesson.video_url} target="_blank" rel="noreferrer" className="btn btn-primary rounded-pill px-4 fw-bold">
              Go to Resource
            </a>
          </div>
        );

      case "text":
      default:
        return (
          <div className="student-course-text-content">
            <h2>{lesson.lesson_title}</h2>
            <div className="student-course-copy">{lesson.description || lesson.lesson_description || "No lesson notes available."}</div>
          </div>
        );
    }
  };

  const toggleMediaFullscreen = async () => {
    try {
      if (document.fullscreenElement === mediaContainerRef.current) {
        await document.exitFullscreen();
        return;
      }

      if (mediaContainerRef.current?.requestFullscreen) {
        await mediaContainerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen:", error);
      toast.error("Unable to open fullscreen view");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light p-4 text-center">
        <div className="bg-white p-5 rounded-4 shadow-sm">
          <div className="text-danger mb-4">
            <FaArrowLeft size={48} className="opacity-25" />
          </div>
          <h3 className="fw-bold mb-2">Course Unavailable</h3>
          <p className="text-muted mb-4">
            We could not load the course content. It may be inactive or you may not have access.
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-primary rounded-pill px-5 fw-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { course } = courseData;

  return (
    <div className="student-course-shell">
      <header className="student-course-header">
        <div className="student-course-header-left">
          <button onClick={() => navigate(-1)} className="student-course-back-btn" type="button">
            <FaArrowLeft />
          </button>
          <div className="student-course-title-wrap">
            <span className="student-course-kicker">Student Course</span>
            <h1>{course?.course_title}</h1>
            <p>
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>
        </div>

        <div className="student-course-header-right">
          <div className="student-course-progress-card">
            <div className="student-course-progress-top">
              <span>Progress</span>
              <strong>{progress}%</strong>
            </div>
            <div className="student-course-progress-bar">
              <div className="student-course-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <button
            type="button"
            className="student-course-outline-btn"
            onClick={() => setMobileOutlineOpen((prev) => !prev)}
          >
            <FaListUl />
            <span>{mobileOutlineOpen ? "Hide Outline" : "Show Outline"}</span>
          </button>
        </div>
      </header>

      <main className="student-course-main">
        <section className="student-course-content-panel">
          <div ref={mediaContainerRef} className="student-course-media-wrap">
            <button
              type="button"
              className="student-course-media-toggle"
              onClick={toggleMediaFullscreen}
              aria-label={isMediaFullscreen ? "Exit fullscreen" : "Open fullscreen"}
              title={isMediaFullscreen ? "Exit fullscreen" : "Open fullscreen"}
            >
              {isMediaFullscreen ? <FaCompress /> : <FaExpand />}
              <span className="student-course-toggle-label">{isMediaFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>
            {renderLessonContent(selectedLesson)}
          </div>

          <div className="student-course-nav-row">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4 fw-semibold"
              onClick={() => goToAdjacentLesson("prev")}
              disabled={!hasPrevLesson}
            >
              <FaChevronLeft className="me-2" />
              Previous
            </button>
            <button
              type="button"
              className="btn btn-outline-primary rounded-pill px-4 fw-semibold"
              onClick={() => goToAdjacentLesson("next")}
              disabled={!hasNextLesson}
            >
              Next
              <FaChevronRight className="ms-2" />
            </button>
          </div>

          <div className={`student-course-body-card ${activeTab === "notes" && notesFocusMode ? "notes-focus" : ""}`}>
            <div className="student-course-tab-row">
              <button
                type="button"
                className={`student-course-tab ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                type="button"
                className={`student-course-tab ${activeTab === "notes" ? "active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                <FaStickyNote />
                <span>Notes</span>
              </button>
              <button
                type="button"
                className={`student-course-tab ${activeTab === "resources" ? "active" : ""}`}
                onClick={() => setActiveTab("resources")}
              >
                <FaDownload />
                <span>Resources</span>
              </button>
            </div>

            {activeTab === "overview" && (
              <div className="student-course-tab-panel">
                <div className="student-course-overview-top">
                  <div>
                    <div className="student-course-type-badge">
                      {selectedLesson?.lesson_type_id?.lesson_type || "lesson"}
                    </div>
                    <h2>{selectedLesson?.lesson_title || course?.course_title}</h2>
                    <p className="student-course-meta-line">
                      Section: {selectedLesson?.module_title || "Course"} {selectedLesson?.lesson_duration ? `• ${selectedLesson.lesson_duration} min` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`btn rounded-pill px-4 fw-bold ${selectedLesson?.is_completed ? "btn-outline-danger" : "btn-success"}`}
                    onClick={() => updateSelectedLessonProgress(!selectedLesson?.is_completed)}
                    disabled={!selectedLesson || savingLessonState}
                  >
                    {selectedLesson?.is_completed ? <FaTimesCircle className="me-2" /> : <FaCheckCircle className="me-2" />}
                    {savingLessonState
                      ? "Saving..."
                      : selectedLesson?.is_completed
                        ? "Mark Incomplete"
                        : "Mark Complete"}
                  </button>
                </div>

                <div className="student-course-description-card">
                  <h3>Description</h3>
                  <p>{selectedLesson?.description || selectedLesson?.lesson_description || course?.course_description || "No description available."}</p>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="student-course-tab-panel">
                <div className="student-course-panel-actions">
                  <button
                    type="button"
                    className="student-course-focus-btn"
                    onClick={() => setNotesFocusMode((prev) => !prev)}
                    aria-label={notesFocusMode ? "Exit focus view" : "Open focus view"}
                    title={notesFocusMode ? "Exit focus view" : "Open focus view"}
                  >
                    {notesFocusMode ? <FaCompress /> : <FaExpand />}
                    <span className="student-course-toggle-label">{notesFocusMode ? "Exit Focus View" : "Focus View"}</span>
                  </button>
                </div>
                <div className="student-course-note-box">
                  <div className="student-course-icon-badge warning small">
                    <FaStickyNote size={20} />
                  </div>
                  <div>
                    <h3>Instructor Notes</h3>
                    <p>
                      {selectedLesson?.description ||
                        selectedLesson?.lesson_description ||
                        "Lesson notes are not available for this topic yet."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "resources" && (
              <div className="student-course-tab-panel">
                <h3 className="mb-3">Lesson Resources</h3>
                <div className="student-course-resource-grid">
                  {selectedLesson?.file_path ? (
                    <a
                      href={`${appBaseUrl}/${String(selectedLesson.file_path).replace(/\\/g, "/").replace(/^\/+/, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="student-course-resource-card"
                    >
                      <div className="student-course-icon-badge danger small">
                        <FaDownload size={18} />
                      </div>
                      <div>
                        <strong>{selectedLesson.lesson_title}</strong>
                        <span>Open lesson file</span>
                      </div>
                    </a>
                  ) : null}

                  {selectedLesson?.video_url && selectedLesson?.lesson_type_id?.lesson_type === "link" ? (
                    <a
                      href={selectedLesson.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="student-course-resource-card"
                    >
                      <div className="student-course-icon-badge primary small">
                        <FaLink size={18} />
                      </div>
                      <div>
                        <strong>External Resource</strong>
                        <span>Open linked content</span>
                      </div>
                    </a>
                  ) : null}

                  {!selectedLesson?.file_path && !(selectedLesson?.video_url && selectedLesson?.lesson_type_id?.lesson_type === "link") ? (
                    <div className="student-course-empty-inline">
                      Additional resources will appear here when the instructor adds them.
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className={`student-course-sidebar ${mobileOutlineOpen ? "open" : ""}`}>
          <div className="student-course-sidebar-head">
            <div>
              <span className="student-course-kicker">Course Outline</span>
              <h2>Sections & Lessons</h2>
            </div>
            <button type="button" className="student-course-close-btn" onClick={() => setMobileOutlineOpen(false)}>
              <FaTimesCircle />
            </button>
          </div>

          <div className="student-course-sidebar-body">
            {modules.map((module, moduleIndex) => (
              <div key={module._id} className="student-course-module-card">
                <button
                  type="button"
                  className="student-course-module-toggle"
                  onClick={() => toggleModule(module._id)}
                >
                  <div>
                    <span className="student-course-kicker">Section {moduleIndex + 1}</span>
                    <h3>{module.module_title}</h3>
                  </div>
                  <span>{expandedModules.has(module._id) ? "-" : "+"}</span>
                </button>

                {expandedModules.has(module._id) && (
                  <div className="student-course-lesson-list">
                    {(module.lessons || []).map((lesson, lessonIndex) => {
                      const active = selectedLessonId === lesson._id;
                      const type = lesson.lesson_type_id?.lesson_type;

                      return (
                        <button
                          key={lesson._id}
                          type="button"
                          className={`student-course-lesson-btn ${active ? "active" : ""}`}
                          onClick={() => selectLesson(lesson, module._id)}
                        >
                          <div className={`student-course-lesson-icon ${active ? "active" : ""}`}>
                            {getLessonIcon(type)}
                          </div>

                          <div className="student-course-lesson-copy">
                            <strong>
                              {lessonIndex + 1}. {lesson.lesson_title}
                            </strong>
                            <span>{lesson.lesson_duration ? `${lesson.lesson_duration} min` : type || "lesson"}</span>
                          </div>

                          <div className="student-course-lesson-state">
                            {lesson.is_completed ? (
                              <FaCheckCircle className="text-success" title="Completed" />
                            ) : (
                              <FaRegCircle className="text-muted" title="Incomplete" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {mobileOutlineOpen ? <div className="student-course-overlay" onClick={() => setMobileOutlineOpen(false)}></div> : null}
      </main>
      <style>{`
        .student-course-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 28%),
            linear-gradient(180deg, #f6f8fc 0%, #eef3f8 100%);
          font-family: 'Outfit', sans-serif;
          color: #10233f;
        }
        .student-course-header {
          position: sticky;
          top: 0;
          z-index: 40;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.22);
        }
        .student-course-header-left,
        .student-course-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .student-course-back-btn,
        .student-course-outline-btn,
        .student-course-close-btn {
          border: 1px solid #d7e1ec;
          background: #fff;
          color: #10233f;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          font-weight: 700;
        }
        .student-course-back-btn {
          width: 42px;
          height: 42px;
          padding: 0;
        }
        .student-course-title-wrap h1,
        .student-course-sidebar-head h2,
        .student-course-overview-top h2,
        .student-course-centered-card h3,
        .student-course-text-content h2 {
          margin: 0;
        }
        .student-course-title-wrap h1 {
          font-size: clamp(1.05rem, 2vw, 1.5rem);
          font-weight: 800;
        }
        .student-course-title-wrap p {
          margin: 4px 0 0;
          color: #5f718a;
          font-size: 0.92rem;
        }
        .student-course-kicker {
          display: inline-block;
          margin-bottom: 4px;
          color: #5b6c85;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.68rem;
          font-weight: 800;
        }
        .student-course-progress-card {
          min-width: 180px;
          padding: 12px 14px;
          background: #f7fafc;
          border-radius: 16px;
          border: 1px solid #dce6f1;
        }
        .student-course-progress-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 0.85rem;
          color: #5f718a;
          font-weight: 700;
        }
        .student-course-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%);
        }
        .student-course-progress-bar {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: #dce7f3;
          overflow: hidden;
        }
        .student-course-main {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 24px;
          padding: 24px;
          position: relative;
        }
        .student-course-content-panel {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .student-course-media-wrap,
        .student-course-body-card,
        .student-course-sidebar,
        .student-course-nav-row {
          border: 1px solid rgba(203, 213, 225, 0.85);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 22px 50px -28px rgba(15, 23, 42, 0.28);
        }
        .student-course-media-wrap {
          position: relative;
          overflow: hidden;
          min-height: 460px;
          aspect-ratio: 16 / 9;
          background: #09111f;
        }
        .student-course-media-toggle,
        .student-course-focus-btn {
          border: 1px solid rgba(203, 213, 225, 0.9);
          background: rgba(255, 255, 255, 0.95);
          color: #10233f;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          font-weight: 700;
          line-height: 1;
        }
        .student-course-media-toggle {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
        }
        .student-course-toggle-label {
          white-space: nowrap;
        }
        .student-course-media-frame {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
          object-fit: contain;
          background: #000;
        }
        .student-course-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
        }
        .student-course-body-card {
          padding: 22px;
        }
        .student-course-tab-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .student-course-tab {
          border: 1px solid #dbe5ef;
          background: #f8fbff;
          color: #37506b;
          border-radius: 999px;
          padding: 11px 16px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .student-course-tab.active {
          background: #10233f;
          color: #fff;
          border-color: #10233f;
        }
        .student-course-tab-panel {
          min-height: 320px;
        }
        .student-course-panel-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 14px;
        }
        .student-course-overview-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }
        .student-course-type-badge {
          display: inline-flex;
          margin-bottom: 10px;
          padding: 6px 10px;
          background: #e0f2fe;
          color: #0369a1;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.76rem;
          text-transform: capitalize;
        }
        .student-course-meta-line {
          margin: 8px 0 0;
          color: #6b7c93;
        }
        .student-course-description-card,
        .student-course-note-box,
        .student-course-resource-card,
        .student-course-centered-card,
        .student-course-empty-inline {
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #fbfdff;
        }
        .student-course-description-card {
          padding: 18px;
        }
        .student-course-description-card h3 {
          font-size: 1rem;
          font-weight: 800;
          margin-bottom: 10px;
        }
        .student-course-description-card p,
        .student-course-note-box p,
        .student-course-centered-card p,
        .student-course-empty-state p,
        .student-course-copy,
        .student-course-empty-inline {
          color: #5f718a;
          line-height: 1.7;
          white-space: pre-line;
        }
        .student-course-note-box {
          display: flex;
          gap: 16px;
          padding: 22px;
          min-height: 320px;
        }
        .student-course-body-card.notes-focus {
          position: fixed;
          inset: 24px;
          z-index: 80;
          overflow: auto;
          padding: 24px;
        }
        .student-course-resource-grid {
          display: grid;
          gap: 14px;
        }
        .student-course-resource-card {
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
        }
        .student-course-resource-card span {
          display: block;
          color: #6b7c93;
          font-size: 0.9rem;
          margin-top: 2px;
        }
        .student-course-empty-inline {
          padding: 16px;
        }
        .student-course-sidebar {
          position: sticky;
          top: 96px;
          align-self: start;
          max-height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .student-course-sidebar-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 18px 18px 14px;
          border-bottom: 1px solid #e2e8f0;
        }
        .student-course-sidebar-head h2 {
          font-size: 1.1rem;
          font-weight: 800;
        }
        .student-course-close-btn {
          display: none;
          width: 40px;
          height: 40px;
          padding: 0;
        }
        .student-course-sidebar-body {
          overflow: auto;
          padding: 14px;
        }
        .student-course-module-card {
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
          background: #fdfefe;
          margin-bottom: 12px;
        }
        .student-course-module-toggle {
          width: 100%;
          border: 0;
          background: #f8fbff;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
        }
        .student-course-module-toggle h3 {
          font-size: 0.98rem;
          margin: 0;
          font-weight: 800;
        }
        .student-course-lesson-list {
          padding: 10px;
          display: grid;
          gap: 8px;
        }
        .student-course-lesson-btn {
          width: 100%;
          border: 1px solid transparent;
          background: #fff;
          border-radius: 16px;
          padding: 12px;
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) 22px;
          gap: 12px;
          align-items: center;
          text-align: left;
        }
        .student-course-lesson-btn.active {
          background: #eff6ff;
          border-color: #93c5fd;
        }
        .student-course-lesson-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dbe5ef;
          background: #fff;
          color: #63758c;
        }
        .student-course-lesson-icon.active {
          background: #2563eb;
          border-color: #2563eb;
          color: #fff;
        }
        .student-course-lesson-copy {
          min-width: 0;
        }
        .student-course-lesson-copy strong,
        .student-course-lesson-copy span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .student-course-lesson-copy strong {
          font-size: 0.93rem;
          color: #11243f;
        }
        .student-course-lesson-copy span {
          font-size: 0.8rem;
          color: #6b7c93;
          margin-top: 4px;
        }
        .student-course-lesson-state {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .student-course-text-content {
          padding: clamp(20px, 4vw, 36px);
          background: #fff;
          min-height: 100%;
        }
        .student-course-copy {
          margin-top: 16px;
          font-size: 1rem;
        }
        .student-course-centered-card,
        .student-course-empty-state {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px;
        }
        .student-course-empty-state.dark {
          background: #09111f;
          color: #fff;
        }
        .student-course-empty-state.dark p {
          color: rgba(255, 255, 255, 0.72);
        }
        .student-course-icon-badge {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }
        .student-course-icon-badge.small {
          width: 46px;
          height: 46px;
          margin-bottom: 0;
        }
        .student-course-icon-badge.primary {
          background: rgba(37, 99, 235, 0.12);
          color: #2563eb;
        }
        .student-course-icon-badge.warning {
          background: rgba(245, 158, 11, 0.14);
          color: #d97706;
        }
        .student-course-icon-badge.danger {
          background: rgba(239, 68, 68, 0.14);
          color: #dc2626;
        }
        .student-course-overlay {
          display: none;
        }
        @media (max-width: 1199.98px) {
          .student-course-main {
            grid-template-columns: minmax(0, 1fr);
          }
          .student-course-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            z-index: 70;
            width: min(420px, 92vw);
            height: 100vh;
            max-height: none;
            border-radius: 24px 0 0 24px;
            transform: translateX(100%);
            transition: transform 0.25s ease;
          }
          .student-course-sidebar.open {
            transform: translateX(0);
          }
          .student-course-close-btn {
            display: inline-flex;
          }
          .student-course-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 60;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(2px);
          }
          .student-course-media-wrap {
            min-height: 500px;
          }
          .student-course-tab-panel {
            min-height: 360px;
          }
          .student-course-note-box {
            min-height: 340px;
          }
        }
        @media (min-width: 1200px) {
          .student-course-outline-btn {
            display: none;
          }
        }
        @media (max-width: 767.98px) {
          .student-course-header {
            padding: 14px 16px;
            flex-direction: column;
            align-items: stretch;
          }
          .student-course-header-left,
          .student-course-header-right {
            width: 100%;
            justify-content: space-between;
          }
          .student-course-header-right {
            flex-wrap: wrap;
          }
          .student-course-progress-card {
            flex: 1 1 180px;
            min-width: 0;
          }
          .student-course-main {
            padding: 12px;
            gap: 12px;
          }
          .student-course-media-wrap {
            min-height: 400px;
            aspect-ratio: auto;
          }
          .student-course-media-toggle,
          .student-course-focus-btn {
            width: 42px;
            height: 42px;
            padding: 0;
            justify-content: center;
            gap: 0;
          }
          .student-course-focus-btn {
            width: auto;
            min-height: 42px;
            padding: 0 12px;
            gap: 8px;
          }
          .student-course-media-toggle .student-course-toggle-label {
            display: none;
          }
          .student-course-nav-row,
          .student-course-overview-top,
          .student-course-note-box {
            flex-direction: column;
            align-items: stretch;
          }
          .student-course-panel-actions {
            justify-content: flex-end;
          }
          .student-course-nav-row .btn,
          .student-course-overview-top .btn {
            width: 100%;
          }
          .student-course-body-card {
            padding: 14px;
          }
          .student-course-tab-panel {
            min-height: 300px;
          }
          .student-course-note-box {
            min-height: 280px;
          }
          .student-course-body-card.notes-focus {
            inset: 10px;
            padding: 16px;
          }
          .student-course-tab {
            flex: 1 1 calc(50% - 10px);
            justify-content: center;
          }
        }
      `}</style>

      {showQuizModal && quizIdToTake && (
        <QuizTakingModal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          quizId={quizIdToTake}
          courseId={course_id}
          moduleId={selectedLesson?.module_id}
          studentId={user?.user_id}
        />
      )}
    </div>
  );
};

export default ViewCourse;
