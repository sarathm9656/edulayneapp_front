import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createLanguage,
    deleteLanguage,
    fetchLanguages,
    updateLanguage,
} from "@/redux/course.slice";
import toast from "react-hot-toast";

const CreateLanguageModal = ({ setIsAddLanguageModalOpen }) => {
    const dispatch = useDispatch();
    const { languages } = useSelector((state) => state.course);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [editingLanguageId, setEditingLanguageId] = useState("");
    const [editLanguageName, setEditLanguageName] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState("");

    const [formData, setFormData] = useState({
        language: "",
    });

    useEffect(() => {
        dispatch(fetchLanguages());
    }, [dispatch]);

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
                // We don't necessarily close the modal if they want to add more,
                // but given the existing logic it closes.
                // For taxonomies, usually we let them manage multiple.
                setFormData({
                    language: "",
                });
                dispatch(fetchLanguages());
            } else if (createLanguage.rejected.match(response)) {
                const errorMessage =
                    response.payload?.message || "Failed to create language";
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Error creating language:", error);
            toast.error("Failed to create language. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startEditLanguage = (lang) => {
        setEditingLanguageId(lang._id);
        setEditLanguageName(lang.language || "");
    };

    const cancelEditLanguage = () => {
        setEditingLanguageId("");
        setEditLanguageName("");
    };

    const saveLanguageUpdate = async (languageId) => {
        const nextLanguageName = editLanguageName.trim();
        if (!nextLanguageName) return;

        try {
            setActionLoadingId(languageId);
            const response = await dispatch(
                updateLanguage({ languageId, language: nextLanguageName })
            );
            if (updateLanguage.fulfilled.match(response)) {
                cancelEditLanguage();
            }
        } finally {
            setActionLoadingId("");
        }
    };

    const removeLanguage = async (languageId) => {
        const confirmed = window.confirm(
            "Delete this language? If it is used in courses, deletion will be blocked."
        );
        if (!confirmed) return;

        try {
            setActionLoadingId(languageId);
            await dispatch(deleteLanguage(languageId));
        } finally {
            setActionLoadingId("");
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
                <div
                    className="modal-dialog modal-dialog-centered"
                    style={{ maxWidth: "500px" }}
                >
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pt-4 px-4">
                            <h5 className="modal-title fw-bold">Manage Course Languages</h5>
                            <button
                                type="button"
                                className="btn-close shadow-none"
                                onClick={handleClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: '#000',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    lineHeight: '1',
                                    opacity: '0.75'
                                }}
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="language"
                                        className="form-label small fw-bold text-muted text-uppercase"
                                    >
                                        New Language Name
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className={`form-control border-light-subtle bg-light ${errors.language ? "is-invalid" : ""
                                                }`}
                                            id="language"
                                            name="language"
                                            value={formData.language}
                                            onChange={handleChange}
                                            placeholder="e.g. English, Spanish, Malayalam"
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                border: "none",
                                            }}
                                            disabled={loading || !formData.language.trim()}
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                "Add"
                                            )}
                                        </button>
                                    </div>
                                    {errors.language && (
                                        <div className="invalid-feedback d-block">
                                            {errors.language}
                                        </div>
                                    )}
                                </div>

                                <hr className="my-4" />

                                <div>
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-3">
                                        Existing Languages
                                    </label>
                                    <div
                                        className="border rounded-3 p-2 bg-light bg-opacity-50"
                                        style={{ maxHeight: "250px", overflowY: "auto" }}
                                    >
                                        {languages?.length ? (
                                            languages.map((lang) => {
                                                const isEditing = editingLanguageId === lang._id;
                                                const isBusy = actionLoadingId === lang._id;
                                                return (
                                                    <div
                                                        key={lang._id}
                                                        className="d-flex align-items-center justify-content-between gap-2 py-2 px-2 border-bottom last-border-0"
                                                    >
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={editLanguageName}
                                                                onChange={(e) =>
                                                                    setEditLanguageName(e.target.value)
                                                                }
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="small fw-semibold text-dark">
                                                                {lang.language}
                                                            </span>
                                                        )}
                                                        <div className="d-flex gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-success py-1"
                                                                        onClick={() => saveLanguageUpdate(lang._id)}
                                                                        disabled={
                                                                            isBusy || !editLanguageName.trim()
                                                                        }
                                                                    >
                                                                        <i className="fa-solid fa-check"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-secondary py-1"
                                                                        onClick={cancelEditLanguage}
                                                                        disabled={isBusy}
                                                                    >
                                                                        <i className="fa-solid fa-times"></i>
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary py-1"
                                                                        style={{ border: "none" }}
                                                                        onClick={() => startEditLanguage(lang)}
                                                                        disabled={isBusy}
                                                                    >
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger py-1"
                                                                        style={{ border: "none" }}
                                                                        onClick={() => removeLanguage(lang._id)}
                                                                        disabled={isBusy}
                                                                    >
                                                                        <i className="fa-solid fa-trash-can"></i>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-4 text-muted small">
                                                No languages found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-top-0 pb-4 px-4">
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4 fw-bold"
                                onClick={handleClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
        .last-border-0:last-child { border-bottom: 0 !important; }
      `}</style>
        </>
    );
};

export default CreateLanguageModal;
