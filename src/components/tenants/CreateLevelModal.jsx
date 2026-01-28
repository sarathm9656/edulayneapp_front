import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createLevel } from "@/redux/course.slice";
import toast from "react-hot-toast";

const CreateLevelModal = ({ setIsAddLevelModalOpen }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        course_level: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.course_level.trim()) {
            newErrors.course_level = "Level name is required";
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
            setErrors({});

            const response = await dispatch(createLevel(formData.course_level));

            if (createLevel.fulfilled.match(response)) {
                setIsAddLevelModalOpen(false);
                // Reset form
                setFormData({
                    course_level: "",
                });
            } else if (createLevel.rejected.match(response)) {
                const errorMessage = response.payload?.message || "Failed to create level";
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Error creating level:", error);
            toast.error("Failed to create level. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsAddLevelModalOpen(false);
    };

    return (
        <>
            <div
                className="modal-backdrop fade show"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 2040,
                }}
                onClick={handleClose}
            ></div>

            <div
                className="modal fade show d-block"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 2050,
                    overflow: "auto",
                }}
                tabIndex="-1"
                role="dialog"
            >
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "450px" }}>
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pt-4 px-4">
                            <h5 className="modal-title fw-bold">Add Course Level</h5>
                            <button type="button" className="btn-close shadow-none" onClick={handleClose}></button>
                        </div>
                        <div className="modal-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="course_level" className="form-label small fw-bold text-muted text-uppercase">Level Name</label>
                                    <input
                                        type="text"
                                        className={`form-control border-light-subtle bg-light ${errors.course_level ? "is-invalid" : ""}`}
                                        id="course_level"
                                        name="course_level"
                                        value={formData.course_level}
                                        onChange={handleChange}
                                        placeholder="e.g. Beginner, Intermediate, Advanced"
                                        required
                                    />
                                    {errors.course_level && <div className="invalid-feedback">{errors.course_level}</div>}
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-top-0 pb-4 px-4">
                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={handleClose}>Cancel</button>
                            <button
                                type="button"
                                className="btn btn-primary rounded-pill px-4"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Adding..." : "Add Level"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateLevelModal;
