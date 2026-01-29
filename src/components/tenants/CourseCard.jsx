import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const CourseCard = ({ course }) => {

  const { course_title, is_active, is_archived, image, category, level } = course;
  const api_url = useMemo(() => import.meta.env.VITE_API_URL, []);

  const imageSrc = useMemo(() => {
    if (!image) return "/img/chessthumbnail.jpg";
    return `${api_url}/uploads/courses/${image}`;
  }, [image, api_url]);

  return (
    <div className="course-premium-card card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-all">
      <div className="card-img-wrapper position-relative" style={{ height: '200px' }}>
        <img
          src={imageSrc}
          alt={course_title}
          className="w-100 h-100 object-fit-cover transition-all"
        />
        <div className="position-absolute top-0 end-0 p-3 d-flex gap-2">
          {course.end_date && new Date(course.end_date) < new Date() ? (
            <span className="badge bg-secondary bg-opacity-75 backdrop-blur text-white border-0 px-3 py-2 rounded-pill small fw-bold">EXPIRED</span>
          ) : is_active ? (
            <span className="badge bg-success bg-opacity-75 backdrop-blur text-white border-0 px-3 py-2 rounded-pill small fw-bold">ACTIVE</span>
          ) : (
            <span className="badge bg-danger bg-opacity-75 backdrop-blur text-white border-0 px-3 py-2 rounded-pill small fw-bold">INACTIVE</span>
          )}
        </div>
        <div className="position-absolute bottom-0 start-0 p-3 w-100 bg-gradient-dark">
          <span className="badge bg-white bg-opacity-25 text-white border px-2 py-1 rounded small fw-medium">
            {category?.category || "Uncategorized"}
          </span>
        </div>
      </div>

      <div className="card-body p-4 d-flex flex-column">
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-primary small fw-bold text-uppercase letter-spacing-1">{level?.course_level || "Beginner"}</span>
          </div>
          <h5 className="card-title fw-bold text-dark mb-2 text-truncate-2" title={course_title}>{course_title}</h5>
          <p className="text-muted small mb-0 text-truncate-2" style={{ fontSize: '0.85rem' }}>{course.short_description || "Start your journey in chess with this professional course designed by grandmasters."}</p>
        </div>

        <div className="mt-auto pt-3 border-top">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-1 text-muted small">
              <i className="fa-solid fa-users"></i>
              <span>{course.studentCount || 0} Students</span>
            </div>
            <div className="d-flex align-items-center gap-1 text-muted small">
              <i className="fa-solid fa-layer-group"></i>
              <span>{course.modulesCount || 0} Modules</span>
            </div>
          </div>

          <div className="d-grid gap-2">
            <Link
              to={`/tenant/view-course-details/${course._id}`}
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2 fw-bold rounded-3 shadow-none transition-all"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            >
              <i className="fa-solid fa-eye small"></i>
              View Details
            </Link>
            <div className="d-flex gap-2">
              <Link
                to={`/tenant/curriculum/${course._id}`}
                className="btn btn-light border flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold rounded-3 small text-dark text-decoration-none"
              >
                <i className="fa-solid fa-plus small text-primary"></i>
                Curriculum
              </Link>
              <Link
                to={`/tenant/edit-course/${course._id}`}
                target="_blank"
                className="btn btn-light border flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold rounded-3 small text-dark text-decoration-none"
              >
                <i className="fa-solid fa-pen small text-success"></i>
                Edit
              </Link>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .course-premium-card {
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .course-premium-card:hover {
           transform: translateY(-8px);
           box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15) !important;
        }
        .course-premium-card:hover img {
           transform: scale(1.05);
        }
        .bg-gradient-dark {
          background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%);
        }
        .backdrop-blur {
          backdrop-filter: blur(4px);
        }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .letter-spacing-1 { letter-spacing: 0.5px; }
      `}</style>
    </div>
  );
};

export default CourseCard;
