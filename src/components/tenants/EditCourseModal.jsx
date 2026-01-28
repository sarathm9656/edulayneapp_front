import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateSubCategoryModal from "../CreateSubCategoryModal";
import {
    fetchCategories,
    fetchSubcategories,
    fetchLevels,
    fetchLanguages,
    fetchSubcategoriesByCategory,
    fetchCourses,
} from "@/redux/course.slice";
import toast from "react-hot-toast";
import CreateCategoryModal from "./CreateCategoryModal";
import CreateLanguageModal from "./CreateLanguageModal";
import CreateLevelModal from "./CreateLevelModal";
import api from "@/api/axiosInstance";

const EditCourseModal = ({ setIsEditCourseModalOpen, course }) => {
    const dispatch = useDispatch();
    const { categories, subcategories, levels, languages } = useSelector(
        (state) => state.course
    );

    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] =
        useState(false);
    const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState(false);
    const [isAddLevelModalOpen, setIsAddLevelModalOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        course_title: course.course_title || "",
        short_description: course.short_description || "",
        description: course.description || "",
        category: course.category?._id || course.category || "",
        subcategory: course.subcategory?._id || course.subcategory || "",
        language: course.language?._id || course.language || "",
        level: course.level?._id || course.level || "",
        max_enrollment: course.max_enrollment || 10,
        start_date: course.start_date
            ? new Date(course.start_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        end_date: course.end_date
            ? new Date(course.end_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        drip_content_enabled: course.drip_content_enabled || false,
        image: null, // Initial image is kept on server if not changed
        is_active: course.is_active ?? true,
        is_archived: course.is_archived ?? false,
    });

    const [imagePreview, setImagePreview] = useState(
        course.image
            ? `${import.meta.env.VITE_API_URL}/uploads/courses/${course.image}`
            : null
    );

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchSubcategories());
        dispatch(fetchLevels());
        dispatch(fetchLanguages());
        if (formData.category) {
            dispatch(fetchSubcategoriesByCategory(formData.category));
        }
    }, [dispatch]);

    useEffect(() => {
        if (formData.category) {
            dispatch(fetchSubcategoriesByCategory(formData.category));
        }
    }, [formData.category, dispatch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: newValue,
            };

            // Real-time UI feedback: if end_date is changed to future, show as active
            if (name === 'end_date' && new Date(newValue) > new Date()) {
                updated.is_active = true;
            }

            return updated;
        });

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
            if (errors.image) {
                setErrors((prev) => ({ ...prev, image: "" }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.course_title.trim()) newErrors.course_title = "Course title is required";
        if (!formData.short_description.trim()) newErrors.short_description = "Short description is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.subcategory) newErrors.subcategory = "Subcategory is required";
        if (!formData.language) newErrors.language = "Language is required";
        if (!formData.level) newErrors.level = "Level is required";
        if (!formData.max_enrollment || formData.max_enrollment <= 0) newErrors.max_enrollment = "Max enrollment must be > 0";
        if (!formData.start_date) newErrors.start_date = "Start date is required";
        if (!formData.end_date) newErrors.end_date = "End date is required";

        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);
        if (startDate > endDate) {
            newErrors.end_date = "End date must be after start date";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                if (key === "image") {
                    if (formData[key]) data.append("file", formData[key]);
                } else {
                    data.append(key, formData[key]);
                }
            });

            const response = await api.put(`/courses/${course._id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                toast.success("Course updated successfully");
                dispatch(fetchCourses());
                setIsEditCourseModalOpen(false);
            } else {
                toast.error(response.data.message || "Failed to update course");
            }
        } catch (error) {
            console.error("Error updating course:", error);
            toast.error(error.response?.data?.message || "Failed to update course");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => setIsEditCourseModalOpen(false);

    return (
        <div
            className="course-edit-workspace-wrapper"
            style={{
                fixed: 'position',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'workspaceFadeIn 0.3s ease-out forwards'
            }}
        >
            <div
                className="course-workspace-container shadow-2xl"
                style={{
                    width: '95%',
                    height: '92%',
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    fontFamily: "'Outfit', sans-serif"
                }}
            >
                {/* Premium Header */}
                <div className="bg-white border-bottom py-3 px-5 d-flex align-items-center justify-content-between shadow-sm sticky-top" style={{ borderBottom: '1px solid #f1f5f9 !important' }}>
                    <div className="d-flex align-items-center gap-4">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-4 text-primary shadow-sm">
                            <i className="fa-solid fa-wand-magic-sparkles fs-4"></i>
                        </div>
                        <div>
                            <h4 className="fw-bold text-dark mb-1">Course Content Studio</h4>
                            <div className="d-flex align-items-center gap-3">
                                <p className="text-muted small mb-0 fw-medium">Editing: {course.course_title}</p>
                                <div className="vr" style={{ height: '15px' }}></div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`badge ${formData.is_active ? 'bg-success' : 'bg-warning text-dark'} px-3 rounded-pill`} style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {formData.is_active ? 'Public' : 'Hidden'}
                                    </span>
                                    {new Date(formData.end_date) < new Date() && (
                                        <span className="badge bg-danger px-3 rounded-pill d-flex align-items-center gap-1" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            <i className="fa-solid fa-circle-exclamation"></i> Ended
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex gap-3">
                        <button
                            className="btn btn-link text-muted fw-bold text-decoration-none px-4"
                            onClick={handleClose}
                            style={{ fontSize: '14px' }}
                        >
                            Discard
                        </button>
                        <button
                            className="btn btn-primary px-5 py-2 fw-bold d-flex align-items-center gap-2 rounded-3"
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow-1 overflow-auto bg-light bg-opacity-50 p-5 px-lg-5">
                    <div className="row g-5 justify-content-center">
                        <div className="col-xl-7 col-lg-7">
                            {/* General Information Card */}
                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ border: '1px solid #e2e8f0 !important' }}>
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <div className="p-2 bg-soft-primary rounded-3 text-primary"><i className="fa-solid fa-id-card"></i></div>
                                    <h6 className="fw-bold mb-0">Core Identity</h6>
                                </div>
                                <div className="row g-4">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Course Title *</label>
                                        <input
                                            type="text"
                                            className={`form-control form-control-lg border-light bg-light rounded-3 ${errors.course_title ? "is-invalid" : ""}`}
                                            name="course_title"
                                            value={formData.course_title}
                                            onChange={handleChange}
                                            style={{ transition: 'all 0.2s' }}
                                        />
                                        {errors.course_title && <div className="invalid-feedback">{errors.course_title}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Elevator Pitch (Short Description) *</label>
                                        <textarea
                                            className={`form-control border-light bg-light rounded-3 ${errors.short_description ? "is-invalid" : ""}`}
                                            name="short_description"
                                            value={formData.short_description}
                                            onChange={handleChange}
                                            rows="2"
                                        />
                                        {errors.short_description && <div className="invalid-feedback">{errors.short_description}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Full Description</label>
                                        <textarea
                                            className={`form-control border-light bg-light rounded-3 ${errors.description ? "is-invalid" : ""}`}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="8"
                                            placeholder="Tell the story of this course..."
                                        />
                                        {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Status & Strategy */}
                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#ffffff', border: '1px solid #e2e8f0 !important' }}>
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <div className="p-2 bg-warning bg-opacity-10 rounded-3 text-warning"><i className="fa-solid fa-compass"></i></div>
                                    <h6 className="fw-bold mb-0">Status & Strategy</h6>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded-3 h-100 d-flex flex-column justify-content-between">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="fw-bold text-dark">Publishing Status</span>
                                                <div className="form-check form-switch p-0">
                                                    <input className="form-check-input ms-0" type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <p className="text-muted small mb-0">Control if students can discover this course</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 border rounded-3 h-100 d-flex flex-column justify-content-between">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="fw-bold text-dark">Archive Status</span>
                                                <div className="form-check form-switch p-0">
                                                    <input className="form-check-input ms-0" type="checkbox" name="is_archived" checked={formData.is_archived} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <p className="text-muted small mb-0">Hide from active dashboard view</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4 col-lg-5">
                            {/* Visual Branding */}
                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 overflow-hidden">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <div className="p-2 bg-success bg-opacity-10 rounded-3 text-success"><i className="fa-solid fa-paintbrush"></i></div>
                                    <h6 className="fw-bold mb-0">Visual Branding</h6>
                                </div>
                                <div className="position-relative group rounded-4 overflow-hidden mb-3 border">
                                    <img
                                        src={imagePreview || "/img/chessthumbnail.jpg"}
                                        className="w-100 object-fit-cover"
                                        style={{ height: '220px', transition: 'filter 0.3s' }}
                                        alt="Preview"
                                    />
                                    <label htmlFor="editImg" className="position-absolute top-50 start-50 translate-middle btn btn-light rounded-pill shadow px-4 py-2 opacity-0 group-hover-visible" style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}>
                                        <i className="fa-solid fa-camera me-2 text-primary"></i> Change Cover
                                        <input type="file" id="editImg" className="d-none" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <div className="alert alert-info border-0 bg-info bg-opacity-10 py-2 small mb-0">
                                    <i className="fa-solid fa-circle-info me-2"></i> Use high-resolution landscape images.
                                </div>
                            </div>

                            {/* Classification */}
                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <div className="p-2 bg-info bg-opacity-10 rounded-3 text-info"><i className="fa-solid fa-layer-group"></i></div>
                                    <h6 className="fw-bold mb-0">Classification</h6>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary mb-1">Taxonomy</label>
                                    <div className="d-flex flex-column gap-2 mt-1">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 text-muted"><i className="fa-solid fa-folder"></i></span>
                                            <select className="form-select border-start-0 ps-0" name="category" value={formData.category} onChange={handleChange}>
                                                {categories.map(c => <option key={c._id} value={c._id}>{c.category}</option>)}
                                            </select>
                                            <button className="btn btn-light border" onClick={() => setIsAddCategoryModalOpen(true)} type="button"><i className="fa-solid fa-plus"></i></button>
                                        </div>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 text-muted"><i className="fa-solid fa-hashtag"></i></span>
                                            <select className="form-select border-start-0 ps-0" name="subcategory" value={formData.subcategory} onChange={handleChange}>
                                                {subcategories.map(s => <option key={s._id} value={s._id}>{s.subcategory_name}</option>)}
                                            </select>
                                            <button className="btn btn-light border" onClick={() => setIsAddSubcategoryModalOpen(true)} type="button"><i className="fa-solid fa-plus"></i></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-secondary mb-1">Language</label>
                                        <div className="input-group">
                                            <select className="form-select" name="language" value={formData.language} onChange={handleChange}>
                                                {languages.map(l => <option key={l._id} value={l._id}>{l.language}</option>)}
                                            </select>
                                            <button className="btn btn-light border" onClick={() => setIsAddLanguageModalOpen(true)} type="button"><i className="fa-solid fa-plus"></i></button>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-secondary mb-1">Difficulty</label>
                                        <div className="input-group">
                                            <select className="form-select" name="level" value={formData.level} onChange={handleChange}>
                                                {levels.map(lv => <option key={lv._id} value={lv._id}>{lv.course_level}</option>)}
                                            </select>
                                            <button className="btn btn-light border" onClick={() => setIsAddLevelModalOpen(true)} type="button"><i className="fa-solid fa-plus"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scheduling */}
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <div className="p-2 bg-danger bg-opacity-10 rounded-3 text-danger"><i className="fa-solid fa-clock"></i></div>
                                    <h6 className="fw-bold mb-0">Scheduling & Limits</h6>
                                </div>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-secondary mb-1">Start Date</label>
                                        <input type="date" className="form-control" name="start_date" value={formData.start_date} onChange={handleChange} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-secondary mb-1">End Date</label>
                                        <input type="date" className="form-control" name="end_date" value={formData.end_date} onChange={handleChange} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-secondary mb-1">Enrollment Limit</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 text-muted"><i className="fa-solid fa-users-viewfinder"></i></span>
                                            <input type="number" className="form-control border-start-0 ps-0" name="max_enrollment" value={formData.max_enrollment} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes workspaceFadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .bg-soft-primary { background-color: #f0f7ff !important; }
                .course-workspace-container .form-control:focus, 
                .course-workspace-container .form-select:focus {
                    background-color: #fff !important;
                    border-color: #4f46e5 !important;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
                }
                .group:hover .group-hover-visible {
                    opacity: 1 !important;
                }
                .course-workspace-container ::-webkit-scrollbar {
                    width: 6px;
                }
                .course-workspace-container ::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                .course-workspace-container ::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .course-workspace-container ::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            {isAddSubcategoryModalOpen && (
                <CreateSubCategoryModal setIsAddSubcategoryModalOpen={setIsAddSubcategoryModalOpen} />
            )}
            {isAddCategoryModalOpen && (
                <CreateCategoryModal setIsAddCategoryModalOpen={setIsAddCategoryModalOpen} />
            )}
            {isAddLanguageModalOpen && (
                <CreateLanguageModal setIsAddLanguageModalOpen={setIsAddLanguageModalOpen} />
            )}
            {isAddLevelModalOpen && (
                <CreateLevelModal setIsAddLevelModalOpen={setIsAddLevelModalOpen} />
            )}
        </div>
    );
};

export default EditCourseModal;
