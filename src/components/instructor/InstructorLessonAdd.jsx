import React, { useEffect, useState } from "react";
import { FaChevronDown, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchLessonsInstructor } from "../../redux/instructor/instructor.slice";
// import { fetchLessons, updateLessonOrders } from "@/redux/inst";

const LessonAddFormInstructor = ({ moduleId, module }) => {
  const dispatch = useDispatch();
  const [showLessonAddAccordion, setShowLessonAddAccordion] = useState(false);
  const [draggedLesson, setDraggedLesson] = useState(null);
  const [draggedLessonIndex, setDraggedLessonIndex] = useState(null);
  const [draggedOverLessonIndex, setDraggedOverLessonIndex] = useState(null);
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [editLessonModal, setEditLessonModal] = useState(false);
  // const [moduleLessons, setModuleLessons] = useState([]);

  // console.log(moduleLessons, "moduleLessons inside the LessonAddForm");
  // Local state for module-specific lessons
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

  const { lessons } = useSelector((state) => state.instructor);
  console.log(lessons, "lessons inside the LessonAddForm");

  // Fetch lessons for this specific module
  const fetchModuleLessons = async () => {
    try {
      const response = await dispatch(fetchLessonsInstructor(moduleId));

      // setModuleLessons(response.data.data);
    } catch (error) {
      console.error("Error fetching module lessons:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("lesson_title", formData.lesson_title);
    data.append("lesson_description", formData.lesson_description);
    data.append("lesson_type", formData.lesson_type);
    data.append("lesson_duration", formData.lesson_duration);
    data.append("is_downloadable", formData.is_downloadable);
    data.append("is_preview", formData.is_preview);
    data.append("video_url", formData.video_url);
    data.append("live_url", formData.live_url);
    data.append("quiz_id", formData.quiz_id);

    // Only append file if present and lesson_type is pdf
    if (formData.file) {
      data.append("file", formData.file);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/lessons/${moduleId}`,
        data,
        {
          withCredentials: true,
        }
      );
      console.log("Lesson created:", response.data);

      // Reset form and refresh lessons
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

      // Refresh lessons for this module
      dispatch(fetchLessons(moduleId));
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  const handleDragStart = (index, e) => {
    e.stopPropagation();
    setDraggedLesson(lessons[index]);
    setDraggedLessonIndex(index);
  };

  const handleDragOver = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverLessonIndex(index);
  };

  const handleDrop = async (dropIndex, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedLessonIndex === null || draggedLessonIndex === dropIndex) {
      setDraggedLessonIndex(null);
      return;
    }

    const updatedLessons = [...lessons];
    const [movedLesson] = updatedLessons.splice(draggedLessonIndex, 1);
    updatedLessons.splice(dropIndex, 0, movedLesson);

    // Assign new display_order based on the updated order
    const reorderedLessons = updatedLessons.map((lesson, idx) => ({
      _id: lesson._id,
      display_order: idx + 1,
    }));

    try {
      // Send entire reordered array to backend
      const response = await dispatch(updateLessonOrders({ 
        lessons: reorderedLessons, 
        moduleId: moduleId 
      }));
      console.log("Order updated:", response.data);

      // Update local state immediately for better UX
      dispatch(fetchLessonsInstructor(moduleId));
      setDraggedLessonIndex(null);
    } catch (error) {
      console.error("Failed to update lesson order:", error);
      // Revert to original order on error
      dispatch(fetchLessonsInstructor(moduleId));
    }
  };

  const handleEditLesson = async (lessonId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/lessons/editlesson/${lessonId}`,
        formData,
        { withCredentials: true }
      );
      console.log("Lesson updated:", response.data);
      dispatch(fetchLessons(moduleId));
      setEditLessonModal(false);
    } catch (error) {
      console.error("Failed to edit lesson:", error);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/lessons/${lessonId}`,
          { withCredentials: true }
        );
        console.log("Lesson deleted:", response.data);
        dispatch(fetchLessons(moduleId));
      } catch (error) {
        console.error("Failed to delete lesson:", error);
      }
    }
  };

  // Fetch lessons when accordion is opened
  const handleAccordionToggle = () => {
    const newState = !showLessonAddAccordion;
    setShowLessonAddAccordion(newState);

    if (newState) {
      dispatch(fetchLessonsInstructor(moduleId));
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b border-gray-300">
      <h1
        className="text-lg font-bold px-12 py-4 cursor-pointer flex items-center gap-2 justify-between"
        onClick={handleAccordionToggle}
      >
        {module.module_title}
        <div className="flex items-center gap-2">
          <FaChevronDown
            className={`${
              showLessonAddAccordion
                ? "rotate-180 text-gray-500"
                : "text-gray-500"
            } transition-all duration-300`}
          />
        </div>
      </h1>

      {showLessonAddAccordion && (
        <div>
          <div className="px-12">
            {lessons && lessons.length > 0 ? (
              lessons.map((lesson, index) => (
                <div key={lesson._id || index}>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(index, e)}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDrop={(e) => handleDrop(index, e)}
                    className={`flex items-center gap-2 border-b border-gray-300 py-4 cursor-pointer ${
                      draggedOverLessonIndex === index ? "bg-blue-50" : ""
                    }`}
                  >
                    <h1 className="text-sm text-gray-500 w-8">{index + 1}</h1>
                    <h1
                      className="flex-grow"
                      onClick={() =>
                        setExpandedLessonId(
                          expandedLessonId === lesson._id ? null : lesson._id
                        )
                      }
                    >
                      {lesson.lesson_title}
                    </h1>
                    <div className="flex items-center gap-2">
                      <FaEdit
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditLessonModal(true);
                          setFormData({
                            lesson_title: lesson.lesson_title,
                            lesson_description: lesson.description || "",
                            lesson_type: lesson.lesson_type || "text",
                            lesson_duration: lesson.lesson_duration || "",
                            is_downloadable: lesson.is_downloadable || false,
                            is_preview: lesson.is_preview || false,
                            video_url: lesson.video_url || "",
                            live_url: lesson.live_url || "",
                            quiz_id: lesson.quiz_id || "",
                          });
                        }}
                        className="cursor-pointer text-blue-500 hover:text-blue-700"
                      />
                      <FaTrash
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson._id);
                        }}
                        className="cursor-pointer text-red-500 hover:text-red-700"
                      />
                    </div>
                    <FaChevronDown
                      className={`${
                        expandedLessonId === lesson._id ? "rotate-180" : ""
                      } transition-all duration-300`}
                    />
                  </div>

                  {expandedLessonId === lesson._id && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-700">Title</h3>
                          <p className="text-gray-600">{lesson.lesson_title}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-700">
                            Description
                          </h3>
                          <p className="text-gray-600">
                            {lesson.description || "No description"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-700">Type</h3>
                          <p className="text-gray-600 capitalize">
                            {lesson.lesson_type_id.lesson_type}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-700">
                            Duration
                          </h3>
                          <p className="text-gray-600">
                            {lesson.lesson_duration || 0} minutes
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-700">
                            Downloadable
                          </h3>
                          <p className="text-gray-600">
                            {lesson.is_downloadable ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-700">
                            Preview
                          </h3>
                          <p className="text-gray-600">
                            {lesson.is_preview ? "Yes" : "No"}
                          </p>
                        </div>
                        {lesson.video_url && (
                          <div>
                            <h3 className="font-semibold text-gray-700">
                              Video URL
                            </h3>
                            <p className="text-gray-600">{lesson.video_url}</p>
                          </div>
                        )}
                        {lesson.live_url && (
                          <div>
                            <h3 className="font-semibold text-gray-700">
                              Live URL
                            </h3>
                            <p className="text-gray-600">{lesson.live_url}</p>
                          </div>
                        )}
                        {lesson.quiz_id && (
                          <div>
                            <h3 className="font-semibold text-gray-700">
                              Quiz ID
                            </h3>
                            <p className="text-gray-600">{lesson.quiz_id}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No lessons found for this module. Add your first lesson below.
              </div>
            )}
          </div>

          <div className="px-12 py-4">
            <form
              encType="multipart/form-data"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <input
                className="placeholder:text-sm placeholder:float-end border-none outline-none bg-slate-200 px-4 py-2 rounded-md placeholder:text-gray-500"
                type="text"
                name="lesson_title"
                placeholder="Lesson Title"
                value={formData.lesson_title}
                onChange={handleChange}
                required
              />
              <input
                className="placeholder:text-sm placeholder:float-end border-none outline-none bg-slate-200 px-4 py-2 rounded-md placeholder:text-gray-500"
                type="text"
                name="lesson_description"
                placeholder="Lesson Description"
                value={formData.lesson_description}
                onChange={handleChange}
                required
              />
              <select
                onChange={handleChange}
                defaultValue="text"
                name="lesson_type"
                id="lesson_type"
                className="border-none outline-none bg-slate-200 px-4 py-2 rounded-md placeholder:text-sm placeholder:text-gray-500"
              >
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="quiz">Quiz</option>
                <option value="live">Live</option>
                <option value="assignment">Assignment</option>
                <option value="text">Text</option>
              </select>

              {formData.lesson_type === "video" && (
                <input
                  className="placeholder:text-sm placeholder:float-end border-none outline-none bg-slate-200 px-4 py-2 rounded-md placeholder:text-gray-500"
                  type="text"
                  name="video_url"
                  placeholder="Video URL"
                  value={formData.video_url}
                  onChange={handleChange}
                />
              )}

              {formData.lesson_type === "pdf" && (
                <input
                  className="placeholder:text-sm placeholder:float-end border-none outline-none bg-slate-200 px-4 py-2 rounded-md placeholder:text-gray-500"
                  type="file"
                  name="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              )}

              {formData.lesson_type === "live" && (
                <input
                  className="placeholder:text-sm placeholder:float-end border-none outline-none bg-slate-200 px-4 py-2 rounded-md placeholder:text-gray-500"
                  type="text"
                  name="live_url"
                  placeholder="Live URL"
                  value={formData.live_url}
                  onChange={handleChange}
                />
              )}

              {formData.lesson_type === "quiz" && (
                <select
                  onChange={handleChange}
                  name="quiz_id"
                  id="quiz_id"
                  className="border-none outline-none bg-slate-200 px-4 py-2 rounded-md placeholder:text-sm placeholder:text-gray-500"
                >
                  <option value="">Select Quiz</option>
                </select>
              )}

              <input
                className="placeholder:text-sm placeholder:float-end border-none outline-none bg-slate-200 px-4 py-2 rounded-md placeholder:text-gray-500 appearance-none number-input"
                inputMode="numeric"
                pattern="[0-9]*"
                type="number"
                name="lesson_duration"
                placeholder="Threshold Druation"
                value={formData.lesson_duration}
                onChange={handleChange}
                required
              />

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_downloadable"
                    id="is_downloadable"
                    checked={formData.is_downloadable}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_downloadable">Is Downloadable</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_preview"
                    id="is_preview"
                    checked={formData.is_preview}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_preview">Is Preview</label>
                </div>
              </div>

              <button
                type="submit"
                className="bg-black text-slate-300 font-semibold w-1/3 py-2 rounded-md hover:bg-[#161616] transition-all duration-300 cursor-pointer"
              >
                Add Lesson
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Lesson</h2>
              <MdClose
                onClick={() => setEditLessonModal(false)}
                className="cursor-pointer text-gray-500 hover:text-gray-700"
              />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditLesson(expandedLessonId);
              }}
            >
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="lesson_title"
                  placeholder="Lesson Title"
                  value={formData.lesson_title}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-2 rounded-md"
                  required
                />
                <input
                  type="text"
                  name="lesson_description"
                  placeholder="Lesson Description"
                  value={formData.lesson_description}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-2 rounded-md"
                  required
                />
                <input
                  type="number"
                  name="lesson_duration"
                  placeholder="Duration (minutes)"
                  value={formData.lesson_duration}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-2 rounded-md"
                  required
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_downloadable"
                      checked={formData.is_downloadable}
                      onChange={handleChange}
                    />
                    <label>Downloadable</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_preview"
                      checked={formData.is_preview}
                      onChange={handleChange}
                    />
                    <label>Preview</label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Update Lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLessonModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonAddFormInstructor;
