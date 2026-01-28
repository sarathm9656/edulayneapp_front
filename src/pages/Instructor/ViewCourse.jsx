import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../redux/instructor/instructor.slice";
import { fetchCategories, fetchLevels } from "../../redux/course.slice";
import InstructorCourseCard from "../../components/instructor/InstructorCourseCard";
import { FaTh, FaList, FaSearch, FaFilter, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ViewCourseInstructor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading: coursesLoading } = useSelector((state) => state.instructor);
  const { categories, levels } = useSelector((state) => state.course);

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchCategories());
    dispatch(fetchLevels());
  }, [dispatch]);

  const filteredCourses = (courses || []).filter((course) => {
    const matchesSearch = course.course_title
      .toLowerCase()
      .includes(searchValue.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || course.category?._id === selectedCategory;

    const matchesLevel =
      selectedLevel === "all" || course.level?._id === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (coursesLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-grid">
      {/* Header Card */}
      <div className="modern-card p-4" style={{ gridColumn: "span 12" }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold mb-1">My Courses</h4>
            <p className="text-muted mb-0 small">Manage and view all your assigned courses.</p>
          </div>
          <div className="btn-group" role="group" aria-label="View Mode">
            <button
              type="button"
              className={`btn btn-outline-secondary ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <FaTh />
            </button>
            <button
              type="button"
              className={`btn btn-outline-secondary ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <FaList />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-3">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                placeholder="Search courses..."
                className="form-control border-start-0 ps-0"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories &&
                categories.map((category, index) => (
                  <option key={index} value={category._id}>
                    {category.category}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              {levels &&
                levels.map((level, index) => (
                  <option key={index} value={level._id}>
                    {level.course_level}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="modern-card p-4" style={{ gridColumn: "span 12" }}>
        {filteredCourses.length > 0 ? (
          viewMode === "grid" ? (
            // Grid View
            <div className="row g-4">
              {filteredCourses.map((course, index) => (
                <div key={course._id || index} className="col-xl-3 col-lg-4 col-md-6">
                  <InstructorCourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            // Table View
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table">
                <thead className="bg-light text-muted">
                  <tr>
                    <th className="ps-4">Course Name</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={
                              course.image
                                ? `${API_URL}/uploads/courses/${course.image}`
                                : "/img/chessthumbnail.jpg"
                            }
                            alt={course.course_title}
                            className="rounded"
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src = "/img/chessthumbnail.jpg";
                            }}
                          />
                          <div>
                            <div className="fw-bold text-dark">
                              {course.course_title}
                            </div>
                            <small className="text-muted">
                              {course.short_description
                                ? course.short_description.substring(0, 30) +
                                "..."
                                : "No description"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {course.category?.category || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info bg-opacity-10 text-info">
                          {course.level?.course_level || "N/A"}
                        </span>
                      </td>
                      <td>
                        {course.is_active ? (
                          <span className="badge bg-success bg-opacity-10 text-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary">
                            Inactive
                          </span>
                        )}
                        {course.is_archived && (
                          <span className="badge bg-warning bg-opacity-10 text-warning ms-1">
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-sm btn-light border shadow-sm rounded-circle"
                          onClick={() =>
                            navigate(`/instructor/view-course/${course._id}`)
                          }
                          title="View Details"
                        >
                          <FaEye className="text-primary" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="fa-solid fa-book-open fs-1 text-muted opacity-25"></i>
            </div>
            <h5 className="text-muted">No courses found.</h5>
            <p className="text-muted small">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCourseInstructor;
