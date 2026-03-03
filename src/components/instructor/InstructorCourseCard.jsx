import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const InstructorCourseCard = ({ course }) => {
  const { course_title, is_active, image, category, level, description } = course;
  const api_url = useMemo(() => import.meta.env.VITE_API_URL, []);

  const imageSrc = useMemo(() => {
    if (!image) return "/img/chessthumbnail.jpg";
    return `${api_url}/uploads/courses/${image}`;
  }, [image, api_url]);

  return (
    <div className="course-card-premium">
      <div className="card-image-wrapper">
        <img src={imageSrc} alt={course_title} className="course-image" />
        <div className="card-badges">
          <span className={`badge-status ${is_active ? "active" : "inactive"}`}>
            {is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="card-overlay">
          <Link to={`/instructor/view-course-details-instructor/${course._id}`} className="btn-view-overlay">
            View Details
          </Link>
        </div>
      </div>

      <div className="card-content">
        <div className="card-meta">
          <span className="meta-category">{category?.category || "General"}</span>
          <span className="meta-dot">•</span>
          <span className="meta-level">{level?.course_level || "All Levels"}</span>
        </div>

        <h5 className="course-title" title={course_title}>{course_title}</h5>

        <p className="course-description">
          {description || "No description provided for this course."}
        </p>

        <div className="card-footer-actions">
          <Link to={`/instructor/curriculum/${course._id}`} className="btn-action primary">
            <i className="fa-solid fa-layer-group"></i> Curriculum
          </Link>
          <Link to={`/instructor/view-course-details-instructor/${course._id}`} className="btn-action secondary">
            <i className="fa-solid fa-chart-simple"></i> Analytics
          </Link>
        </div>
      </div>

      <style>{`
        .course-card-premium {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .course-card-premium:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #e2e8f0;
        }

        .card-image-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .course-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .course-card-premium:hover .course-image {
          transform: scale(1.05);
        }

        .card-badges {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
        }

        .badge-status {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          backdrop-filter: blur(4px);
        }

        .badge-status.active {
          background: rgba(16, 185, 129, 0.9);
          color: white;
        }

        .badge-status.inactive {
          background: rgba(100, 116, 139, 0.9);
          color: white;
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .course-card-premium:hover .card-overlay {
          opacity: 1;
        }

        .btn-view-overlay {
          background: white;
          color: #0f172a;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          text-decoration: none;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .course-card-premium:hover .btn-view-overlay {
          transform: translateY(0);
        }

        .card-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
        }

        .meta-category {
          color: #4f46e5;
        }

        .course-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .course-description {
          font-size: 0.875rem;
          color: #94a3b8;
          margin-bottom: 20px;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .card-footer-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: auto;
        }

        .btn-action {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-action.primary {
          background: #fcfdfe;
          border: 1px solid #e2e8f0;
          color: #4f46e5;
        }

        .btn-action.primary:hover {
          border-color: #4f46e5;
          background: #f5f3ff;
        }

        .btn-action.secondary {
          background: #fcfdfe;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }

        .btn-action.secondary:hover {
          border-color: #94a3b8;
          background: #f8fafc;
          color: #334155;
        }
      `}</style>
    </div>
  );
};

export default InstructorCourseCard;
