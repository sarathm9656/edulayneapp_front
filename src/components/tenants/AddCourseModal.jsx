import axios from "axios";
import React, { useEffect, useState } from "react";
import CreateSubCategoryModal from "../CreateSubCategoryModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchSubcategories,
  fetchLevels,
  fetchLanguages,
  createCourse,
  fetchSubcategoriesByCategory,
  fetchCourses,
} from "@/redux/course.slice";
import { XIcon } from "lucide-react";
import toast from "react-hot-toast";
import CreateCategoryModal from "./CreateCategoryModal";
import CreateLanguageModal from "./CreateLanguageModal";
import CreateLevelModal from "./CreateLevelModal";

const AddCourseModal = ({ setIsAddCourseModalOpen }) => {
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

  // drop down values are stored only after it is changed
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
    image: "",
  });

  console.log(formData, "formdata to be submitted");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
    dispatch(fetchLevels());
    dispatch(fetchLanguages());
  }, [dispatch]);

  // check the date is not previous and
  // start date should be before end date

  function checkDate() {
    // Zero out the time for accurate date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(formData.start_date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(formData.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error("Start date cannot be in the past");
      console.log("start date is in the past");
      return false;
    }
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      console.log("start date is after end date");
      return false;
    }
    return true;
  }

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.course_title.trim()) {
      newErrors.course_title = "Course title is required";
    }

    if (!formData.short_description.trim()) {
      newErrors.short_description = "Short description is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.subcategory) {
      newErrors.subcategory = "Subcategory is required";
    }

    if (!formData.language) {
      newErrors.language = "Language is required";
    }

    if (!formData.level) {
      newErrors.level = "Level is required";
    }

    if (!formData.max_enrollment || formData.max_enrollment <= 0) {
      newErrors.max_enrollment = "Max enrollment must be greater than 0";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (!formData.image || !(formData.image instanceof File)) {
      newErrors.image = "Course image is required";
    }

    return newErrors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(formData.image.type)) {
      toast.error(
        "Please select a valid image file (JPEG, PNG, GIF, WebP, BMP, SVG)"
      );
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (formData.image.size > maxSize) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    if (!checkDate()) {
      console.log("checkDate error");
      toast.error("Please check the date");
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      console.log("Submitting course data:", formData);

      const courseData = {
        ...formData,
        category: formData.category,
        subcategory: formData.subcategory,
        language: formData.language,
        level: formData.level,
        image: formData.image,
      };

      const result = await dispatch(createCourse(courseData));

      if (createCourse.fulfilled.match(result)) {
        dispatch(fetchCourses());
        setIsAddCourseModalOpen(false);
        toast.success("Course added successfully");

        // Reset form
        setFormData({
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
          image: "",
        });
      } else if (createCourse.rejected.match(result)) {
        const errorMessage =
          result.payload?.message || "Failed to create course";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch related categpries on list or list all categories

    if (formData.category) {
      dispatch(fetchSubcategoriesByCategory(formData.category));
    }
  }, [formData.category]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file, "file inside the handleImageChange");
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
    // Clear error when user selects a file
    if (errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const handleClose = () => {
    console.log("Closing modal");
    setIsAddCourseModalOpen(false);
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="course-builder-overlay shadow-lg"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#f8fafc",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Outfit', sans-serif"
        }}
      >

        {/* Premium Header */}
        <div className="bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between shadow-sm sticky-top">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
              <i className="fa-solid fa-graduation-cap fs-4"></i>
            </div>
            <div>
              <h4 className="fw-bold text-dark mb-0">Create New Course</h4>
              <p className="text-muted small mb-0">Fill in the details to launch your education journey</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light px-4 fw-bold border" onClick={handleClose}>Discard</button>
            <button
              className="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2"
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            >
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa-solid fa-rocket"></i>}
              Launch Course
            </button>
          </div>
        </div>

        {/* Main Interface Content */}
        <div className="container-fluid flex-grow-1 overflow-auto py-5">
          <div className="row justify-content-center h-100">
            <div className="col-xl-9">
              <div className="row g-4">
                {/* Left Column: Basic Info */}
                <div className="col-lg-7">
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                      <div className="bg-soft-primary p-2 rounded-2 text-primary" style={{ fontSize: '12px' }}><i className="fa-solid fa-info-circle"></i></div>
                      General Information
                    </h6>
                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted text-uppercase">Course Title *</label>
                      <input
                        type="text"
                        className={`form-control form-control-lg border shadow-none ${errors.course_title ? "is-invalid" : ""}`}
                        name="course_title"
                        value={formData.course_title}
                        onChange={handleChange}
                        placeholder="e.g. Advanced Sicilian Defense Tactics"
                      />
                      {errors.course_title && <div className="invalid-feedback">{errors.course_title}</div>}
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted text-uppercase">One-line Summary *</label>
                      <input
                        type="text"
                        className={`form-control border shadow-none ${errors.short_description ? "is-invalid" : ""}`}
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleChange}
                        placeholder="Quick summary for the course feed..."
                      />
                      {errors.short_description && <div className="invalid-feedback">{errors.short_description}</div>}
                    </div>

                    <div className="mb-0">
                      <label className="form-label small fw-bold text-muted text-uppercase">Full Course Description *</label>
                      <textarea
                        className={`form-control border shadow-none ${errors.description ? "is-invalid" : ""}`}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="6"
                        placeholder="Detailed overview of what students will achieve..."
                      />
                      {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                    </div>
                  </div>

                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                      <div className="bg-soft-primary p-2 rounded-2 text-primary" style={{ fontSize: '12px' }}><i className="fa-solid fa-calendar"></i></div>
                      Timeline & Enrollment
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">Start Date *</label>
                        <input type="date" className={`form-control border shadow-none ${errors.start_date ? "is-invalid" : ""}`} name="start_date" value={formData.start_date} onChange={handleChange} />
                        {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">End Date *</label>
                        <input type="date" className={`form-control border shadow-none ${errors.end_date ? "is-invalid" : ""}`} name="end_date" value={formData.end_date} onChange={handleChange} />
                        {errors.end_date && <div className="invalid-feedback">{errors.end_date}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">Seat Capacity *</label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 bg-white"><i className="fa-solid fa-users text-muted small"></i></span>
                          <input type="number" className={`form-control border-start-0 border shadow-none ${errors.max_enrollment ? "is-invalid" : ""}`} name="max_enrollment" value={formData.max_enrollment} onChange={handleChange} />
                        </div>
                        {errors.max_enrollment && <div className="invalid-feedback d-block">{errors.max_enrollment}</div>}
                      </div>
                      <div className="col-md-6 d-flex align-items-end pb-2">
                        <div className="form-check form-switch card bg-light border-0 p-3 flex-grow-1 ms-0">
                          <input className="form-check-input ms-0" type="checkbox" id="drip_content_enabled" name="drip_content_enabled" checked={formData.drip_content_enabled} onChange={handleChange} />
                          <label className="form-check-label ms-1 fw-bold text-muted small text-uppercase" htmlFor="drip_content_enabled">Drip Content Enable</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Media & Classification */}
                <div className="col-lg-5">
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                      <div className="bg-soft-primary p-2 rounded-2 text-primary" style={{ fontSize: '12px' }}><i className="fa-solid fa-image"></i></div>
                      Course Presentation
                    </h6>
                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted text-uppercase">Cover Image *</label>
                      <div className={`image-upload-zone border-2 border-dashed rounded-4 p-4 text-center cursor-pointer transition-all ${errors.image ? "border-danger bg-danger bg-opacity-10" : "bg-light hover-bg-light-dark"}`} onClick={() => document.getElementById('course-image-input').click()}>
                        {formData.image ? (
                          <div className="preview-container position-relative">
                            <img src={URL.createObjectURL(formData.image)} className="rounded-3 shadow-sm mb-3" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'cover' }} />
                            <div className="mt-2 small fw-bold text-primary">{formData.image.name}</div>
                            <button className="btn btn-sm btn-dark rounded-circle position-absolute top-0 end-0 m-1" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image: '' }); }}>
                              <i className="fa-solid fa-times"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="py-4">
                            <i className="fa-solid fa-cloud-arrow-up text-muted mb-3 fs-1 opacity-50"></i>
                            <div className="fw-bold text-dark">Click to upload thumbnail</div>
                            <div className="text-muted small">Supports JPG, PNG, WEBP (Max 5MB)</div>
                          </div>
                        )}
                        <input type="file" id="course-image-input" className="d-none" name="image" onChange={handleImageChange} accept="image/*" />
                      </div>
                      {errors.image && <div className="text-danger small mt-2 fw-medium">{errors.image}</div>}
                    </div>
                  </div>

                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                      <div className="bg-soft-primary p-2 rounded-2 text-primary" style={{ fontSize: '12px' }}><i className="fa-solid fa-tags"></i></div>
                      Classification
                    </h6>
                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted text-uppercase">Primary Category</label>
                      <div className="input-group">
                        <select className={`form-select border shadow-none ${errors.category ? "is-invalid" : ""}`} name="category" value={formData.category} onChange={handleChange}>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c._id} value={c._id}>{c.category}</option>)}
                        </select>
                        <button className="btn btn-light border" onClick={() => setIsAddCategoryModalOpen(true)} type="button"><i className="fa-solid fa-plus"></i></button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted text-uppercase">Sub-Category</label>
                      <div className="input-group">
                        <select className={`form-select border shadow-none ${errors.subcategory ? "is-invalid" : ""}`} name="subcategory" value={formData.subcategory} onChange={handleChange}>
                          <option value="">Select Subcategory</option>
                          {subcategories.map(s => <option key={s._id} value={s._id}>{s.subcategory_name}</option>)}
                        </select>
                        <button className="btn btn-light border" onClick={() => setIsAddSubcategoryModalOpen(true)} type="button"><i className="fa-solid fa-plus"></i></button>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">Language</label>
                        <div className="input-group shadow-none">
                          <select className={`form-select border shadow-none ${errors.language ? "is-invalid" : ""}`} name="language" value={formData.language} onChange={handleChange}>
                            <option value="">Select</option>
                            {languages.map(l => <option key={l._id} value={l._id}>{l.language}</option>)}
                          </select>
                          <button className="btn btn-light border btn-sm" onClick={() => setIsAddLanguageModalOpen(true)} type="button" style={{ padding: '0.25rem 0.5rem' }}><i className="fa-solid fa-plus small"></i></button>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">Level</label>
                        <div className="input-group shadow-none">
                          <select className={`form-select border shadow-none ${errors.level ? "is-invalid" : ""}`} name="level" value={formData.level} onChange={handleChange}>
                            <option value="">Select</option>
                            {levels.map(lv => <option key={lv._id} value={lv._id}>{lv.course_level}</option>)}
                          </select>
                          <button className="btn btn-light border btn-sm" onClick={() => setIsAddLevelModalOpen(true)} type="button" style={{ padding: '0.25rem 0.5rem' }}><i className="fa-solid fa-plus small"></i></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-soft-primary { background-color: #eef2ff !important; }
        .hover-bg-light-dark:hover { background-color: #edf2f7 !important; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .form-control:focus, .form-select:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
        }
        .image-upload-zone:hover {
          border-color: #667eea !important;
        }
      `}</style>

      {/* Nested Modals */}
      {isAddSubcategoryModalOpen && (
        <CreateSubCategoryModal
          setIsAddSubcategoryModalOpen={setIsAddSubcategoryModalOpen}
        />
      )}
      {isAddCategoryModalOpen && (
        <CreateCategoryModal
          setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
        />
      )}
      {isAddLanguageModalOpen && (
        <CreateLanguageModal
          setIsAddLanguageModalOpen={setIsAddLanguageModalOpen}
        />
      )}
      {isAddLevelModalOpen && (
        <CreateLevelModal
          setIsAddLevelModalOpen={setIsAddLevelModalOpen}
        />
      )}
    </>
  );
};

export default AddCourseModal;
