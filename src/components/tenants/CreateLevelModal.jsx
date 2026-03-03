import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createLevel,
    deleteLevel,
    fetchLevels,
    updateLevel,
} from "@/redux/course.slice";
import toast from "react-hot-toast";

const CreateLevelModal = ({ setIsAddLevelModalOpen }) => {
    const dispatch = useDispatch();
    const { levels } = useSelector((state) => state.course);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [editingLevelId, setEditingLevelId] = useState("");
    const [editLevelName, setEditLevelName] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState("");

    const [formData, setFormData] = useState({
        course_level: "",
    });

    useEffect(() => {
        dispatch(fetchLevels());
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
                setFormData({
                    course_level: "",
                });
                dispatch(fetchLevels());
            } else if (createLevel.rejected.match(response)) {
                const errorMessage =
                    response.payload?.message || "Failed to create level";
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Error creating level:", error);
            toast.error("Failed to create level. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startEditLevel = (lvl) => {
        setEditingLevelId(lvl._id);
        setEditLevelName(lvl.course_level || "");
    };

    const cancelEditLevel = () => {
        setEditingLevelId("");
        setEditLevelName("");
    };

    const saveLevelUpdate = async (levelId) => {
        const nextLevelName = editLevelName.trim();
        if (!nextLevelName) return;

        try {
            setActionLoadingId(levelId);
            const response = await dispatch(
                updateLevel({ levelId, course_level: nextLevelName })
            );
            if (updateLevel.fulfilled.match(response)) {
                cancelEditLevel();
            }
        } finally {
            setActionLoadingId("");
        }
    };

    const removeLevel = async (levelId) => {
        const confirmed = window.confirm(
            "Delete this level? If it is used in courses, deletion will be blocked."
        );
        if (!confirmed) return;

        try {
            setActionLoadingId(levelId);
            await dispatch(deleteLevel(levelId));
        } finally {
            setActionLoadingId("");
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
                <div
                    className="modal-dialog modal-dialog-centered"
                    style={{ maxWidth: "500px" }}
                >
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pt-4 px-4">
                            <h5 className="modal-title fw-bold">Manage Course Levels</h5>
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
                                        htmlFor="course_level"
                                        className="form-label small fw-bold text-muted text-uppercase"
                                    >
                                        New Level Name
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className={`form-control border-light-subtle bg-light ${errors.course_level ? "is-invalid" : ""
                                                }`}
                                            id="course_level"
                                            name="course_level"
                                            value={formData.course_level}
                                            onChange={handleChange}
                                            placeholder="e.g. Beginner, Intermediate, Advanced"
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                border: "none",
                                            }}
                                            disabled={loading || !formData.course_level.trim()}
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                "Add"
                                            )}
                                        </button>
                                    </div>
                                    {errors.course_level && (
                                        <div className="invalid-feedback d-block">
                                            {errors.course_level}
                                        </div>
                                    )}
                                </div>

                                <hr className="my-4" />

                                <div>
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-3">
                                        Existing Levels
                                    </label>
                                    <div
                                        className="border rounded-3 p-2 bg-light bg-opacity-50"
                                        style={{ maxHeight: "250px", overflowY: "auto" }}
                                    >
                                        {levels?.length ? (
                                            levels.map((lvl) => {
                                                const isEditing = editingLevelId === lvl._id;
                                                const isBusy = actionLoadingId === lvl._id;
                                                return (
                                                    <div
                                                        key={lvl._id}
                                                        className="d-flex align-items-center justify-content-between gap-2 py-2 px-2 border-bottom last-border-0"
                                                    >
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={editLevelName}
                                                                onChange={(e) =>
                                                                    setEditLevelName(e.target.value)
                                                                }
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="small fw-semibold text-dark">
                                                                {lvl.course_level}
                                                            </span>
                                                        )}
                                                        <div className="d-flex gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-success py-1"
                                                                        onClick={() => saveLevelUpdate(lvl._id)}
                                                                        disabled={
                                                                            isBusy || !editLevelName.trim()
                                                                        }
                                                                    >
                                                                        <i className="fa-solid fa-check"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-secondary py-1"
                                                                        onClick={cancelEditLevel}
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
                                                                        onClick={() => startEditLevel(lvl)}
                                                                        disabled={isBusy}
                                                                    >
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger py-1"
                                                                        style={{ border: "none" }}
                                                                        onClick={() => removeLevel(lvl._id)}
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
                                                No levels found.
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

export default CreateLevelModal;
