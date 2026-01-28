import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ModuleAddModal from "../ModuleAddModal";
import { useSelector, useDispatch } from "react-redux";
import { fetchModulesByCourseId } from "@/redux/course.slice";

const InstructorCourseCard = ({ course }) => {
  const [isAddModuleSectionOpen, setIsAddModuleSectionOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { modules } = useSelector((state) => state.course);
  const dispatch = useDispatch();

  const {
    course_title,
    category,
    subcategory,
    language,
    studentCount,
    instructors,
    is_active,
    is_archived,
    level,
    max_enrollment,
    short_description,
    _id,
    image,
  } = course;

  const api_url = useMemo(() => import.meta.env.VITE_API_URL, []);

  // Memoize image source to prevent continuous requests
  const imageSrc = useMemo(() => {
    if (!image || imageError) return "/default-course.png";
    return `${api_url}/uploads/courses/${image}`;
  }, [image, api_url, imageError]);

  const showAddModuleSection = () => {
    setIsAddModuleSectionOpen(true);
    dispatch(fetchModulesByCourseId(_id));
  };

  return (
    <div className="ourcourse-item-div">
      <div className="course-image">
        <img
          src={imageSrc}
          alt={course_title}
          onError={() => {
            setImageError(true);
          }}
        />
        {/* Status badges */}
        <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
          {is_active && (
            <span className="badge bg-success text-white px-2 py-1 rounded-pill fs-6 fw-medium">
              Active
            </span>
          )}
          {is_archived && (
            <span className="badge bg-secondary text-white px-2 py-1 rounded-pill fs-6 fw-medium">
              Archived
            </span>
          )}
        </div>
      </div>

      <div className="course-content">
        <h4>
          <span>{course_title}</span>
        </h4>
        <h3 className="d-flex align-items-center justify-content-between" style={{ fontSize: '14px', color: 'var(--TextColor)' }}>
          <span className="d-flex align-items-center gap-1">
            <i className="fa-solid fa-users" style={{ fontSize: '12px' }}></i>
            {studentCount || 0} {(studentCount || 0) === 1 ? 'Student' : 'Students'}
          </span>
          <span className="d-flex align-items-center gap-1">
            <i className="fa-solid fa-chalkboard-teacher" style={{ fontSize: '12px' }}></i>
            {instructors?.length || 0} {(instructors?.length || 0) === 1 ? 'Instructor' : 'Instructors'}
          </span>
        </h3>
        {instructors && instructors.length > 0 && (
          <div className="instructor-names mt-2">   
            <small className="text-muted">
              <i className="fa-solid fa-user-tie me-1"></i>
              {instructors.map((instructor) => instructor.name).join(", ")}
            </small>
          </div>
        )}
      </div>

      <h6>
        <i className="fa-solid fa-layer-group"></i>
        {category?.category || "N/A"} • {level?.course_level || "N/A"}
      </h6>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center p-3">
        <Link
          to={`/instructor/view-course-details-instructor/${course._id}`}
          className="flex-fill me-2"
        >
          <button
            className="btn w-100 px-2 py-1 text-white rounded-2 border-0 fw-medium fs-6 text-nowrap"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
            }}
          >
            <i className="fa-solid fa-eye me-1"></i> Details
          </button>
        </Link>

        <button
          onClick={showAddModuleSection}
          className="btn flex-fill px-2 py-1 text-white rounded-2 border-0 fw-medium fs-6 text-nowrap"
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            boxShadow: "0 4px 15px rgba(240, 147, 251, 0.3)",
          }}
        >
          <i className="fa-solid fa-plus me-1"></i> Add Module
        </button>
      </div>

      {isAddModuleSectionOpen && (
        <ModuleAddModal
          setIsAddModuleSectionOpen={setIsAddModuleSectionOpen}
          course={course}
        />
      )}
    </div>
  );
};

export default InstructorCourseCard;
