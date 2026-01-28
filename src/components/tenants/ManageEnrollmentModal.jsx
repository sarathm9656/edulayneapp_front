import React, { useState, useEffect } from "react";
import api from "@/api/axiosInstance";
import { toast } from "react-toastify";

const ManageEnrollmentModal = ({ show, onHide, student, onSuccess }) => {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Selection State
    const [selectedCourseIds, setSelectedCourseIds] = useState(new Set());
    const [selectedBatchMap, setSelectedBatchMap] = useState({}); // courseId -> batchId

    useEffect(() => {
        if (show) {
            fetchData();
            initializeSelections();
        }
    }, [show, student]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, batchesRes] = await Promise.all([
                api.get("/courses?limit=100"),
                api.get("/batch")
            ]);

            const coursesData = coursesRes.data.data || [];
            const batchesData = batchesRes.data.data || batchesRes.data || [];

            setCourses(coursesData);
            setBatches(batchesData);
        } catch (error) {
            console.error("Error fetching enrollment data:", error);
            toast.error("Failed to load active courses and batches");
        } finally {
            setLoading(false);
        }
    };

    const initializeSelections = () => {
        if (!student) return;

        const courseIds = new Set();
        const batchMap = {};

        // Pre-select enrolled courses
        if (student.enrolledCourses) {
            student.enrolledCourses.forEach(c => {
                // c is course object with _id, or just contains _id property?
                const cId = c.course_id?._id || c._id; // Handle populated vs flat
                if (cId) courseIds.add(cId.toString());
            });
        }

        // Pre-select enrolled batches
        if (student.enrolledBatches) {
            student.enrolledBatches.forEach(b => {
                // b is batch object mixed with enrollment props. Batch ID is b._id
                const bId = b._id;
                const cId = b.course_id?._id || b.course_id; // Batch refers to course

                if (bId && cId) {
                    batchMap[cId.toString()] = bId.toString();
                    // Ensure course is selected if batch is selected
                    courseIds.add(cId.toString());
                }
            });
        }

        setSelectedCourseIds(courseIds);
        setSelectedBatchMap(batchMap);
    };

    const handleCourseCheck = (courseId) => {
        const newSet = new Set(selectedCourseIds);
        const newBatchMap = { ...selectedBatchMap };

        if (newSet.has(courseId)) {
            newSet.delete(courseId);
            // Also remove associated batch selection
            delete newBatchMap[courseId];
        } else {
            newSet.add(courseId);
        }
        setSelectedCourseIds(newSet);
        setSelectedBatchMap(newBatchMap);
    };

    const handleBatchSelect = (courseId, batchId) => {
        const newBatchMap = { ...selectedBatchMap };
        if (batchId) {
            newBatchMap[courseId] = batchId;
        } else {
            delete newBatchMap[courseId];
        }
        setSelectedBatchMap(newBatchMap);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const courseIdsPayload = Array.from(selectedCourseIds);
            const batchIdsPayload = Object.values(selectedBatchMap);

            console.log("Updating enrollments:", { courseIds: courseIdsPayload, batchIds: batchIdsPayload });

            const response = await api.put(`/tenants/students/${student._id}`, {
                courseIds: courseIdsPayload,
                batchIds: batchIdsPayload
            });

            if (response.data.success) {
                toast.success("Enrollments updated successfully");
                if (onSuccess) onSuccess();
                onHide();
            } else {
                toast.error(response.data.message || "Failed to update enrollments");
            }
        } catch (error) {
            console.error("Error saving enrollments:", error);
            toast.error(error.response?.data?.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1040,
                }}
                onClick={onHide}
            ></div>

            {/* Modal */}
            <div
                className="modal fade show d-block"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1050,
                    paddingRight: "17px", // Mimic bootstrap modal padding
                    overflow: "auto"
                }}
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title fw-bold">Manage Enrollments</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={onHide}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body pt-0 mt-3">
                            <p className="text-muted small mb-4">Add or remove courses and batches for {student?.fname} {student?.lname}</p>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                    {courses.length === 0 ? (
                                        <div className="text-center text-muted py-4">No active courses found.</div>
                                    ) : (
                                        courses.map(course => {
                                            const isSelected = selectedCourseIds.has(course._id);
                                            const courseBatches = batches.filter(b => (b.course_id?._id || b.course_id) === course._id && b.status === 'active');
                                            const selectedBatch = selectedBatchMap[course._id] || "";

                                            return (
                                                <div key={course._id} className={`p-3 mb-2 rounded-3 border transition-all ${isSelected ? 'border-primary bg-primary-subtle' : 'border-light bg-light hover-bg-gray-100'}`} style={{ backgroundColor: isSelected ? 'rgba(13, 110, 253, 0.05)' : '' }}>
                                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                                        <div className="form-check flex-grow-1">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`course-${course._id}`}
                                                                checked={isSelected}
                                                                onChange={() => handleCourseCheck(course._id)}
                                                            />
                                                            <label className="form-check-label w-100" htmlFor={`course-${course._id}`}>
                                                                <div className="fw-bold text-dark">{course.course_title}</div>
                                                                <div className="small text-muted">{course.category?.category} • {course.level?.level}</div>
                                                            </label>
                                                        </div>

                                                        {/* Batch Dropdown (Only visible if course is selected) */}
                                                        {isSelected && (
                                                            <div style={{ minWidth: '250px' }}>
                                                                <select
                                                                    className="form-select form-select-sm shadow-none border-secondary-subtle"
                                                                    value={selectedBatch}
                                                                    onChange={(e) => handleBatchSelect(course._id, e.target.value)}
                                                                >
                                                                    <option value="">-- Select Batch (Optional) --</option>
                                                                    {courseBatches.map(batch => (
                                                                        <option key={batch._id} value={batch._id}>
                                                                            {batch.batch_name} ({batch.start_time || "Time N/A"})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {courseBatches.length === 0 && (
                                                                    <div className="text-muted small mt-1"><i className="fa-solid fa-circle-info me-1"></i>No active batches</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-0 pt-0">
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4"
                                onClick={onHide}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary rounded-pill px-4"
                                onClick={handleSave}
                                disabled={saving || loading}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManageEnrollmentModal;
