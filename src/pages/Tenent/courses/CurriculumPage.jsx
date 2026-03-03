import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowLeft, FaPlus, FaSave, FaTrash, FaEdit, FaRocket, FaChevronRight } from "react-icons/fa";
import { MdDragIndicator, MdExpandMore, MdExpandLess, MdDashboard, MdAutoStories, MdSettings } from "react-icons/md";
import LessonAddForm from "../../../components/lessons/LessonAddForm";
import {
    fetchModulesByCourseId,
    createModuleAndAssignToCourse,
    fetchCourseDetails,
} from "../../../redux/course.slice";
import toast from "react-hot-toast";
import api from "@/api/axiosInstance";

const CurriculumPage = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { modules, courseDetails, modulesLoading } = useSelector((state) => state.course);

    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModule, setNewModule] = useState({ title: "", description: "" });
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

    const handleAddModule = async (e) => {
        e.preventDefault();
        if (!newModule.title || !newModule.description) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            const moduleData = {
                module_title: newModule.title,
                module_description: newModule.description,
                course_id: courseId,
                display_order: modules.length + 1
            };

            await dispatch(createModuleAndAssignToCourse(moduleData));
            dispatch(fetchModulesByCourseId(courseId));
            setNewModule({ title: "", description: "" });
            setIsAddingModule(false);
            toast.success("Section added successfully");
        } catch (error) {
            toast.error("Failed to add section");
        }
    };

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

    const handleModuleDragStart = (index) => {
        setDraggedModuleIndex(index);
    };

    const handleModuleDragOver = (index, e) => {
        e.preventDefault();
    };

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
        <div className="curriculum-page-v2">
            <div className="curriculum-bg-decoration"></div>

            {/* Premium Header */}
            <div className="premium-nav-glass sticky-top">
                <div className="container-fluid px-lg-5 px-3 py-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="back-btn-premium"
                            >
                                <FaArrowLeft size={14} />
                            </button>
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="badge-studio">CURRICULUM ENGINE</span>
                                    <span className="sep-dot"></span>
                                    <span className="text-muted extra-small fw-bold letter-spacing-1">COURSE DESIGNER</span>
                                </div>
                                <h4 className="fw-black text-dark mb-0 title-gradient-simple">{courseDetails?.course_title || "Course Builder"}</h4>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn-preview-premium">
                                <i className="fa-solid fa-eye me-2"></i> Preview Course
                            </button>
                            <button
                                onClick={() => setIsAddingModule(true)}
                                className="btn-add-section-premium"
                            >
                                <FaPlus className="me-2" /> New Learning Section
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5 content-relative">
                <div className="row justify-content-center">
                    <div className="col-xl-11 col-xxl-10">
                        {/* Summary Dashboard */}
                        {!isAddingModule && modules?.length > 0 && (
                            <div className="dashboard-summary-grid mb-5 animate-blur-in">
                                <div className="summary-card">
                                    <div className="summary-icon bg-indigo"><MdDashboard /></div>
                                    <div className="summary-info">
                                        <span className="label">Structure</span>
                                        <h3 className="value">{modules?.length} <small>Sections</small></h3>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-icon bg-violet"><MdAutoStories /></div>
                                    <div className="summary-info">
                                        <span className="label">Total Assets</span>
                                        <h3 className="value">{modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} <small>Lessons</small></h3>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-icon bg-emerald"><FaRocket /></div>
                                    <div className="summary-info">
                                        <span className="label">Publishing</span>
                                        <h3 className="value">READY</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add Module Inline Form - Premium Redesign */}
                        {isAddingModule && (
                            <div className="premium-form-card mb-5 animate-slide-up">
                                <div className="form-glow"></div>
                                <div className="card-inner">
                                    <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white rounded-top-4">
                                        <div>
                                            <h5 className="fw-black text-dark mb-1">Architect New Section</h5>
                                            <p className="text-muted small mb-0">Define the milestone for this learning segment.</p>
                                        </div>
                                        <button className="btn-close-minimal" onClick={() => setIsAddingModule(false)}><FaTrash /></button>
                                    </div>
                                    <div className="p-4 bg-white rounded-bottom-4">
                                        <form onSubmit={handleAddModule}>
                                            <div className="row g-4">
                                                <div className="col-md-12">
                                                    <label className="premium-label-v2">Section Title *</label>
                                                    <input
                                                        type="text"
                                                        className="premium-input-v2"
                                                        placeholder="e.g. Fundamental Tactics & Strategies"
                                                        value={newModule.title}
                                                        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-12">
                                                    <label className="premium-label-v2">Learning Objectives *</label>
                                                    <textarea
                                                        className="premium-input-v2"
                                                        rows="3"
                                                        placeholder="What skills will the student master by completing this section?"
                                                        value={newModule.description}
                                                        onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                                                <button type="button" className="btn-ghost-premium" onClick={() => setIsAddingModule(false)}>Dismiss</button>
                                                <button type="submit" className="btn-primary-premium px-5">Build Section</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Curriculum List */}
                        {modulesLoading ? (
                            <div className="text-center py-5">
                                <div className="premium-loader-spinner"></div>
                                <p className="mt-4 text-muted fw-bold letter-spacing-1 small">CALIBRATING CURRICULUM...</p>
                            </div>
                        ) : orderedModules && orderedModules.length > 0 ? (
                            <div className="curriculum-stack animate-pop-in">
                                {orderedModules.map((module, index) => (
                                    <div
                                        key={module._id}
                                        className="module-v2-wrapper"
                                        draggable
                                        onDragStart={() => handleModuleDragStart(index)}
                                        onDragOver={(e) => handleModuleDragOver(index, e)}
                                        onDrop={(e) => handleModuleDrop(index, e)}
                                    >
                                        <div className="module-indexer">
                                            <span className="drag"><MdDragIndicator /></span>
                                            <span className="idx">{(index + 1).toString().padStart(2, '0')}</span>
                                            <div className="connector"></div>
                                        </div>
                                        <div className="module-content-part">
                                            <LessonAddForm
                                                moduleId={module._id}
                                                courseId={courseId}
                                                module={module}
                                                isOpen={openModuleId === module._id}
                                                onToggle={() => handleModuleToggle(module._id)}
                                                onModuleChanged={() => dispatch(fetchModulesByCourseId(courseId))}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {!isAddingModule && (
                                    <div className="text-center py-5 mt-4">
                                        <button
                                            onClick={() => setIsAddingModule(true)}
                                            className="btn-add-section-dashed"
                                        >
                                            <FaPlus className="me-2" /> Add Next Section
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="curriculum-empty-state">
                                <div className="empty-visual">
                                    <div className="orb-decoration animate-pulse"></div>
                                    <MdDashboard size={80} className="text-primary opacity-20" />
                                </div>
                                <h2 className="fw-black text-dark mb-3">Your Roadmap is Blank</h2>
                                <p className="text-muted mb-5 mx-auto" style={{ maxWidth: '500px' }}>
                                    Transform your knowledge into a structured learning experience. Start by defining your first curriculum module.
                                </p>
                                <button
                                    onClick={() => setIsAddingModule(true)}
                                    className="btn-primary-premium lg shadow-glow"
                                >
                                    <FaPlus className="me-2" /> Begin Designing
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;600;700;800;900&display=swap');

                .curriculum-page-v2 {
                    font-family: 'Outfit', sans-serif;
                    background-color: #f6f8fb;
                    min-height: 100vh;
                    position: relative;
                    color: #1e293b;
                    overflow-x: hidden;
                }
                .curriculum-bg-decoration {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 100vw;
                    height: 100vh;
                    background: 
                        radial-gradient(circle at 90% 10%, rgba(79, 70, 229, 0.05) 0%, transparent 40%),
                        radial-gradient(circle at 10% 90%, rgba(124, 58, 237, 0.05) 0%, transparent 40%);
                    z-index: 0;
                    pointer-events: none;
                }
                .content-relative { position: relative; z-index: 1; }

                /* Premium Nav */
                .premium-nav-glass {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    z-index: 1020;
                }
                .back-btn-premium {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }
                .back-btn-premium:hover {
                    color: #4f46e5;
                    border-color: #4f46e5;
                    transform: translateX(-3px);
                }
                .badge-studio {
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 6px;
                    letter-spacing: 0.08em;
                }
                .sep-dot {
                    width: 4px;
                    height: 4px;
                    background: #cbd5e1;
                    border-radius: 50%;
                }
                .fw-black { font-weight: 800; }
                .title-gradient-simple {
                    background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                /* Dashboard Stats */
                .dashboard-summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                }
                .summary-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    box-shadow: 0 4px 15px -1px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.02);
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .summary-card:hover { transform: translateY(-5px); }
                .summary-icon {
                    width: 54px;
                    height: 54px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                }
                .bg-indigo { background: linear-gradient(135deg, #4f46e5, #6366f1); }
                .bg-violet { background: linear-gradient(135deg, #7c3aed, #8b5cf6); }
                .bg-emerald { background: linear-gradient(135deg, #059669, #10b981); }
                .summary-info .label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px; }
                .summary-info .value { font-weight: 800; color: #1e293b; margin: 0; font-size: 1.5rem; }
                .summary-info .value small { font-size: 0.85rem; color: #64748b; font-weight: 500; }

                /* Buttons */
                .btn-preview-premium {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    color: #475569;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                .btn-preview-premium:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    color: #0f172a;
                }
                .btn-add-section-premium {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
                    transition: all 0.3s;
                }
                .btn-add-section-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.3);
                }
                .btn-primary-premium {
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 0.875rem 2rem;
                    border-radius: 14px;
                    font-weight: 700;
                    transition: all 0.3s;
                }
                .btn-primary-premium:hover { background: #4338ca; transform: translateY(-1px); }
                .btn-ghost-premium {
                    background: transparent;
                    color: #64748b;
                    border: none;
                    font-weight: 700;
                    padding: 0.875rem 1.5rem;
                    transition: color 0.2s;
                }
                .btn-ghost-premium:hover { color: #0f172a; }

                /* Form Design */
                .premium-form-card {
                    position: relative;
                    border-radius: 28px;
                }
                .form-glow {
                    position: absolute;
                    inset: -2px;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    border-radius: 30px;
                    filter: blur(8px);
                    opacity: 0.15;
                    z-index: 0;
                }
                .card-inner { position: relative; z-index: 1; border-radius: 28px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); }
                .premium-label-v2 { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; display: block; }
                .premium-input-v2 {
                    width: 100%;
                    padding: 1rem 1.25rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    font-size: 0.95rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .premium-input-v2:focus { outline: none; border-color: #4f46e5; background: white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
                .btn-close-minimal {
                    background: #fee2e2;
                    color: #ef4444;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .btn-close-minimal:hover { background: #ef4444; color: white; }

                /* Curriculum Stack */
                .module-v2-wrapper {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 2rem;
                    cursor: grab;
                }
                .module-v2-wrapper:active { cursor: grabbing; }
                .module-indexer {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 40px;
                    flex-shrink: 0;
                }
                .module-indexer .drag {
                    width: 40px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #cbd5e1;
                    margin-bottom: 6px;
                }
                .module-indexer .idx {
                    width: 40px;
                    height: 40px;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }
                .module-indexer .connector {
                    flex: 1;
                    width: 2px;
                    background: repeating-linear-gradient(to bottom, #e2e8f0 0, #e2e8f0 10px, transparent 10px, transparent 15px);
                    margin: 10px 0;
                }
                .module-content-part { flex: 1; }

                .btn-add-section-dashed {
                    background: white;
                    border: 2px dashed #e2e8f0;
                    width: 100%;
                    padding: 1.5rem;
                    border-radius: 20px;
                    color: #64748b;
                    font-weight: 700;
                    transition: all 0.2s;
                }
                .btn-add-section-dashed:hover {
                    border-color: #4f46e5;
                    color: #4f46e5;
                    background: #f5f3ff;
                }

                /* Empty State */
                .curriculum-empty-state { text-align: center; padding: 5rem 2rem; }
                .empty-visual { position: relative; margin-bottom: 2rem; display: inline-block; }
                .orb-decoration {
                    position: absolute;
                    inset: -30px;
                    background: radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%);
                    border-radius: 50%;
                    z-index: -1;
                }
                .shadow-glow { box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.4); }

                /* Loader */
                .premium-loader-spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #e2e8f0;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    margin: 0 auto;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
                @keyframes blurIn { from { filter: blur(10px); opacity: 0; } to { filter: blur(0); opacity: 1; } }
                
                .animate-blur-in { animation: blurIn 0.6s ease-out; }
                .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }

                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default CurriculumPage;
