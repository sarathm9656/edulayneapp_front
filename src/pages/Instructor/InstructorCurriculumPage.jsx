import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";
import LessonAddForm from "../../components/lessons/LessonAddForm";
import AddSectionModal from "../../components/instructor/AddSectionModal";
import {
    fetchModulesByCourseId,
    fetchCourseDetails,
} from "../../redux/course.slice";
import api from "@/api/axiosInstance";
import toast from "react-hot-toast";

const InstructorCurriculumPage = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { modules, courseDetails, modulesLoading } = useSelector((state) => state.course);

    const [isAddingModule, setIsAddingModule] = useState(false);
    const [openModuleId, setOpenModuleId] = useState(null);
    const [orderedModules, setOrderedModules] = useState([]);
    const [draggedModuleIndex, setDraggedModuleIndex] = useState(null);

    useEffect(() => {
        if (courseId) {
            dispatch(fetchCourseDetails(courseId));
            dispatch(fetchModulesByCourseId(courseId));
        }
    }, [courseId, dispatch]);

    useEffect(() => {
        const next = Array.isArray(modules) ? [...modules] : [];
        next.sort((a, b) => (a?.display_order ?? 0) - (b?.display_order ?? 0));
        setOrderedModules(next);
    }, [modules]);

    const handleModuleToggle = (moduleId) => {
        setOpenModuleId(openModuleId === moduleId ? null : moduleId);
    };

    const persistModuleOrder = async (nextModules) => {
        await Promise.all(
            nextModules.map((m, idx) =>
                api.put(`/modules/update/display-order/${m._id}`, { display_order: idx + 1 })
            )
        );
    };

    const handleModuleDragStart = (index) => setDraggedModuleIndex(index);
    const handleModuleDragOver = (index, e) => e.preventDefault();

    const handleModuleDrop = async (index, e) => {
        e.preventDefault();
        if (draggedModuleIndex === null || draggedModuleIndex === index) return;

        const next = [...orderedModules];
        const moved = next.splice(draggedModuleIndex, 1)[0];
        next.splice(index, 0, moved);
        setOrderedModules(next);
        setDraggedModuleIndex(null);

        try {
            await persistModuleOrder(next);
            toast.success("Section order updated");
            dispatch(fetchModulesByCourseId(courseId));
        } catch (error) {
            toast.error("Failed to reorder sections");
            dispatch(fetchModulesByCourseId(courseId));
        }
    };

    return (
        <div className="curriculum-page bg-light min-vh-100 pb-5">
            {/* Header */}
            <div className="bg-white border-bottom py-3 px-lg-5 px-3 sticky-top shadow-sm mb-4" style={{ zIndex: 1020 }}>
                <div className="container-fluid">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm border"
                                style={{ width: '40px', height: '40px' }}
                            >
                                <FaArrowLeft size={14} className="text-muted" />
                            </button>
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="badge bg-soft-primary text-primary extra-small fw-bold px-2 py-1 rounded">INSTRUCTOR</span>
                                    <span className="text-muted opacity-50">/</span>
                                    <span className="extra-small text-muted fw-bold">CURRICULUM BUILDER</span>
                                </div>
                                <h4 className="fw-bold text-dark mb-0">{courseDetails?.course_title || "Course Curriculum"}</h4>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                onClick={() => setIsAddingModule(true)}
                                className="btn btn-primary px-4 fw-bold rounded-3 shadow border-0 py-2 d-flex align-items-center gap-2 small"
                                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                            >
                                <FaPlus /> New Section
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container pb-5">
                <div className="row justify-content-center">
                    <div className="col-xl-10">
                        {/* Header Stats */}
                        {modules?.length > 0 && (
                            <div className="row g-3 mb-4 animate-slide-down">
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-soft-primary p-2 rounded-3 text-primary"><i className="fa-solid fa-layer-group"></i></div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{modules?.length}</h6>
                                                <small className="text-muted extra-small fw-bold">SECTIONS</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-soft-success p-2 rounded-3 text-success"><i className="fa-solid fa-file-lines"></i></div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}</h6>
                                                <small className="text-muted extra-small fw-bold">TOTAL LESSONS</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Curriculum List */}
                        {modulesLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-3 text-muted fw-medium">Assembling Curriculum...</p>
                            </div>
                        ) : orderedModules && orderedModules.length > 0 ? (
                            <div className="curriculum-list d-flex flex-column gap-3">
                                {orderedModules.map((module, index) => (
                                    <div
                                        key={module._id}
                                        className="module-entry-wrapper"
                                        draggable
                                        onDragStart={() => handleModuleDragStart(index)}
                                        onDragOver={(e) => handleModuleDragOver(index, e)}
                                        onDrop={(e) => handleModuleDrop(index, e)}
                                    >
                                        <div className="section-badge mb-2 d-inline-flex align-items-center gap-2 px-2 py-1 rounded bg-white shadow-sm border">
                                            <span className="text-muted opacity-50"><MdDragIndicator /></span>
                                            <span className="extra-small fw-bold text-primary">SECTION {index + 1}</span>
                                        </div>
                                        <LessonAddForm
                                            moduleId={module._id}
                                            courseId={courseId}
                                            module={module}
                                            isOpen={openModuleId === module._id}
                                            onToggle={() => handleModuleToggle(module._id)}
                                            onModuleChanged={() => dispatch(fetchModulesByCourseId(courseId))}
                                        />
                                    </div>
                                ))}
                                <div className="text-center py-4 mt-2">
                                    <button
                                        onClick={() => setIsAddingModule(true)}
                                        className="btn btn-soft-primary px-4 fw-bold border-dashed border-primary border-opacity-25"
                                    >
                                        <FaPlus size={12} className="me-2" /> Add Another Section
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm rounded-4 bg-white text-center py-5">
                                <div className="mb-4 text-primary opacity-25">
                                    <i className="fa-solid fa-map text-primary" style={{ fontSize: '6rem' }}></i>
                                </div>
                                <h3 className="fw-bold text-dark mb-2">Plot Your Learning Journey</h3>
                                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '440px' }}>
                                    Your curriculum is the roadmap for your students. Organize lessons into logical sections to make learning more manageable and engaging.
                                </p>
                                <button
                                    onClick={() => setIsAddingModule(true)}
                                    className="btn btn-primary px-5 py-3 fw-bold rounded-pill shadow-lg border-0"
                                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                                >
                                    <FaPlus className="me-2" /> Add Your First Section
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Section Modal */}
            <AddSectionModal
                isOpen={isAddingModule}
                onClose={() => setIsAddingModule(false)}
                courseId={courseId}
            />

            <style>{`
        .curriculum-page {
          font-family: 'Outfit', sans-serif;
        }
        .extra-small { font-size: 0.65rem; letter-spacing: 0.05rem; }
        .letter-spacing-1 { letter-spacing: 0.5px; }
        .animate-slide-down {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .bg-soft-primary { background: #eef2ff !important; }
        .bg-soft-success { background: #ecfdf5 !important; }
        .btn-soft-primary { background: #eef2ff; color: #4f46e5; border: 1px solid rgba(79, 70, 229, 0.1); transition: all 0.2s; }
        .btn-soft-primary:hover { background: #4f46e5; color: white; }
      `}</style>
        </div>
    );
};

export default InstructorCurriculumPage;
