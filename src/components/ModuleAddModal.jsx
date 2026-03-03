import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Lessons from "../pages/courses/Lessons";
import { fetchModulesByCourseId } from "../redux/course.slice";
import { useDispatch, useSelector } from "react-redux";

const ModuleAddModal = ({
  setIsAddModuleSectionOpen,
  courseId,
  courseTitle,
}) => {
  const { modules } = useSelector((state) => state.course);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchModulesByCourseId(courseId));
  }, [courseId, dispatch]);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) setIsAddModuleSectionOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setIsAddModuleSectionOpen]);

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal-container">
        {/* Modal Header */}
        <div className="modern-modal-header">
          <div className="header-content">
            <div className="bg-soft-primary p-2 rounded-3 me-3">
              <i className="fa-solid fa-layer-group text-primary fs-4"></i>
            </div>
            <div>
              <h5 className="modal-title fw-bold text-dark mb-0">Course Curriculum</h5>
              <small className="text-muted">{courseTitle}</small>
            </div>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={() => setIsAddModuleSectionOpen(false)}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modern-modal-body">
          <Lessons
            modules={modules}
            courseId={courseId}
            courseTitle={courseTitle}
          />
        </div>

        {/* Modal Footer */}
        <div className="modern-modal-footer">
          <button
            type="button"
            className="btn btn-light px-4 fw-semibold border"
            onClick={() => setIsAddModuleSectionOpen(false)}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary px-4 fw-bold"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            onClick={() => setIsAddModuleSectionOpen(false)}
          >
            Done
          </button>
        </div>
      </div>

      <style jsx>{`
        .modern-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }
        .modern-modal-container {
          background: #f8fafc;
          width: 95%;
          max-width: 1200px;
          height: 90vh;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modern-modal-header {
          background: white;
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
        }
        .header-content {
          display: flex;
          align-items: center;
        }
        .bg-soft-primary { background: #eef2ff; }
        .close-btn {
          background: transparent;
          border: none;
          font-size: 1.25rem;
          color: #64748b;
          transition: all 0.2s;
          padding: 0.5rem;
          border-radius: 50%;
        }
        .close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .modern-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }
        .modern-modal-footer {
          background: white;
          padding: 1.25rem 2rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ModuleAddModal;
