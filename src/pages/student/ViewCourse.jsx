import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { FaArrowLeft, FaCheckCircle, FaPlay, FaFileAlt, FaFilePowerpoint, FaLink, FaQuestionCircle, FaDownload, FaStickyNote, FaChevronLeft, FaChevronRight, FaExpand, FaCompress } from "react-icons/fa";
import toast from "react-hot-toast";
import QuizTakingModal from "../../components/quiz/QuizTakingModal";

const ViewCourse = () => {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'notes', 'resources'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const user = useSelector((state) => state.user?.user); // Get current logged-in student

  const [quizIdToTake, setQuizIdToTake] = useState(null);

  const api_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${api_url}/users/student/getstudentcourse/${course_id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setCourseData(res.data.data);
        const firstLesson = res.data.data?.modules?.[0]?.lessons?.[0] || null;
        if (firstLesson) {
          setSelectedLesson(firstLesson);
          setExpandedModules(new Set([res.data.data.modules[0]._id]));
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load course content");
      })
      .finally(() => setLoading(false));
  }, [course_id, api_url]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <FaPlay className="small" />;
      case 'pdf': return <FaFileAlt className="small" />;
      case 'ppt': return <FaFilePowerpoint className="small" />;
      case 'link': return <FaLink className="small" />;
      case 'quiz': return <FaQuestionCircle className="small" />;
      default: return <FaFileAlt className="small" />;
    }
  };

  const handleNextLesson = () => {
    // Logic to find next lesson
    if (!courseData || !selectedLesson) return;
    const allLessons = [];
    courseData.modules.forEach(m => {
      if (m.lessons) allLessons.push(...m.lessons);
    });
    const currentIndex = allLessons.findIndex(l => l._id === selectedLesson._id);
    if (currentIndex < allLessons.length - 1) {
      setSelectedLesson(allLessons[currentIndex + 1]);
    } else {
      toast.success("Course Completed!");
    }
  };

  const handlePrevLesson = () => {
    if (!courseData || !selectedLesson) return;
    const allLessons = [];
    courseData.modules.forEach(m => {
      if (m.lessons) allLessons.push(...m.lessons);
    });
    const currentIndex = allLessons.findIndex(l => l._id === selectedLesson._id);
    if (currentIndex > 0) {
      setSelectedLesson(allLessons[currentIndex - 1]);
    }
  };

  const renderLessonContent = (lesson) => {
    if (!lesson) return null;
    const type = lesson.lesson_type_id?.lesson_type || 'text';
    const api_root = api_url.replace('/api', '');

    switch (type) {
      case "video":
        let videoId = "";
        if (lesson.video_url) {
          if (lesson.video_url.includes("youtu.be/")) videoId = lesson.video_url.split("youtu.be/")[1];
          else if (lesson.video_url.includes("youtube.com/watch?v=")) videoId = new URLSearchParams(new URL(lesson.video_url).search).get('v');
          else if (lesson.video_url.includes("youtube.com/embed/")) videoId = lesson.video_url.split("youtube.com/embed/")[1];
        }
        return videoId ? (
          <iframe className="w-100 h-100 border-0" src={`https://www.youtube.com/embed/${videoId}`} title="Video" allowFullScreen />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 bg-dark text-white text-opacity-50">Invalid Video URL</div>
        );
      case "quiz":
        return (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white p-5 text-center">
            <div className="p-4 rounded-circle mb-3 bg-primary bg-opacity-10 text-primary">
              <FaQuestionCircle size={40} />
            </div>
            <h4 className="fw-bold">{lesson.lesson_title}</h4>
            <p className="text-muted mb-4">Test your knowledge with this quiz.</p>
            <button
              className="btn btn-lg btn-primary fw-bold px-5 rounded-pill shadow-sm animate-pulse"
              onClick={() => {
                // The lesson object should contain quiz_id either directly or populated
                // Assuming lesson.quiz_id is the ID or lesson.quiz_id._id 
                const qId = lesson.quiz_id?._id || lesson.quiz_id;
                if (qId) {
                  setQuizIdToTake(qId);
                  setShowQuizModal(true);
                } else {
                  toast.error("Quiz content not found for this lesson");
                }
              }}
            >
              Start Quiz
            </button>
          </div>
        );
      case "pdf":
      case "ppt":
        return (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white p-5 text-center">
            <div className={`p-4 rounded-circle mb-3 ${type === 'pdf' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-warning bg-opacity-10 text-warning'}`}>
              {type === 'pdf' ? <FaFileAlt size={40} /> : <FaFilePowerpoint size={40} />}
            </div>
            <h4 className="fw-bold">{lesson.lesson_title}</h4>
            <p className="text-muted mb-4">Click below to view the {type.toUpperCase()} document.</p>
            <a href={`${api_root}/${lesson.file_path}`} target="_blank" rel="noreferrer" className={`btn btn-lg ${type === 'pdf' ? 'btn-danger' : 'btn-warning'} fw-bold px-5 rounded-pill`}>
              Open Document
            </a>
          </div>
        );
      case "link":
        return (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-white p-5 text-center">
            <div className="p-4 rounded-circle mb-3 bg-primary bg-opacity-10 text-primary">
              <FaLink size={40} />
            </div>
            <h4 className="fw-bold">{lesson.lesson_title}</h4>
            <p className="text-muted mb-4">This lesson links to external resources.</p>
            <a href={lesson.video_url} target="_blank" rel="noreferrer" className="btn btn-lg btn-primary fw-bold px-5 rounded-pill">
              Go to Resource
            </a>
          </div>
        );
      case "text":
        return (
          <div className="bg-white h-100 overflow-auto p-4 p-md-5">
            <h2 className="fw-bold mb-4">{lesson.lesson_title}</h2>
            <div className="fs-5 text-dark opacity-75" style={{ lineHeight: '1.8' }}>
              {lesson.description || lesson.lesson_description}
            </div>
          </div>
        );
      default:
        return <div className="p-5 text-center">Unsupported content type</div>;
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  const { course, modules } = courseData;

  return (
    <div className="student-player-layout bg-light min-vh-100 d-flex flex-column">
      {/* Header */}
      <header className="bg-white border-bottom py-2 px-4 d-flex align-items-center justify-content-between sticky-top shadow-sm z-10">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center">
            <FaArrowLeft className="text-muted" />
          </button>
          <div className="d-flex flex-column">
            <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '10px' }}>Course</span>
            <h6 className="fw-bold mb-0 text-dark text-truncate" style={{ maxWidth: '300px' }}>{course.course_title}</h6>
          </div>
        </div>
        <div className="d-none d-md-flex align-items-center gap-4">
          <div className="d-flex flex-column align-items-end">
            <div className="d-flex justify-content-between w-100 mb-1">
              <span className="extra-small fw-bold text-muted">PROGRESS</span>
              <span className="extra-small fw-bold text-primary">45%</span>
            </div>
            <div className="progress" style={{ height: '6px', width: '180px' }}>
              <div className="progress-bar bg-primary" role="progressbar" style={{ width: '45%' }}></div>
            </div>
          </div>
          <button className="btn btn-dark btn-sm rounded-pill px-3" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <FaChevronLeft /> : <FaExpand className="me-2" />}
            {isSidebarCollapsed ? 'Show Menu' : 'Focus Mode'}
          </button>
        </div>
      </header>

      <main className="flex-grow-1 overflow-hidden">
        <div className="d-flex h-100">
          {/* Main Content Area */}
          <div className={`flex-grow-1 h-100 overflow-auto bg-white d-flex flex-column transition-all`} style={{ width: isSidebarCollapsed ? '100%' : 'calc(100% - 350px)' }}>
            {/* Player */}
            <div className="player-container ratio ratio-16x9 bg-black shadow-sm" style={{ maxHeight: '60vh', minHeight: '400px' }}>
              {renderLessonContent(selectedLesson)}
            </div>

            {/* Navigation Bar */}
            <div className="bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
              <button className="btn btn-outline-secondary btn-sm fw-bold rounded-pill px-4" onClick={handlePrevLesson}>
                <FaChevronLeft className="me-2" /> Previous
              </button>
              <button className="btn btn-outline-primary btn-sm fw-bold rounded-pill px-4" onClick={handleNextLesson}>
                Next <FaChevronRight className="ms-2" />
              </button>
            </div>

            {/* Content Tabs */}
            <div className="p-4 flex-grow-1 bg-white">
              <ul className="nav nav-pills mb-4 border-bottom pb-2">
                <li className="nav-item">
                  <button className={`nav-link rounded-pill px-4 ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link rounded-pill px-4 d-flex align-items-center gap-2 ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                    <FaStickyNote /> Instructor Notes
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link rounded-pill px-4 d-flex align-items-center gap-2 ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
                    <FaDownload /> Resources
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <div className="fade-in">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <h3 className="fw-bold text-dark mb-1">{selectedLesson?.lesson_title}</h3>
                        <span className="badge bg-primary bg-opacity-10 text-primary">{selectedLesson?.lesson_type_id?.lesson_type}</span>
                      </div>
                      <button className="btn btn-success rounded-pill shadow-sm d-flex align-items-center gap-2">
                        <FaCheckCircle /> Mark Complete
                      </button>
                    </div>
                    <h5 className="fw-bold mb-2">Description</h5>
                    <p className="text-muted" style={{ lineHeight: '1.7', whiteSpace: 'pre-line' }}>{selectedLesson?.description || course.description}</p>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="fade-in">
                    <div className="alert alert-light border d-flex gap-3 align-items-start rounded-4 p-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                        <FaStickyNote size={24} />
                      </div>
                      <div>
                        <h5 className="fw-bold">Instructor Notes</h5>
                        <p className="text-muted mb-0">Here are some key takeaways and additional notes provided by your instructor for this lesson.</p>
                        <hr className="my-3" />
                        <div className="text-dark opacity-75">
                          {/* Placeholder for actual notes data */}
                          <ul className="list-unstyled d-flex flex-column gap-2">
                            <li className="d-flex align-items-center gap-2"><FaCheckCircle className="text-success small" /> Focus on the key concepts discussed at 05:20</li>
                            <li className="d-flex align-items-center gap-2"><FaCheckCircle className="text-success small" /> Review the attached PDF for detailed diagrams</li>
                            <li className="d-flex align-items-center gap-2"><FaCheckCircle className="text-success small" /> Make sure to complete the quiz before moving to next module</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="fade-in">
                    <h5 className="fw-bold mb-4">Downloadable Resources</h5>
                    <div className="row g-3">
                      {/* Mock Resources or Real File if exists */}
                      {selectedLesson?.file_path && (['pdf', 'ppt'].includes(selectedLesson?.lesson_type_id?.lesson_type)) && (
                        <div className="col-md-6">
                          <div className="p-3 border rounded-4 d-flex align-items-center gap-3 hover-shadow transition-all bg-light">
                            <div className="bg-white p-3 rounded-circle border text-danger">
                              <FaFileAlt size={24} />
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="fw-bold mb-1">{selectedLesson.lesson_title}.{selectedLesson.lesson_type_id?.lesson_type}</h6>
                              <small className="text-muted">Main Lesson File</small>
                            </div>
                            <a href={`${api_url.replace('/api', '')}/${selectedLesson.file_path}`} target="_blank" className="btn btn-light rounded-circle shadow-sm">
                              <FaDownload className="text-dark" />
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="col-12">
                        <p className="text-muted small italic">Additional resources will appear here when added by the instructor.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Curriculum Sidebar */}
          {!isSidebarCollapsed && (
            <div className="sidebar-container h-100 bg-white border-start overflow-auto shadow-sm transition-all" style={{ width: '350px' }}>
              <div className="p-3 border-bottom bg-light bg-opacity-50 sticky-top">
                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-layer-group text-primary"></i> Course Content
                </h6>
              </div>
              <div className="curriculum-accordion">
                {modules?.map((module, idx) => (
                  <div key={module._id} className="border-bottom">
                    <button
                      onClick={() => toggleModule(module._id)}
                      className="w-100 p-3 bg-white border-0 text-start d-flex align-items-center justify-content-between shadow-none"
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <div className="fw-bold text-dark extra-small text-uppercase opacity-75">SECTION {idx + 1}</div>
                        <div className="fw-bold text-dark text-truncate">{module.module_title}</div>
                      </div>
                      <i className={`fa-solid fa-chevron-${expandedModules.has(module._id) ? 'up' : 'down'} small text-muted ms-2`}></i>
                    </button>
                    <div className={`collapse ${expandedModules.has(module._id) ? 'show' : ''}`}>
                      <div className="bg-light bg-opacity-25 pb-2">
                        {module.lessons?.map((lesson) => (
                          <button
                            key={lesson._id}
                            onClick={() => {
                              const type = lesson.lesson_type_id?.lesson_type;
                              if ((type === 'pdf' || type === 'ppt') && lesson.file_path) {
                                // window.open(`${api_url.replace('/api', '')}/${lesson.file_path}`, '_blank'); // Don't auto open, select it
                                setSelectedLesson(lesson);
                              } else if (type === 'link' && lesson.video_url) {
                                // window.open(lesson.video_url, '_blank');
                                setSelectedLesson(lesson);
                              } else {
                                setSelectedLesson(lesson);
                              }
                            }}
                            className={`w-100 text-start border-0 py-3 px-3 d-flex align-items-center gap-3 transition-all ${selectedLesson?._id === lesson._id ? 'bg-primary bg-opacity-10 border-start border-primary border-4' : 'bg-transparent'}`}
                          >
                            <div className={`icon-box rounded-circle d-flex align-items-center justify-content-center ${selectedLesson?._id === lesson._id ? 'bg-primary text-white' : 'bg-white border text-muted'}`} style={{ width: '32px', height: '32px' }}>
                              {getLessonIcon(lesson.lesson_type_id?.lesson_type)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className={`fw-medium small text-truncate ${selectedLesson?._id === lesson._id ? 'text-primary fw-bold' : 'text-dark'}`}>{lesson.lesson_title}</div>
                              <div className="extra-small text-muted">{lesson.lesson_duration || '10 min'}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .student-player-layout { font-family: 'Outfit', sans-serif; }
        .extra-small { font-size: 0.65rem; }
        .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .player-container { box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .icon-box { flex-shrink: 0; }
        .hover-shadow:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; transform: translateY(-2px); }
        .sidebar-container { min-width: 350px; }
        @media (max-width: 991.98px) {
          .flex-grow-1 { height: auto !important; }
          .sidebar-container { width: 100% !important; min-width: auto; height: auto !important; border-left: none !important; border-top: 1px solid #eee; }
          .d-flex.h-100 { flex-direction: column; }
        }
      `}</style>

      {showQuizModal && quizIdToTake && (
        <QuizTakingModal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          quizId={quizIdToTake}
          courseId={course_id}
          moduleId={courseData?.modules?.find(m => m.lessons.find(l => l._id === selectedLesson?._id))?._id}
          studentId={user?.user_id} // Pass student ID
        />
      )}
    </div>
  );
};

export default ViewCourse;
