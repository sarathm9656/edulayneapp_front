import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createModuleAndAssignToCourse, fetchModulesByCourseId } from "@/redux/course.slice";
import { toast } from "react-hot-toast";
import { FaLayerGroup, FaTimes } from "react-icons/fa";

const AddSectionModal = ({ isOpen, onClose, courseId }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        module_title: "",
        module_description: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.module_title || !formData.module_description) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const moduleData = {
                ...formData,
                course_id: courseId,
            };

            await dispatch(createModuleAndAssignToCourse(moduleData));
            dispatch(fetchModulesByCourseId(courseId));
            toast.success("Section added successfully");
            setFormData({ module_title: "", module_description: "" });
            onClose();
        } catch (error) {
            toast.error("Failed to add section");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="section-modal-overlay">
            <div className="section-modal-container animate-pop-in">
                <div className="modal-header">
                    <div className="d-flex align-items-center gap-3">
                        <div className="icon-box">
                            <FaLayerGroup />
                        </div>
                        <div>
                            <h5 className="modal-title">New Curriculum Section</h5>
                            <p className="modal-subtitle">Organize your course content into logical blocks</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} disabled={loading}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-4">
                            <label className="form-label">Section Title</label>
                            <input
                                type="text"
                                name="module_title"
                                className="form-control premium-input"
                                placeholder="e.g. Introduction to Game Theory"
                                value={formData.module_title}
                                onChange={handleChange}
                                autoFocus
                                required
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label">Learning Objective</label>
                            <textarea
                                name="module_description"
                                className="form-control premium-input"
                                rows="3"
                                placeholder="What will students learn in this section?"
                                value={formData.module_description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Section"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
        .section-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .section-modal-container {
          background: white;
          width: 100%;
          max-width: 550px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: #f8fafc;
        }

        .icon-box {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          font-size: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .modal-title {
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          font-size: 1.1rem;
          letter-spacing: -0.01em;
        }

        .modal-subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #ef4444;
        }

        .modal-body {
          padding: 32px;
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          display: block;
        }

        .premium-input {
          padding: 12px 16px;
          border-radius: 12px;
          border: 2px solid #f1f5f9;
          background: #fcfdfe;
          font-weight: 500;
          color: #334155;
          transition: all 0.2s;
          width: 100%;
          font-size: 0.95rem;
        }

        .premium-input:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
          background: white;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
        }

        .btn-cancel {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          color: #64748b;
          background: white;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-submit {
          padding: 12px 32px;
          border-radius: 12px;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border: none;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
          transition: all 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .animate-pop-in {
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default AddSectionModal;
