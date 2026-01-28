import React, { useEffect, useState } from "react";
import { FaChevronDown, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import { MdClose, MdDragIndicator, MdPlayCircle, MdDescription, MdQuiz, MdLiveTv, MdAssignment, MdLink, MdFilePresent } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchLessons, updateLessonOrders } from "@/redux/course.slice";
import toast from "react-hot-toast";
import QuizManagementModal from "../quiz/QuizManagementModal";

const LessonAddForm = ({ moduleId, courseId, module, isOpen, onToggle }) => {
  const dispatch = useDispatch();
  const [draggedLesson, setDraggedLesson] = useState(null);
  const [draggedLessonIndex, setDraggedLessonIndex] = useState(null);
  const [draggedOverLessonIndex, setDraggedOverLessonIndex] = useState(null);
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [moduleLessons, setModuleLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [showQuizManagement, setShowQuizManagement] = useState(false);

  const [formData, setFormData] = useState({
    lesson_title: "",
    lesson_description: "",
    lesson_type: "text",
    lesson_duration: "",
    is_downloadable: false,
    is_preview: false,
    file: "",
    live_url: "",
    video_url: "",
    quiz_id: "",
  });

  const [editFormData, setEditFormData] = useState({
    lesson_title: "",
    lesson_description: "",
    lesson_type: "text",
    lesson_duration: "",
    is_downloadable: false,
    is_preview: false,
    file: "",
    live_url: "",
    video_url: "",
    quiz_id: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchModuleLessons();
    }
  }, [isOpen, moduleId]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoadingQuizzes(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/quizzes`,
          {
            params: { course_id: courseId },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setQuizzes(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setIsLoadingQuizzes(false);
      }
    };

    if (courseId) {
      fetchQuizzes();
    }
  }, [courseId]);

  const fetchModuleLessons = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lessons/${moduleId}`,
        {
          withCredentials: true,
        }
      );
      setModuleLessons(response.data.data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setModuleLessons([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleEditFileChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lesson_title || !formData.lesson_description) {
      toast.error("Please fill all the required fields");
      return;
    }

    if (formData.lesson_type === "video") {
      if (!formData.video_url && !formData.file) {
        toast.error("Please provide a video URL or upload a video file");
        return;
      }
    } else if (formData.lesson_type === "link" && !formData.video_url) {
      toast.error(`Please provide a link URL`);
      return;
    }

    if ((formData.lesson_type === "pdf" || formData.lesson_type === "ppt") && !formData.file) {
      toast.error(`Please upload a ${formData.lesson_type.toUpperCase()} file`);
      return;
    }

    if (formData.lesson_type === "live" && !formData.live_url) {
      toast.error("Please provide a Meeting URL");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    // Add upload to youtube flag
    if (formData.lesson_type === 'video' && formData.file) {
      const isYoutubeChecked = document.getElementById('lessonYoutubeUpload')?.checked;
      data.append('upload_to_youtube', isYoutubeChecked ? 'true' : 'false');
    }

    data.append("module_id", moduleId);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/lessons/${moduleId}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        toast.success("Lesson added successfully");
        setFormData({
          lesson_title: "",
          lesson_description: "",
          lesson_type: "text",
          lesson_duration: "",
          is_downloadable: false,
          is_preview: false,
          file: "",
          live_url: "",
          video_url: "",
          quiz_id: "",
        });
        fetchModuleLessons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add lesson");
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!editFormData.lesson_title || !editFormData.lesson_description) {
      toast.error("Please fill all the required fields");
      return;
    }

    const data = new FormData();
    Object.keys(editFormData).forEach((key) => {
      if (editFormData[key] !== null) {
        data.append(key, editFormData[key]);
      }
    });

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/lessons/editlesson/${editingLesson._id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Lesson updated successfully");
        setShowEditModal(false);
        setEditingLesson(null);
        fetchModuleLessons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update lesson");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/lessons/${lessonId}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("Lesson deleted successfully");
        fetchModuleLessons();
      }
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  const handleEditClick = (lesson) => {
    setEditingLesson(lesson);
    setEditFormData({
      lesson_title: lesson.lesson_title,
      lesson_description: lesson.description || lesson.lesson_description,
      lesson_type: lesson.lesson_type_id?.lesson_type || lesson.lesson_type,
      lesson_duration: lesson.lesson_duration,
      is_downloadable: lesson.is_downloadable,
      is_preview: lesson.is_preview,
      video_url: lesson.video_url || "",
      live_url: lesson.live_url || "",
      quiz_id: lesson.quiz_id || "",
    });
    setShowEditModal(true);
  };

  const handleDragStart = (index, e) => {
    setDraggedLessonIndex(index);
    setDraggedLesson(moduleLessons[index]);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (index, e) => {
    e.preventDefault();
    setDraggedOverLessonIndex(index);
  };

  const handleDrop = async (index, e) => {
    e.preventDefault();
    if (draggedLessonIndex === index) return;

    const newLessons = [...moduleLessons];
    const draggedItem = newLessons.splice(draggedLessonIndex, 1)[0];
    newLessons.splice(index, 0, draggedItem);

    setModuleLessons(newLessons);
    setDraggedLessonIndex(null);
    setDraggedOverLessonIndex(null);

    const orders = newLessons.map((lesson, idx) => ({
      lesson_id: lesson._id,
      order: idx + 1,
    }));

    try {
      await dispatch(updateLessonOrders({ moduleId, orders }));
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to update order");
      fetchModuleLessons();
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case "video": return <MdPlayCircle className="text-danger fs-4" />;
      case "pdf": return <MdDescription className="text-primary fs-4" />;
      case "quiz": return <MdQuiz className="text-warning fs-4" />;
      case "live": return <MdLiveTv className="text-info fs-4" />;
      case "assignment": return <MdAssignment className="text-success fs-4" />;
      case "link": return <MdLink className="text-indigo fs-4" />;
      case "ppt": return <MdFilePresent className="text-orange fs-4" />;
      default: return <MdDescription className="text-secondary fs-4" />;
    }
  };

  return (
    <div className="lesson-add-form-wrapper mb-4">
      <div className={`module-accordion-card card border-0 shadow-sm rounded-4 overflow-hidden transition-all ${isOpen ? "ring-2 ring-primary ring-opacity-10" : ""}`}>
        <div
          className={`module-header d-flex align-items-center justify-content-between p-4 cursor-pointer transition-all ${isOpen ? "bg-white border-bottom" : "bg-white hover-bg-light"}`}
          onClick={onToggle}
        >
          <div className="d-flex align-items-center gap-3">
            <div className={`icon-box p-2.5 rounded-3 d-flex align-items-center justify-content-center ${isOpen ? "bg-primary text-white" : "bg-soft-primary text-primary"}`} style={{ width: '42px', height: '42px' }}>
              <i className={`fa-solid ${isOpen ? "fa-folder-open" : "fa-folder"} fs-5`}></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark fs-6">{module.module_title}</h6>
              <div className="d-flex align-items-center gap-2 mt-0.5">
                <span className="text-muted small d-flex align-items-center gap-1">
                  <i className="fa-regular fa-file-lines"></i> {moduleLessons?.length || 0} Lessons
                </span>
                <span className="text-muted small">•</span>
                <span className="text-muted small">{module.module_description?.substring(0, 50)}...</span>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className={`p-2 rounded-circle bg-light transition-all ${isOpen ? "bg-soft-primary text-primary" : "text-muted"}`}>
              <FaChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} size={12} />
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="module-content-body p-4 bg-white">
            <div className="lessons-container d-flex flex-column gap-2 mb-4">
              {moduleLessons && moduleLessons.length > 0 ? (
                moduleLessons.map((lesson, index) => (
                  <div
                    key={lesson._id || index}
                    className={`lesson-item card border-0 shadow-sm rounded-3 overflow-hidden ${draggedLessonIndex === index ? "opacity-50" : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(index, e)}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDrop={(e) => handleDrop(index, e)}
                  >
                    <div className="card-body p-0">
                      <div className="d-flex align-items-center p-3">
                        <div className="drag-handle text-muted me-3 cursor-grab">
                          <MdDragIndicator size={20} />
                        </div>

                        <div className="lesson-type-icon me-3">
                          {getLessonIcon(lesson.lesson_type_id?.lesson_type || lesson.lesson_type)}
                        </div>

                        <div className="flex-grow-1 cursor-pointer" onClick={() => setExpandedLessonId(expandedLessonId === lesson._id ? null : lesson._id)}>
                          <h6 className="mb-0 fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                            {lesson.lesson_title}
                            {lesson.is_preview && <span className="badge bg-soft-info text-info small py-1" style={{ fontSize: '0.65rem' }}>PREVIEW</span>}
                          </h6>
                          <div className="d-flex align-items-center gap-3 mt-1">
                          </div>
                        </div>

                        <div className="lesson-actions d-flex align-items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditClick(lesson); }}
                            className="btn btn-sm btn-outline-primary border-0 p-2 rounded-circle"
                            title="Edit Lesson"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson._id); }}
                            className="btn btn-sm btn-outline-danger border-0 p-2 rounded-circle"
                            title="Delete Lesson"
                          >
                            <FaTrash size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0 p-2 rounded-circle"
                            onClick={() => setExpandedLessonId(expandedLessonId === lesson._id ? null : lesson._id)}
                          >
                            <FaChevronDown className={`transition-all ${expandedLessonId === lesson._id ? "rotate-180" : ""}`} size={12} />
                          </button>
                        </div>
                      </div>

                      {expandedLessonId === lesson._id && (
                        <div className="lesson-details border-top bg-light bg-opacity-25 p-4">
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="small fw-bold text-muted text-uppercase mb-1">Description</label>
                              <p className="small mb-0 text-dark">{lesson.description || lesson.lesson_description || "No description provided."}</p>
                            </div>
                            {(lesson.video_url || lesson.file_path || lesson.live_url) && (
                              <div className="col-12 mt-2">
                                <div className="p-3 border-0 rounded-3 bg-white small shadow-sm d-flex align-items-center justify-content-between">
                                  <div className="d-flex align-items-center gap-3">
                                    {lesson.lesson_type_id?.lesson_type === "video" && <i className="fa-brands fa-youtube text-danger fs-5"></i>}
                                    {lesson.lesson_type_id?.lesson_type === "link" && <i className="fa-solid fa-link text-primary fs-5"></i>}
                                    {lesson.lesson_type_id?.lesson_type === "pdf" && <i className="fa-solid fa-file-pdf text-danger fs-5"></i>}
                                    {lesson.lesson_type_id?.lesson_type === "ppt" && <i className="fa-solid fa-file-powerpoint text-orange fs-5"></i>}
                                    {lesson.lesson_type_id?.lesson_type === "live" && <i className="fa-solid fa-video text-info fs-5"></i>}
                                    <span className="text-truncate fw-medium" style={{ maxWidth: '300px' }}>
                                      {lesson.video_url || lesson.file_path?.split('\\').pop()?.split('/').pop() || lesson.live_url}
                                    </span>
                                  </div>
                                  {(lesson.lesson_type_id?.lesson_type === "pdf" || lesson.lesson_type_id?.lesson_type === "ppt" || lesson.lesson_type_id?.lesson_type === "link") && (
                                    <a
                                      href={lesson.file_path ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${lesson.file_path}` : lesson.video_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-soft-primary fw-bold text-decoration-none px-3"
                                    >
                                      Open in New Tab <i className="fa-solid fa-arrow-up-right-from-square ms-1 small"></i>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 border-2 border-dashed rounded-4 bg-white opacity-75">
                  <i className="fa-solid fa-layer-group text-muted mb-2 d-block fs-3"></i>
                  <h6 className="fw-bold text-dark mb-1">Empty Module</h6>
                  <p className="text-muted small mb-0">No lessons added yet.</p>
                </div>
              )}
            </div>

            <div className="add-lesson-section border-top pt-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <div className="bg-soft-primary p-2 rounded-2 text-primary small"><FaPlus /></div>
                  Add New Content
                </h6>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm px-3 fw-bold rounded-3"
                  onClick={() => setShowQuizManagement(true)}
                >
                  <MdQuiz className="me-2" /> Manage Quizzes
                </button>
              </div>

              <div className="p-4 rounded-4 bg-light border-0">
                <form onSubmit={handleSubmit} className="row g-4">
                  <div className="col-lg-7">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-2">Lesson Title</label>
                      <input
                        className="form-control border-light shadow-sm"
                        type="text"
                        name="lesson_title"
                        placeholder="e.g. History of the Sicilian Defense"
                        value={formData.lesson_title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-0">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-2">Description</label>
                      <textarea
                        className="form-control border-light shadow-sm"
                        name="lesson_description"
                        rows="3"
                        placeholder="What will students learn in this lesson..."
                        value={formData.lesson_description}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                      <div className="card-body p-4 bg-white">
                        <div className="mb-3">
                          <label className="form-label small fw-bold text-muted text-uppercase mb-2">Content Type</label>
                          <div className="d-flex flex-wrap gap-2">
                            {['text', 'video', 'pdf', 'ppt', 'link', 'quiz', 'live'].map(type => (
                              <button
                                key={type}
                                type="button"
                                className={`btn btn-sm px-3 py-2 rounded-pill fw-bold text-capitalize ${formData.lesson_type === type ? "btn-primary shadow-sm" : "btn-light border"}`}
                                onClick={() => setFormData({ ...formData, lesson_type: type })}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Content Fields based on Type */}
                        <div className="mb-4">
                          {formData.lesson_type === "video" && (
                            <div className="card shadow-sm border-0 bg-light p-3 rounded-4">
                              <div className="row g-3">
                                <div className="col-12">
                                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">
                                    <i className="fa-solid fa-cloud-arrow-up me-2"></i>Upload Video Recording
                                  </label>
                                  <div className="input-group">
                                    <input
                                      type="file"
                                      className="form-control border-end-0"
                                      name="file"
                                      accept="video/*"
                                      onChange={handleFileChange}
                                    />
                                    <span className="input-group-text bg-white border-start-0 text-muted">
                                      <i className="fa-solid fa-video"></i>
                                    </span>
                                  </div>
                                  <div className="mt-2 d-flex align-items-center justify-content-between">
                                    <div className="form-text extra-small">Max file size: 500MB.</div>
                                    <div className="form-check form-switch mb-0">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="lessonYoutubeUpload"
                                        style={{ transform: 'scale(0.8)', cursor: 'pointer' }}
                                      />
                                      <label className="form-check-label extra-small text-muted fw-bold" htmlFor="lessonYoutubeUpload">
                                        <i className="fa-brands fa-youtube text-danger me-1"></i> UPLOAD TO YOUTUBE
                                      </label>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12 position-relative my-2 text-center">
                                  <hr className="opacity-10" />
                                  <span className="position-absolute top-50 start-50 translate-middle bg-light px-3 small fw-bold text-muted">OR</span>
                                </div>
                                <div className="col-12">
                                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">
                                    <i className="fa-brands fa-youtube me-2"></i>Video Link (YouTube/Vimeo)
                                  </label>
                                  <input
                                    type="url"
                                    className="form-control rounded-3"
                                    name="video_url"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={formData.video_url}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {formData.lesson_type === "text" && (
                            <div>
                              <label className="form-label small fw-bold text-muted text-uppercase mb-2">Text Content</label>
                              <textarea
                                className="form-control rounded-3"
                                rows="5"
                                name="lesson_description"
                                placeholder="Enter lesson details, notes, or instructions..."
                                value={formData.lesson_description}
                                onChange={handleChange}
                                required
                              ></textarea>
                            </div>
                          )}
                          {(formData.lesson_type === "pdf" ||
                            formData.lesson_type === "ppt") && (
                              <div>
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">
                                  {formData.lesson_type.toUpperCase()} DOCUMENT
                                </label>
                                <div className="input-group">
                                  <input
                                    type="file"
                                    className="form-control border-end-0"
                                    name="file"
                                    accept={
                                      formData.lesson_type === "pdf"
                                        ? ".pdf"
                                        : ".ppt, .pptx"
                                    }
                                    onChange={handleFileChange}
                                  />
                                  <span className="input-group-text bg-white border-start-0 text-muted">
                                    <i className={`fa-solid ${formData.lesson_type === 'pdf' ? 'fa-file-pdf' : 'fa-file-powerpoint'}`}></i>
                                  </span>
                                </div>
                              </div>
                            )}
                          {formData.lesson_type === "link" && (
                            <div>
                              <label className="form-label small fw-bold text-muted text-uppercase mb-2">External Link URL</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light text-muted"><i className="fa-solid fa-link"></i></span>
                                <input
                                  type="url"
                                  className="form-control"
                                  name="video_url"
                                  placeholder="https://example.com/resource"
                                  value={formData.video_url}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          )}
                          {formData.lesson_type === "live" && (
                            <div>
                              <label className="form-label small fw-bold text-muted text-uppercase mb-2">Live Session Link</label>
                              <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-soft-primary border-0 text-primary">
                                  <i className="fa-solid fa-video"></i>
                                </span>
                                <input
                                  type="url"
                                  className="form-control border-0 py-2"
                                  name="live_url"
                                  placeholder="Zoom, Google Meet, or Dyte link..."
                                  value={formData.live_url}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          )}
                          {formData.lesson_type === "quiz" && (
                            <div className="card border-primary border-dashed bg-soft-primary p-4 rounded-4 text-center">
                              <i className="fa-solid fa-circle-question text-primary mb-2 shadow-sm" style={{ fontSize: '2rem' }}></i>
                              <h6 className="fw-bold text-primary">Self-Assessment Quiz</h6>
                              <p className="small text-muted mb-3 mx-auto" style={{ maxWidth: '300px' }}>
                                Test student understanding with a structured quiz. Quizzes are managed independently.
                              </p>
                              <label className="form-label small fw-bold text-muted text-uppercase mb-2 d-block">Select Existing Quiz</label>
                              <select
                                className="form-select border-primary border-opacity-25 rounded-3 mb-3"
                                name="quiz_id"
                                value={formData.quiz_id}
                                onChange={handleChange}
                              >
                                <option value="">Choose a quiz...</option>
                                {quizzes.map((q) => (
                                  <option key={q._id} value={q._id}>
                                    {q.quiz_title}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="btn btn-primary fw-bold rounded-pill px-4 shadow-sm"
                                onClick={() => setShowQuizManagement(true)}
                              >
                                <i className="fa-solid fa-plus-circle me-2"></i>Manage Quizzes
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="col-12 d-flex align-items-end">
                          <div className="form-check form-switch mb-2">
                            <input className="form-check-input" type="checkbox" name="is_preview" checked={formData.is_preview} onChange={handleChange} />
                            <label className="form-check-label small fw-bold text-muted">Free Preview</label>
                          </div>
                        </div>


                        <div className="content-specific-input bg-light p-3 rounded-3 border-0">
                          {(formData.lesson_type === "link" || formData.lesson_type === "video") && (
                            <input className="form-control form-control-sm bg-white" type="text" name="video_url" placeholder={formData.lesson_type === "link" ? "Enter External Link URL" : "Paste YouTube Link"} value={formData.video_url} onChange={handleChange} />
                          )}
                          {(formData.lesson_type === "pdf" || formData.lesson_type === "ppt") && (
                            <input className="form-control form-control-sm bg-white" type="file" name="file" accept={formData.lesson_type === "pdf" ? "application/pdf" : ".ppt,.pptx"} onChange={handleFileChange} />
                          )}
                          {formData.lesson_type === "quiz" && (
                            <select name="quiz_id" className="form-select form-select-sm bg-white" value={formData.quiz_id} onChange={handleChange}>
                              <option value="">-- Choose Quiz --</option>
                              {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
                            </select>
                          )}
                          {formData.lesson_type === "live" && (
                            <input className="form-control form-control-sm bg-white" type="text" name="live_url" placeholder="Zoom/Meeting Link" value={formData.live_url} onChange={handleChange} />
                          )}
                          {formData.lesson_type === "text" && (
                            <div className="small text-muted fst-italic">Text description will be the lesson content.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 d-flex justify-content-end mt-4">
                    <button type="button" className="btn btn-link text-muted me-3 fw-bold text-decoration-none" onClick={() => setFormData({ ...formData, lesson_title: "", lesson_description: "" })}>Clear</button>
                    <button type="submit" className="btn btn-primary px-5 py-2.5 fw-bold rounded-3 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Create Lesson</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
        }
      </div >

      {/* Edit Lesson Modal */}
      {
        showEditModal && (
          <div className="modal-overlay d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 2100 }}>
            <div className="modal-dialog modal-lg w-100 animate-pop-in" style={{ maxWidth: '700px' }}>
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-soft-primary p-2 rounded-3 text-primary"><FaEdit /></div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Edit Lesson Details</h5>
                  </div>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body p-4 bg-white">
                  <form onSubmit={handleUpdateLesson} className="row g-4">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-2">Lesson Title</label>
                        <input className="form-control form-control-lg fs-6 border rounded-3" type="text" name="lesson_title" value={editFormData.lesson_title} onChange={handleEditChange} required />
                      </div>
                      <div className="mb-0">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-2">Description</label>
                        <textarea className="form-control border rounded-3" name="lesson_description" rows="4" value={editFormData.lesson_description} onChange={handleEditChange} required />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card bg-light border-0 rounded-4 h-100 p-3">
                        <div className="mb-3">
                          <label className="form-label small fw-bold text-muted text-uppercase mb-2">Settings</label>
                          <div className="mb-3">
                            <label className="small fw-medium text-dark mb-1">Type</label>
                            <select name="lesson_type" className="form-select form-select-sm" value={editFormData.lesson_type} onChange={handleEditChange}>
                              <option value="text">Text / Article</option>
                              <option value="video">Video</option>
                              <option value="pdf">PDF File</option>
                              <option value="ppt">PowerPoint (PPT)</option>
                              <option value="quiz">Quiz</option>
                              <option value="live">Live Class</option>
                              <option value="link">External Link</option>
                            </select>
                          </div>
                          <div className="form-check form-switch mt-3">
                            <input className="form-check-input" type="checkbox" name="is_preview" checked={editFormData.is_preview} onChange={handleEditChange} />
                            <label className="form-check-label small fw-bold text-muted">Free Preview</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="p-3 bg-soft-primary rounded-3 border-0">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-2">Content Source</label>
                        {(editFormData.lesson_type === "video" || editFormData.lesson_type === "link") && (
                          <div className="input-group">
                            <span className="input-group-text bg-white border-0"><i className={editFormData.lesson_type === "link" ? "fa-solid fa-link text-primary" : "fa-brands fa-youtube text-danger"}></i></span>
                            <input className="form-control border-0 shadow-none ps-0" type="text" name="video_url" placeholder={editFormData.lesson_type === "link" ? "External Link URL" : "YouTube URL"} value={editFormData.video_url} onChange={handleEditChange} />
                          </div>
                        )}
                        {editFormData.lesson_type === "quiz" && (
                          <select name="quiz_id" className="form-select border-0 shadow-none" value={editFormData.quiz_id} onChange={handleEditChange}>
                            <option value="">-- Select Quiz --</option>
                            {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
                          </select>
                        )}
                        {editFormData.lesson_type === "pdf" && (
                          <div className="small text-muted mb-2 fst-italic">Note: You can upload a new PDF if needed.</div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 d-flex gap-2 justify-content-end mt-4">
                      <button type="button" className="btn btn-light px-4 fw-bold" onClick={() => setShowEditModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary px-5 fw-bold rounded-3 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}


      <style>{`
        .lesson-add-form-wrapper { font-family: 'Outfit', sans-serif; }
        .rotate-180 { transform: rotate(180deg); }
        .bg-soft-primary { background: #eef2ff !important; }
        .hover-bg-light:hover { background-color: #f8fafc; }
        .cursor-grab { cursor: grab; }
        .transition-transform { transition: transform 0.3s ease; }
        .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .ring-2 { box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2); }
        @keyframes popIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .lesson-item {
          transition: all 0.2s ease;
        }
        .lesson-item:hover {
          transform: translateX(4px);
          background-color: #f8fafc !important;
        }
      `}</style>

      {/* Quiz Management Modal */}
      <QuizManagementModal
        isOpen={showQuizManagement}
        onClose={() => {
          setShowQuizManagement(false);
          // Refresh quizzes list after closing
          if (courseId) {
            axios.get(`${import.meta.env.VITE_API_URL}/quizzes`, {
              params: { course_id: courseId, module_id: moduleId },
              withCredentials: true,
            })
              .then(response => {
                if (response.data.success) {
                  setQuizzes(response.data.data || []);
                }
              })
              .catch(error => console.error("Error refreshing quizzes:", error));
          }
        }}
        courseId={courseId}
        moduleId={moduleId}
        courseName={module.course_title || "Course"}
        moduleName={module.module_title}
      />
    </div >
  );
};

export default LessonAddForm;