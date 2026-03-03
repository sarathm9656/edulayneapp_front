import React, { useState, useEffect, useMemo } from "react";
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { FaUsers, FaBook } from "react-icons/fa";

const SelectCourseCard = ({ course, setCourseIds, courseIds, instructorId }) => {
  // Find the courseId object in courseIds
  const courseObj = courseIds.find((c) => c.courseid === course._id);
  const isChecked = courseObj ? courseObj.status : false;

  const handleCheckbox = () => {
    setCourseIds((prevCourseIds) => {
      const idx = prevCourseIds.findIndex((c) => c.courseid === course._id);
      if (idx !== -1) {
        // Toggle status
        const updated = [...prevCourseIds];
        updated[idx] = { ...updated[idx], status: !updated[idx].status };
        return updated;
      } else {
        // Add new with status true
        return [
          ...prevCourseIds,
          { courseid: course._id, status: true },
        ];
      }
    });
  };

  return (
    <div 
      className={`card h-100 shadow-sm border-0 position-relative ${isChecked ? 'border-primary' : ''}`}
      style={{
        background: isChecked 
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
          : 'rgba(255,255,255,0.9)',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: isChecked ? '2px solid var(--PrimaryColor)' : '1px solid rgba(0,0,0,0.1)'
      }}
      onClick={handleCheckbox}
    >
      {/* Checkbox Overlay */}
      <div 
        className="position-absolute top-0 end-0 p-2"
        style={{ zIndex: 10 }}
      >
        <div 
          className={`rounded-circle d-flex align-items-center justify-content-center ${
            isChecked ? 'bg-primary' : 'bg-light'
          }`}
          style={{
            width: '32px',
            height: '32px',
            background: isChecked 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'rgba(255,255,255,0.9)',
            border: isChecked ? 'none' : '2px solid #dee2e6',
            boxShadow: isChecked ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
          }}
        >
          {isChecked ? (
            <ImCheckboxChecked className="text-white" style={{ fontSize: '18px' }} />
          ) : (
            <ImCheckboxUnchecked className="text-muted" style={{ fontSize: '18px' }} />
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body d-flex flex-column p-3">
        {/* Course Image */}
        <div className="text-center mb-3">
          <img
            src={useMemo(() => `${import.meta.env.VITE_API_URL}/uploads/courses/${course.image}`, [course.image])}
            alt={course.course_title}
            className="img-fluid rounded"
            style={{
              width: '100%',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Course Info */}
        <div className="flex-grow-1">
          <h6 
            className="card-title mb-2 fw-bold"
            style={{ 
              color: 'var(--HeadingColor)',
              fontSize: '14px',
              lineHeight: '1.3',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {course.course_title}
          </h6>
          
          <p 
            className="card-text text-muted mb-2"
            style={{ 
              fontSize: '12px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {course.short_description}
          </p>

          {/* Course Stats */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center text-muted">
              <FaUsers className="me-1" style={{ fontSize: '12px' }} />
              <small>{course.instructors?.length || 0} instructor{(course.instructors?.length || 0) !== 1 ? 's' : ''}</small>
            </div>
            
            {course.category && (
              <div className="d-flex align-items-center text-muted">
                <FaBook className="me-1" style={{ fontSize: '12px' }} />
                <small>{course.category.category || 'Course'}</small>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-2">
          {isChecked ? (
            <span 
              className="badge bg-primary w-100"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '11px'
              }}
            >
              ✓ Selected
            </span>
          ) : (
            <span 
              className="badge bg-light text-muted w-100"
              style={{
                fontSize: '11px',
                border: '1px solid #dee2e6'
              }}
            >
              Click to select
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectCourseCard;
