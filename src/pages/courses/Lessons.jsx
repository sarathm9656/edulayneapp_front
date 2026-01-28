import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import LessonAddForm from "../../components/lessons/LessonAddForm";
import { useDispatch, useSelector } from "react-redux";
import {
  createModuleAndAssignToCourse,
  fetchModulesByCourseId,
} from "../../redux/course.slice";
import toast from "react-hot-toast";

const Lessons = ({ modules, courseId, courseTitle }) => {
  // console.log(courseTitle, "courseTitle in the lessons");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [openModuleId, setOpenModuleId] = useState(null); // Track which module is open
  const dispatch = useDispatch();

  const handleAddModule = async (e) => {
    //     e.preventDefault();
    //     const module = {
    //       module_title: moduleTitle,
    //       module_description: moduleDescription,
    //       course_title: courseTitle,
    //       course_id: courseId,
    //     };

    //     await dispatch(createModuleAndAssignToCourse(module));
    //     dispatch(fetchModulesByCourseId(courseId));

    //     setModuleTitle("");
    //     setModuleDescription("");

    // validate the form
    try {
      e.preventDefault();
      if (!moduleTitle || !moduleDescription) {
        toast.error("Please fill all the fields");
        return;
      }
      const module = {
        module_title: moduleTitle,
        module_description: moduleDescription,
        course_title: courseTitle,
        course_id: courseId,
      };

      await dispatch(createModuleAndAssignToCourse(module));
      if (createModuleAndAssignToCourse.fulfilled) {
        toast.success("Module created successfully");
        setModuleTitle("");
        setModuleDescription("");
        await dispatch(fetchModulesByCourseId(courseId));
      } else {
        toast.error("Failed to create module");
      }
    } catch (error) {
      console.log(error, "error in the handleAddModule");
    }
  };

  const handleAddModuleToCourse = async (e) => {
    // validate the form
    e.preventDefault();
    try {
      if (!moduleTitle || !moduleDescription) {
        toast.error("Please fill all the fields");
        return;
      }
      const module = {
        module_title: moduleTitle,
        module_description: moduleDescription,
        course_id: courseId,
        display_order: 0,
        is_locked: false,
      };
      await dispatch(createModuleAndAssignToCourse(module));
      await dispatch(fetchModulesByCourseId(courseId));
      setModuleTitle("");
      setModuleDescription("");
      toast.success("Module added to course successfully");
    } catch (error) {
      console.log(error, "error in the handleAddModuleToCourse");
      toast.error("Failed to add module to course");
    }
  };

  const handleModuleToggle = (moduleId) => {
    // Close other modules and toggle current one
    setOpenModuleId(openModuleId === moduleId ? null : moduleId);
  };

  return (
    <div className="lessons-container bg-light p-0">
      <div className="container-fluid px-4 py-4">
        <div className="row g-4">
          {/* Module Add Form Section */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-soft-primary p-2 rounded-3" style={{ backgroundColor: "#eef2ff" }}>
                    <i className="fa-solid fa-folder-plus text-primary fs-5"></i>
                  </div>
                  <h5 className="card-title mb-0 fw-bold">Add New Module</h5>
                </div>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleAddModule}>
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted text-uppercase letter-spacing-1">Module Title *</label>
                    <input
                      className="form-control form-control-lg fs-6 border rounded-3 bg-light"
                      type="text"
                      placeholder="e.g. Introduction to Openings"
                      value={moduleTitle}
                      onChange={(e) => setModuleTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted text-uppercase letter-spacing-1">Module Description *</label>
                    <textarea
                      className="form-control border rounded-3 bg-light"
                      rows="3"
                      placeholder="Briefly describe what students will learn..."
                      value={moduleDescription}
                      onChange={(e) => setModuleDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bg-light rounded-3 p-3 mb-4 border-start border-primary border-4">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="fa-solid fa-graduation-cap text-muted small"></i>
                      <span className="small text-muted fw-bold text-uppercase">Course Context</span>
                    </div>
                    <p className="mb-0 text-dark fw-medium small">{courseTitle}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddModuleToCourse}
                    className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    <FaPlus size={14} />
                    <span>Create Module</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* All Modules List Section */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100 mb-0 overflow-hidden">
              <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-soft-success p-2 rounded-3" style={{ backgroundColor: "#ecfdf5" }}>
                    <i className="fa-solid fa-layer-group text-success fs-5"></i>
                  </div>
                  <h5 className="card-title mb-0 fw-bold">Curriculum Structure</h5>
                </div>
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-medium">
                  {modules?.length || 0} Modules Total
                </span>
              </div>

              <div className="card-body p-4 bg-light bg-opacity-50">
                {modules && modules.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {modules.map((module) => (
                      <LessonAddForm
                        key={module._id}
                        moduleId={module._id}
                        courseId={courseId}
                        module={module}
                        isOpen={openModuleId === module._id}
                        onToggle={() => handleModuleToggle(module._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3 opacity-25">
                      <i className="fa-solid fa-cubes text-muted" style={{ fontSize: "5rem" }}></i>
                    </div>
                    <h4 className="fw-bold text-dark">No Curriculum Found</h4>
                    <p className="text-muted mx-auto" style={{ maxWidth: "300px" }}>
                      Your curriculum is empty. Use the form on the left to start building your modules.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .lessons-container {
          min-height: 100%;
          font-family: "Outfit", sans-serif;
        }
        .letter-spacing-1 {
          letter-spacing: 0.5px;
        }
        .form-control:focus {
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.1);
          border-color: #667eea;
        }
        .card {
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Lessons;
