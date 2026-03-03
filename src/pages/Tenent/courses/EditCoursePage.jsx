import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CreateSubCategoryModal from "../../../components/CreateSubCategoryModal";
import {
    fetchCategories,
    fetchSubcategories,
    fetchLevels,
    fetchLanguages,
    fetchSubcategoriesByCategory,
    fetchCourses,
} from "@/redux/course.slice";
import toast from "react-hot-toast";
import CreateCategoryModal from "../../../components/tenants/CreateCategoryModal";
import CreateLanguageModal from "../../../components/tenants/CreateLanguageModal";
import CreateLevelModal from "../../../components/tenants/CreateLevelModal";
import api from "@/api/axiosInstance";

const EditCoursePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        course_title: "",
        short_description: "",
        description: "",
        category: "",
        subcategory: "",
        language: "",
        level: "",
        max_enrollment: 10,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        drip_content_enabled: false,
        image: null,
        is_active: true,
        is_archived: false,
    });

    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setFetching(true);
                const response = await api.get(`/courses/${id}`);
                const course = response.data.data;

                setFormData({
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
                    is_featured: course.is_featured || false,
                    certificate_available: course.certificate_available || false,
                    image: null,
                    is_active: course.is_active ?? true,
                    is_archived: course.is_archived ?? false,
                });

                if (course.image) {
                    setImagePreview(`${import.meta.env.VITE_API_URL}/uploads/courses/${course.image}`);
                }

                dispatch(fetchCategories());
                dispatch(fetchSubcategories());
                dispatch(fetchLevels());
                dispatch(fetchLanguages());

                if (course.category?._id || course.category) {
                    dispatch(fetchSubcategoriesByCategory(course.category?._id || course.category));
                }
            } catch (error) {
                console.error("Error fetching course:", error);
                toast.error("Failed to load course data");
            } finally {
                setFetching(false);
            }
        };

        loadInitialData();
    }, [id, dispatch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: newValue,
            };

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

            const response = await api.put(`/courses/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                toast.success("Course updated successfully");
                // window.close(); // Option to close tab on success
                navigate('/tenant/courses');
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

    if (fetching) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}></div>
                    <p className="mt-3 text-muted fw-medium letter-spacing-1">ENTERING CONTENT STUDIO...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="course-studio-wrapper bg-soft-light min-vh-100 d-flex flex-column" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                :root {
                    --studio-primary: #4f46e5;
                    --studio-secondary: #7c3aed;
                    --studio-success: #10b981;
                    --studio-warning: #f59e0b;
                    --studio-danger: #ef4444;
                    --studio-text-main: #1e293b;
                    --studio-text-muted: #64748b;
                    --studio-bg: #f8fafc;
                    --studio-card-bg: #ffffff;
                }

                .bg-soft-light { background-color: var(--studio-bg); }
                .bg-soft-primary { background-color: rgba(79, 70, 229, 0.08) !important; }
                
                .studio-header {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }

                .studio-card {
                    background: var(--studio-card-bg);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                }

                .form-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--studio-text-muted);
                    margin-bottom: 0.4rem;
                }

                .form-control, .form-select {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.85rem;
                    color: var(--studio-text-main);
                    background-color: #fcfdfe;
                    transition: all 0.2s ease;
                }

                .form-control:focus, .form-select:focus {
                    background-color: #fff;
                    border-color: var(--studio-primary);
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
                    outline: none;
                }

                .btn-save {
                    background: linear-gradient(135deg, var(--studio-primary) 0%, var(--studio-secondary) 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 0.6rem 1.5rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
                    transition: all 0.3s ease;
                }

                .image-upload-wrapper {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    aspect-ratio: 16/9;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                }

                .image-upload-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    cursor: pointer;
                }

                .image-upload-wrapper:hover .image-upload-overlay {
                    opacity: 1;
                }
                
                .compact-section-header {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #334155;
                }

                @media (max-width: 991.98px) {
                    .studio-header { padding: 0.75rem 1.25rem !important; }
                    .main-container { padding: 1rem !important; }
                    .studio-sidebar { margin-top: 1rem; }
                }

                @media (max-width: 575.98px) {
                    .studio-header { flex-direction: row; justify-content: space-between; align-items: center !important; }
                    .course-title-sub { display: none; }
                }
            `}</style>

            {/* Premium Header */}
            <header className="studio-header py-2 px-lg-5 px-3 d-flex align-items-center justify-content-end sticky-top">

                <div className="header-actions d-flex align-items-center gap-2">
                    <span className={`badge ${formData.is_active ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1 rounded-pill d-none d-sm-inline-block`} style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                        {formData.is_active ? 'Public' : 'Hidden'}
                    </span>
                    <button
                        className="btn btn-save d-flex align-items-center gap-2"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa-solid fa-check-circle"></i>}
                        <span>Save</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="main-container flex-grow-1 p-lg-4 p-3 overflow-auto">
                <div className="container-xl">
                    <div className="row g-3">
                        {/* Left Column: Primary Data */}
                        <div className="col-xl-8 col-lg-7">
                            <div className="studio-card p-3 mb-3 border">
                                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                                    <i className="fa-solid fa-id-card text-primary small"></i>
                                    <span className="compact-section-header">Core Identity</span>
                                </div>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">Course Title *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.course_title ? "is-invalid" : ""}`}
                                            name="course_title"
                                            placeholder="Course Name"
                                            value={formData.course_title}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Elevator Pitch *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.short_description ? "is-invalid" : ""}`}
                                            name="short_description"
                                            placeholder="One-liner description"
                                            value={formData.short_description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Full Description</label>
                                        <textarea
                                            className={`form-control ${errors.description ? "is-invalid" : ""}`}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="6"
                                            placeholder="Detailed content..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-12">
                                    <div className="studio-card p-3 border">
                                        <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                                            <i className="fa-solid fa-sliders text-warning small"></i>
                                            <span className="compact-section-header">Advanced Controls</span>
                                        </div>
                                        <div className="row g-2">
                                            {[
                                                { label: "Public Discovery", name: "is_active", desc: "Visible in catalog" },
                                                { label: "Archive Course", name: "is_archived", desc: "Historical records only" },
                                                { label: "Drip Content", name: "drip_content_enabled", desc: "Schedule-based modules" },
                                                { label: "Featured Course", name: "is_featured", desc: "Highlight on home" },
                                                { label: "Certification", name: "certificate_available", desc: "Auto-issue on completion" }
                                            ].map((opt, i) => (
                                                <div key={i} className="col-md-6 col-lg-4">
                                                    <div className="p-2 border rounded-3 bg-light bg-opacity-10">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="fw-bold extra-small text-dark" style={{ fontSize: '0.75rem' }}>{opt.label}</span>
                                                            <div className="form-check form-switch p-0">
                                                                <input className="form-check-input ms-0" type="checkbox" name={opt.name} checked={formData[opt.name]} onChange={handleChange} />
                                                            </div>
                                                        </div>
                                                        <p className="extra-small text-muted mb-0" style={{ fontSize: '0.65rem' }}>{opt.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Sidebar */}
                        <div className="col-xl-4 col-lg-5 studio-sidebar">
                            <div className="studio-card p-3 mb-3 border">
                                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                                    <i className="fa-solid fa-image text-success small"></i>
                                    <span className="compact-section-header">Course Branding</span>
                                </div>
                                <div className="image-upload-wrapper mb-2">
                                    <img
                                        src={imagePreview || "/img/chessthumbnail.jpg"}
                                        className="w-100 h-100 object-fit-cover"
                                        alt="Preview"
                                    />
                                    <label htmlFor="courseImgUpload" className="image-upload-overlay">
                                        <div className="text-center text-white">
                                            <i className="fa-solid fa-camera fs-5 mb-1"></i>
                                            <p className="mb-0 extra-small fw-bold">Update</p>
                                        </div>
                                        <input type="file" id="courseImgUpload" className="d-none" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <p className="text-center text-muted extra-small mb-0">16:9 ratio recommended</p>
                            </div>

                            <div className="studio-card p-3 mb-3 border">
                                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                                    <i className="fa-solid fa-tags text-info small"></i>
                                    <span className="compact-section-header">Taxonomy</span>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Category</label>
                                    <div className="d-flex gap-2">
                                        <select className="form-select form-select-sm" name="category" value={formData.category} onChange={handleChange}>
                                            <option value="">Choose...</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.category}</option>)}
                                        </select>
                                        <button type="button" className="btn btn-white border px-2 py-0" onClick={() => setIsAddCategoryModalOpen(true)}>
                                            <i className="fa-solid fa-plus text-primary small"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Subcategory</label>
                                    <div className="d-flex gap-2">
                                        <select className="form-select form-select-sm" name="subcategory" value={formData.subcategory} onChange={handleChange}>
                                            <option value="">Choose...</option>
                                            {subcategories.map(s => <option key={s._id} value={s._id}>{s.subcategory_name}</option>)}
                                        </select>
                                        <button type="button" className="btn btn-white border px-2 py-0" onClick={() => setIsAddSubcategoryModalOpen(true)}>
                                            <i className="fa-solid fa-plus text-primary small"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label">Language</label>
                                        <div className="d-flex gap-2">
                                            <select className="form-select form-select-sm" name="language" value={formData.language} onChange={handleChange}>
                                                {languages.map(l => <option key={l._id} value={l._id}>{l.language}</option>)}
                                            </select>
                                            <button type="button" className="btn btn-white border px-2 py-0" onClick={() => setIsAddLanguageModalOpen(true)}>
                                                <i className="fa-solid fa-plus text-primary small"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">Level</label>
                                        <div className="d-flex gap-2">
                                            <select className="form-select form-select-sm" name="level" value={formData.level} onChange={handleChange}>
                                                {levels.map(lv => <option key={lv._id} value={lv._id}>{lv.course_level}</option>)}
                                            </select>
                                            <button type="button" className="btn btn-white border px-2 py-0" onClick={() => setIsAddLevelModalOpen(true)}>
                                                <i className="fa-solid fa-plus text-primary small"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="studio-card p-3 border">
                                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                                    <i className="fa-solid fa-calendar-alt text-danger small"></i>
                                    <span className="compact-section-header">Scheduling</span>
                                </div>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label">Start Date</label>
                                        <input type="date" className="form-control form-control-sm" name="start_date" value={formData.start_date} onChange={handleChange} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">End Date</label>
                                        <input type="date" className="form-control form-control-sm" name="end_date" value={formData.end_date} onChange={handleChange} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Max Students</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-users"></i></span>
                                            <input type="number" className="form-control border-start-0 ps-0" name="max_enrollment" value={formData.max_enrollment} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Modals */}
            {isAddSubcategoryModalOpen && <CreateSubCategoryModal setIsAddSubcategoryModalOpen={setIsAddSubcategoryModalOpen} />}
            {isAddCategoryModalOpen && <CreateCategoryModal setIsAddCategoryModalOpen={setIsAddCategoryModalOpen} />}
            {isAddLanguageModalOpen && <CreateLanguageModal setIsAddLanguageModalOpen={setIsAddLanguageModalOpen} />}
            {isAddLevelModalOpen && <CreateLevelModal setIsAddLevelModalOpen={setIsAddLevelModalOpen} />}
        </div>
    );
};

export default EditCoursePage;
