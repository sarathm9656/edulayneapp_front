import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown, FaEdit, FaTrash, FaPlus, FaGripLines, FaRobot, FaRocket } from "react-icons/fa";
import axios from "axios";
import { MdClose, MdDragIndicator, MdPlayCircle, MdDescription, MdQuiz, MdLiveTv, MdAssignment, MdLink, MdFilePresent, MdCalendarToday, MdOutlineAddCircleOutline, MdAutoStories } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchLessons, updateLessonOrders } from "@/redux/course.slice";
import toast from "react-hot-toast";
import QuizManagementModal from "../quiz/QuizManagementModal";

const LessonAddForm = ({ moduleId, courseId, module, isOpen, onToggle, onModuleChanged }) => {
  const dispatch = useDispatch();
  const [draggedLesson, setDraggedLesson] = useState(null);
  const [draggedLessonIndex, setDraggedLessonIndex] = useState(null);
  const [draggedOverLessonIndex, setDraggedOverLessonIndex] = useState(null);
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showEditModuleModal, setShowEditModuleModal] = useState(false);
  const [moduleEditLoading, setModuleEditLoading] = useState(false);
  const [moduleEditData, setModuleEditData] = useState({
    module_title: "",
    module_description: "",
  });
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

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

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
        toast.success("Lesson successfully integrated!");
        setFormData({
          lesson_title: "",
          lesson_description: "",
          lesson_type: "text",
          lesson_duration: "",
          is_downloadable: false,
          is_preview: false,
          file: "",
          video_url: "",
          quiz_id: "",
        });
        fetchModuleLessons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Integration failed");
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Always send required fields + booleans; only send file if it's a real File
    data.append("lesson_title", editFormData.lesson_title || "");
    data.append("lesson_description", editFormData.lesson_description || "");
    data.append("lesson_type", editFormData.lesson_type || "");
    data.append("lesson_duration", editFormData.lesson_duration ?? "");
    data.append("is_downloadable", String(!!editFormData.is_downloadable));
    data.append("is_preview", String(!!editFormData.is_preview));
    data.append("video_url", editFormData.video_url ?? "");
    data.append("quiz_id", editFormData.quiz_id ?? "");

    if (editFormData.file instanceof File) {
      data.append("file", editFormData.file);
    }

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
        toast.success("Lesson updated");
        setShowEditModal(false);
        setEditingLesson(null);
        fetchModuleLessons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/lessons/${lessonId}`, { withCredentials: true });
      toast.success("Content removed");
      fetchModuleLessons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Removal failed");
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
      quiz_id: lesson.quiz_id || "",
    });
    setShowEditModal(true);
  };

  const handleDragStart = (index, e) => {
    setDraggedLessonIndex(index);
    setDraggedLesson(moduleLessons[index]);
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

    const lessons = newLessons.map((lesson, idx) => ({
      _id: lesson._id,
      display_order: idx + 1,
    }));

    try {
      await dispatch(updateLessonOrders({ moduleId, lessons })).unwrap();
      toast.success("Architecture updated");
    } catch (error) {
      toast.error("Reorder failed");
      fetchModuleLessons();
    }
  };

  const handleOpenEditModule = (e) => {
    e?.stopPropagation?.();
    setModuleEditData({
      module_title: module?.module_title || "",
      module_description: module?.module_description || "",
    });
    setShowEditModuleModal(true);
  };

  const handleModuleEditChange = (e) => {
    const { name, value } = e.target;
    setModuleEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    try {
      setModuleEditLoading(true);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/modules/${moduleId}`,
        {
          module_title: moduleEditData.module_title,
          module_description: moduleEditData.module_description,
        },
        { withCredentials: true }
      );
      toast.success("Section updated");
      setShowEditModuleModal(false);
      onModuleChanged?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update section");
    } finally {
      setModuleEditLoading(false);
    }
  };

  const handleDeleteModule = async (e) => {
    e?.stopPropagation?.();
    if (!window.confirm("Delete this section and all its lessons?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/modules/${moduleId}`, {
        withCredentials: true,
      });
      toast.success("Section deleted");
      onModuleChanged?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete section");
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case "video": return <MdPlayCircle className="icon-red" />;
      case "pdf": return <MdDescription className="icon-blue" />;
      case "quiz": return <MdQuiz className="icon-gold" />;
      case "assignment": return <MdAssignment className="icon-green" />;
      case "link": return <MdLink className="icon-indigo" />;
      case "ppt": return <MdFilePresent className="icon-orange" />;
      default: return <MdDescription className="icon-gray" />;
    }
  };

  return (
    <div className="lesson-form-v2-container">
      <div className={`module-premium-card ${isOpen ? 'is-active' : ''}`}>
        {/* Module Header */}
        <div className="module-trigger-v2" onClick={onToggle}>
          <div className="trigger-left">
            <div className={`module-icon-orb ${isOpen ? 'active' : ''}`}>
              <MdAutoStories />
            </div>
            <div className="module-info-v2">
              <h6 className="title">{module.module_title}</h6>
              <div className="subtitle">
                <span className="count"><MdDescription /> {moduleLessons?.length || 0} Assets</span>
                <span className="dot"></span>
                <span className="desc">{module.module_description}</span>
              </div>
            </div>
          </div>
          <div className="trigger-right">
            <div className="module-actions">
              <button className="module-action-btn edit" onClick={handleOpenEditModule} title="Edit section">
                <FaEdit />
              </button>
              <button className="module-action-btn delete" onClick={handleDeleteModule} title="Delete section">
                <FaTrash />
              </button>
            </div>
            <div className="chevron-box">
              <FaChevronDown className={isOpen ? 'rotated' : ''} />
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isOpen && (
          <div className="module-body-v2 animate-slide-down">
            {/* Action Bar */}
            <div className="content-toolbar mb-4">
              <div className="toolbar-label">Curriculum Registry</div>
              <button className="btn-manage-quizzes" onClick={() => setShowQuizManagement(true)}>
                <MdQuiz /> Assessment Studio
              </button>
            </div>

            {/* Lesson List */}
            <div className="lesson-stack-v2">
              {moduleLessons && moduleLessons.length > 0 ? (
                moduleLessons.map((lesson, index) => (
                  <div
                    key={lesson._id || index}
                    className={`lesson-card-v2 ${draggedLessonIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(index, e)}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDrop={(e) => handleDrop(index, e)}
                  >
                    <div className="card-top">
                      <div className="drag-handle-v2"><MdDragIndicator /></div>
                      <div className="lesson-icon-v2">{getLessonIcon(lesson.lesson_type_id?.lesson_type || lesson.lesson_type)}</div>
                      <div className="lesson-main-info" onClick={() => setExpandedLessonId(expandedLessonId === lesson._id ? null : lesson._id)}>
                        <div className="l-title">
                          {lesson.lesson_title}
                          {lesson.is_preview && <span className="p-badge">PREVIEW</span>}
                        </div>
                        <div className="l-meta">Type: <span className="text-capitalize">{lesson.lesson_type_id?.lesson_type || lesson.lesson_type}</span></div>
                      </div>
                      <div className="lesson-ops">
                        <button className="op-btn edit" onClick={() => handleEditClick(lesson)}><FaEdit /></button>
                        <button className="op-btn delete" onClick={() => handleDeleteLesson(lesson._id)}><FaTrash /></button>
                        <button className="op-btn toggle" onClick={() => setExpandedLessonId(expandedLessonId === lesson._id ? null : lesson._id)}>
                          <FaChevronDown className={expandedLessonId === lesson._id ? 'rotated' : ''} />
                        </button>
                      </div>
                    </div>
                    {expandedLessonId === lesson._id && (
                      <div className="card-details animate-slide-down">
                        <div className="details-grid">
                          <div className="detail-item full">
                            <label>Objective</label>
                            <p>{lesson.description || lesson.lesson_description}</p>
                          </div>
                          {(lesson.video_url || lesson.file_path) && (
                            <div className="detail-item full">
                              <label>Attached Source</label>
                              <div className="source-link-box">
                                <span className="s-link text-truncate">
                                  {lesson.video_url || lesson.file_path?.replace(/\\/g, "/")?.split("/")?.pop()}
                                </span>
                                <a
                                  href={
                                    lesson.file_path
                                      ? `${import.meta.env.VITE_API_URL}/${String(lesson.file_path)
                                        .replace(/\\/g, "/")
                                        .replace(/^\/+/, "")}`
                                      : lesson.video_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="s-action"
                                >
                                  Access Resource
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-catalog-v2">
                  <div className="empty-icon-v2"><MdOutlineAddCircleOutline /></div>
                  <h6>No Content Mapped</h6>
                  <p>Begin by adding your first instructional asset below.</p>
                </div>
              )}
            </div>

            {/* Builder Interface */}
            <div className="builder-v2-container mt-5">
              <div className="builder-header-v2">
                <div className="b-icon"><FaPlus /></div>
                <div className="b-text">Content Integration Builder</div>
              </div>
              <form onSubmit={handleSubmit} className="builder-form-v2">
                <div className="row g-4">
                  <div className="col-lg-12">
                    <label className="builder-label-v2">Instructional Title *</label>
                    <input
                      className="builder-input-v2"
                      name="lesson_title"
                      placeholder="e.g. Mastering Advanced Maneuvers"
                      value={formData.lesson_title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-lg-12">
                    <label className="builder-label-v2">Description & Context *</label>
                    <textarea
                      className="builder-input-v2"
                      name="lesson_description"
                      rows="3"
                      placeholder="Detailed breakdown of the learning outcome..."
                      value={formData.lesson_description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <label className="builder-label-v2 mb-3">Asset Type Selection</label>
                    <div className="type-selector-v2">
                      {['video', 'pdf', 'ppt', 'link', 'quiz'].map(type => (
                        <button
                          key={type}
                          type="button"
                          className={`type-btn-v2 ${formData.lesson_type === type ? 'active' : ''}`}
                          onClick={() => setFormData({ ...formData, lesson_type: type })}
                        >
                          <span className="t-icon">{getLessonIcon(type)}</span>
                          <span className="t-label text-capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contextual Inputs */}
                  <div className="col-12 mt-3">
                    <div className="context-input-area-v2">
                      {formData.lesson_type === 'video' && (
                        <div className="video-options-v2">
                          <div className="v-option-card">
                            <label>Upload High-Res Video</label>
                            <input type="file" className="form-control-minimal" name="file" accept="video/*" onChange={handleFileChange} />
                            <div className="yt-sync mt-3">
                              <div className="form-check form-switch d-flex align-items-center gap-2">
                                <input className="form-check-input" type="checkbox" id="lessonYoutubeUpload" />
                                <label className="form-check-label extra-small fw-bold text-muted" htmlFor="lessonYoutubeUpload">SYNC TO YOUTUBE ENGINE</label>
                              </div>
                            </div>
                          </div>
                          <div className="v-divider">OR</div>
                          <div className="v-option-card">
                            <label>External Stream (YT/Vimeo)</label>
                            <input type="url" className="form-control-minimal" name="video_url" placeholder="Paste URL here..." value={formData.video_url} onChange={handleChange} />
                          </div>
                        </div>
                      )}
                      {formData.lesson_type === 'quiz' && (
                        <div className="quiz-selector-card">
                          <label>Assigned Assessment</label>
                          <select name="quiz_id" className="form-select-minimal" value={formData.quiz_id} onChange={handleChange}>
                            <option value="">-- Link an Assessment --</option>
                            {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
                          </select>
                          <p className="mt-2 small text-muted">Link a quiz from your Assessment Studio registry.</p>
                        </div>
                      )}
                      {(formData.lesson_type === 'pdf' || formData.lesson_type === 'ppt') && (
                        <div className="file-upload-card-v2">
                          <label>Attach {formData.lesson_type.toUpperCase()} Material</label>
                          <input type="file" className="form-control-minimal" name="file" accept={formData.lesson_type === 'pdf' ? '.pdf' : '.ppt,.pptx'} onChange={handleFileChange} />
                        </div>
                      )}
                      {formData.lesson_type === 'link' && (
                        <div className="link-input-card">
                          <label>External URL</label>
                          <input type="url" className="form-control-minimal" name="video_url" placeholder="https://..." value={formData.video_url} onChange={handleChange} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 mt-4 d-flex justify-content-between align-items-center">
                    <div className="form-check form-switch px-0 d-flex align-items-center gap-3">
                      <input className="form-check-input m-0" type="checkbox" name="is_preview" checked={formData.is_preview} onChange={handleChange} style={{ width: '40px', height: '20px' }} />
                      <label className="small fw-bold text-muted">ENABLE FREE PREVIEW</label>
                    </div>
                    <div className="d-flex gap-3">
                      <button type="button" className="btn-cancel-v2" onClick={() => setFormData({ ...formData, lesson_title: '', lesson_description: '' })}>Reset</button>
                      <button type="submit" className="btn-submit-v2 shadow-glow-sm">Integrate Content</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal - Premium Redesign */}
      {showEditModal && createPortal(
        <div className="premium-modal-overlay">
          <div className="modal-content-premium animate-pop-in">
            <div className="modal-header-v2">
              <h5>Edit Content Module</h5>
              <button onClick={() => setShowEditModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body-v2">
              <form onSubmit={handleUpdateLesson} className="row g-4">
                <div className="col-md-12">
                  <label className="builder-label-v2">Lesson Title</label>
                  <input className="builder-input-v2" type="text" name="lesson_title" value={editFormData.lesson_title} onChange={handleEditChange} required />
                </div>
                <div className="col-md-12">
                  <label className="builder-label-v2">Description</label>
                  <textarea className="builder-input-v2" name="lesson_description" rows="3" value={editFormData.lesson_description} onChange={handleEditChange} required />
                </div>

                <div className="col-md-6">
                  <label className="builder-label-v2">Type</label>
                  <select className="builder-input-v2" name="lesson_type" value={editFormData.lesson_type} onChange={handleEditChange}>
                    {["text", "video", "pdf", "ppt", "quiz", "link", "assignment"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="builder-label-v2">Duration (minutes)</label>
                  <input className="builder-input-v2" type="number" min="0" name="lesson_duration" value={editFormData.lesson_duration} onChange={handleEditChange} />
                </div>

                {editFormData.lesson_type === "video" && (
                  <div className="col-12">
                    <label className="builder-label-v2">Video URL (optional)</label>
                    <input className="builder-input-v2" type="url" name="video_url" value={editFormData.video_url} onChange={handleEditChange} placeholder="https://..." />
                    <div className="mt-3">
                      <label className="builder-label-v2">Replace Video File (optional)</label>
                      <input type="file" className="builder-input-v2" name="file" accept="video/*" onChange={handleEditFileChange} />
                    </div>
                  </div>
                )}

                {(editFormData.lesson_type === "pdf" || editFormData.lesson_type === "ppt") && (
                  <div className="col-12">
                    <label className="builder-label-v2">Replace File (optional)</label>
                    <input
                      type="file"
                      className="builder-input-v2"
                      name="file"
                      accept={editFormData.lesson_type === "pdf" ? ".pdf" : ".ppt,.pptx"}
                      onChange={handleEditFileChange}
                    />
                  </div>
                )}

                {editFormData.lesson_type === "link" && (
                  <div className="col-12">
                    <label className="builder-label-v2">External URL</label>
                    <input className="builder-input-v2" type="url" name="video_url" value={editFormData.video_url} onChange={handleEditChange} placeholder="https://..." />
                  </div>
                )}

                {editFormData.lesson_type === "quiz" && (
                  <div className="col-12">
                    <label className="builder-label-v2">Assigned Assessment</label>
                    <select name="quiz_id" className="builder-input-v2" value={editFormData.quiz_id} onChange={handleEditChange}>
                      <option value="">-- None --</option>
                      {quizzes.map((q) => (
                        <option key={q._id} value={q._id}>{q.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="col-12 d-flex gap-4">
                  <div className="form-check form-switch px-0 d-flex align-items-center gap-2">
                    <input className="form-check-input m-0" type="checkbox" name="is_preview" checked={!!editFormData.is_preview} onChange={handleEditChange} />
                    <label className="small fw-bold text-muted">PREVIEW</label>
                  </div>
                  <div className="form-check form-switch px-0 d-flex align-items-center gap-2">
                    <input className="form-check-input m-0" type="checkbox" name="is_downloadable" checked={!!editFormData.is_downloadable} onChange={handleEditChange} />
                    <label className="small fw-bold text-muted">DOWNLOADABLE</label>
                  </div>
                </div>

                <div className="col-md-12 d-flex justify-content-end gap-3 mt-4">
                  <button type="button" className="btn-cancel-v2" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit-v2">Apply Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Section Modal */}
      {showEditModuleModal && createPortal(
        <div className="premium-modal-overlay">
          <div className="modal-content-premium animate-pop-in">
            <div className="modal-header-v2">
              <h5>Edit Section</h5>
              <button onClick={() => setShowEditModuleModal(false)} disabled={moduleEditLoading}>
                <MdClose />
              </button>
            </div>
            <div className="modal-body-v2">
              <form onSubmit={handleUpdateModule} className="row g-4">
                <div className="col-12">
                  <label className="builder-label-v2">Section Title</label>
                  <input
                    className="builder-input-v2"
                    type="text"
                    name="module_title"
                    value={moduleEditData.module_title}
                    onChange={handleModuleEditChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="builder-label-v2">Learning Objective</label>
                  <textarea
                    className="builder-input-v2"
                    name="module_description"
                    rows="3"
                    value={moduleEditData.module_description}
                    onChange={handleModuleEditChange}
                    required
                  />
                </div>
                <div className="col-12 d-flex justify-content-end gap-3 mt-4">
                  <button
                    type="button"
                    className="btn-cancel-v2"
                    onClick={() => setShowEditModuleModal(false)}
                    disabled={moduleEditLoading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit-v2 shadow-glow-sm" disabled={moduleEditLoading}>
                    {moduleEditLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Quiz Modal Integration */}
      <QuizManagementModal
        isOpen={showQuizManagement}
        onClose={() => setShowQuizManagement(false)}
        courseId={courseId}
        moduleId={moduleId}
        courseName={module.course_title} // Assuming passing down
        moduleName={module.module_title}
      />

      <style>{`
        .lesson-form-v2-container { font-family: 'Outfit', sans-serif; }
        
        .module-premium-card {
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 1.5rem;
        }
        .module-premium-card.is-active {
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
            border-color: rgba(79, 70, 229, 0.1);
        }

        .module-trigger-v2 {
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.2s;
        }
        .module-trigger-v2:hover { background: #fcfdfe; }
        
        .trigger-left { display: flex; align-items: center; gap: 1.25rem; }
        .module-icon-orb {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.3s;
        }
        .module-icon-orb.active { background: #4f46e5; color: white; transform: rotate(10deg); }
        
        .module-info-v2 .title { font-weight: 800; color: #1e293b; margin: 0; font-size: 1.1rem; }
        .module-info-v2 .subtitle { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
        .module-info-v2 .count { font-weight: 700; color: #4f46e5; font-size: 0.75rem; display: flex; align-items: center; gap: 4px; }
        .module-info-v2 .dot { width: 4px; height: 4px; background: #cbd5e1; border-radius: 50%; }
        .module-info-v2 .desc { color: #94a3b8; font-size: 0.75rem; font-weight: 500; }
        
        .chevron-box { color: #94a3b8; transition: transform 0.3s; }
        .rotated { transform: rotate(180deg); }

        .trigger-right { display: flex; align-items: center; gap: 10px; }
        .module-actions { display: flex; gap: 8px; }
        .module-action-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
        }
        .module-action-btn.edit { background: #eff6ff; color: #2563eb; }
        .module-action-btn.delete { background: #fef2f2; color: #ef4444; }
        .module-action-btn:hover { transform: translateY(-1px); }

        .module-body-v2 { padding: 0 2rem 2rem 2rem; border-top: 1px solid #f1f5f9; background: white; }
        
        .content-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0 1rem; }
        .toolbar-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
        
        .btn-manage-quizzes {
          background: #f5f3ff;
          color: #7c3aed;
          border: 1px solid #ddd6fe;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-manage-quizzes:hover { background: #7c3aed; color: white; }

        /* Lesson Cards */
        .lesson-stack-v2 { display: flex; flex-direction: column; gap: 12px; }
        .lesson-card-v2 {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          transition: all 0.2s;
        }
        .lesson-card-v2.dragging { opacity: 0.4; transform: scale(0.98); }
        .lesson-card-v2 .card-top { padding: 1rem; display: flex; align-items: center; gap: 12px; }
        .drag-handle-v2 { color: #cbd5e1; cursor: grab; font-size: 20px; }
        .lesson-icon-v2 { font-size: 24px; display: flex; align-items: center; }
        .lesson-main-info { flex: 1; cursor: pointer; }
        .l-title { font-weight: 700; color: #1e293b; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
        .p-badge { background: #dcfce7; color: #15803d; font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
        .l-meta { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
        
        .lesson-ops { display: flex; gap: 8px; }
        .op-btn { width: 34px; height: 34px; border-radius: 10px; border: none; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.2s; }
        .op-btn.edit { background: #eff6ff; color: #2563eb; }
        .op-btn.delete { background: #fef2f2; color: #ef4444; }
        .op-btn.toggle { background: white; color: #94a3b8; border: 1px solid #e2e8f0; }
        .op-btn:hover { transform: scale(1.1); }

        .card-details { padding: 0 1.5rem 1.5rem 4rem; }
        .details-grid { background: white; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; }
        .detail-item label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .detail-item p { font-size: 0.875rem; color: #475569; margin: 0; line-height: 1.5; }
        
        .source-link-box { margin-top: 12px; padding: 10px; background: #f8fafc; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; }
        .s-link { font-size: 0.8rem; font-weight: 600; color: #4f46e5; max-width: 70%; }
        .s-action { font-size: 0.75rem; font-weight: 700; color: white; background: #4f46e5; padding: 4px 12px; border-radius: 6px; text-decoration: none; }

        /* Builder Area */
        .builder-v2-container { background: #fcfdfe; border: 1px solid #eef2ff; border-radius: 20px; padding: 2rem; position: relative; }
        .builder-header-v2 { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
        .b-icon { width: 32px; height: 32px; background: #4f46e5; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .b-text { font-weight: 800; color: #1e293b; font-size: 1rem; letter-spacing: -0.01em; }
        
        .builder-label-v2 { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: block; }
        .builder-input-v2 { width: 100%; padding: 0.875rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; font-weight: 500; transition: all 0.2s; }
        .builder-input-v2:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08); }
        
        .type-selector-v2 { display: flex; flex-wrap: wrap; gap: 10px; }
        .type-btn-v2 { 
            background: white; border: 1px solid #e2e8f0; padding: 12px 20px; border-radius: 14px; 
            display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; min-width: 100px;
            transition: all 0.2s;
        }
        .type-btn-v2.active { border-color: #4f46e5; background: #f5f3ff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1); }
        .type-btn-v2 .t-icon { font-size: 20px; }
        .type-btn-v2 .t-label { font-size: 0.75rem; font-weight: 800; color: #64748b; }
        .type-btn-v2.active .t-label { color: #4f46e5; }

        .context-input-area-v2 { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #f1f5f9; }
        .form-control-minimal { width: 100%; padding: 0.75rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; font-size: 0.9rem; }
        .form-select-minimal { width: 100%; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; }
        
        .video-options-v2 { display: grid; grid-template-columns: 1fr 40px 1fr; align-items: center; gap: 1rem; }
        .v-divider { font-size: 0.65rem; font-weight: 900; color: #cbd5e1; text-align: center; }
        .v-option-card label { display: block; font-size: 0.7rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px; }

        .btn-cancel-v2 { background: transparent; border: none; font-weight: 700; color: #94a3b8; }
        .btn-submit-v2 { background: #4f46e5; color: white; border: none; padding: 0.875rem 2rem; border-radius: 12px; font-weight: 700; transition: all 0.3s; }
        .btn-submit-v2:hover { background: #4338ca; transform: translateY(-1px); }
        .shadow-glow-sm { box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.3); }

        /* Icons Colors */
        .icon-red { color: #ef4444; }
        .icon-blue { color: #3b82f6; }
        .icon-gold { color: #eab308; }
        .icon-cyan { color: #06b6d4; }
        .icon-green { color: #10b981; }
        .icon-indigo { color: #6366f1; }
        .icon-orange { color: #f97316; }
        .icon-gray { color: #94a3b8; }

        /* Premium Modal */
        .premium-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2100; padding: 20px; }
        .modal-content-premium { background: white; width: 100%; max-width: 600px; border-radius: 28px; overflow: hidden; box-shadow: 0 40px 80px -20px rgba(0,0,0,0.5); }
        .modal-header-v2 { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-header-v2 h5 { margin: 0; font-weight: 800; color: #1e293b; }
        .modal-header-v2 button { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .modal-body-v2 { padding: 2rem; }

        .animate-slide-down { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default LessonAddForm;
