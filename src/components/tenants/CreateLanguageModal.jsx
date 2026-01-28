import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createLanguage } from "@/redux/course.slice";
import toast from "react-hot-toast";

const CreateLanguageModal = ({ setIsAddLanguageModalOpen }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        language: "",
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

        if (!formData.language.trim()) {
            newErrors.language = "Language name is required";
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

            const response = await dispatch(createLanguage(formData.language));

            if (createLanguage.fulfilled.match(response)) {
                setIsAddLanguageModalOpen(false);
                // toast.success("Language created successfully"); // Handled in slice

                // Reset form
                setFormData({
                    language: "",
                });
            } else if (createLanguage.rejected.match(response)) {
                const errorMessage = response.payload?.message || "Failed to create language";
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Error creating language:", error);
            toast.error("Failed to create language. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsAddLanguageModalOpen(false);
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
                            <h5 className="modal-title fw-bold">Add Course Language</h5>
                            <button type="button" className="btn-close shadow-none" onClick={handleClose}></button>
                        </div>
                        <div className="modal-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="language" className="form-label small fw-bold text-muted text-uppercase">Language Name</label>
                                    <input
                                        type="text"
                                        className={`form-control border-light-subtle bg-light ${errors.language ? "is-invalid" : ""}`}
                                        id="language"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        placeholder="e.g. English, Spanish, Malayalam"
                                        required
                                    />
                                    {errors.language && <div className="invalid-feedback">{errors.language}</div>}
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
                                {loading ? "Adding..." : "Add Language"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateLanguageModal;
