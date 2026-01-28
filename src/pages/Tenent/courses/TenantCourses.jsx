import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CourseCard from "../../../components/tenants/CourseCard";
import AddCourseModal from "../../../components/tenants/AddCourseModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchSubcategories,
  fetchLevels,
  fetchLanguages,
  fetchCourses,
} from "@/redux/course.slice";
import { Stack, Pagination } from "@mui/material";

const TenantCourses = () => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [page, setPage] = useState(1);

  const { categories, levels, pagination, courses, coursesLoading } = useSelector(
    (state) => state.course
  );

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
    dispatch(fetchLevels());
    dispatch(fetchLanguages());
    dispatch(fetchCourses());
  }, [dispatch]);

  useEffect(() => {
    if (courses) {
      let filtered = [...courses];

      if (selectedCategory !== "all") {
        filtered = filtered.filter(
          (course) => course.category?._id === selectedCategory
        );
      }

      if (selectedLevel !== "all") {
        filtered = filtered.filter(
          (course) => course.level?._id === selectedLevel
        );
      }

      if (searchValue) {
        const search = searchValue.trim().toLowerCase();
        filtered = filtered.filter(
          (course) =>
            (course.course_title && course.course_title.toLowerCase().includes(search)) ||
            (course.description && course.description.toLowerCase().includes(search))
        );
      }

      setFilteredCourses(filtered);
    }
  }, [courses, selectedCategory, selectedLevel, searchValue]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleLevelChange = (levelId) => {
    setSelectedLevel(levelId);
  };


  return (
    <main className="container-wrapper-scroll bg-light">
      {/* Premium Header */}
      <section className="dashboard-header py-4 bg-white border-bottom sticky-top shadow-sm" style={{ zIndex: 10 }}>
        <div className="container-fluid px-4">
          <div className="d-flex flex-column flex-md-row justify-content-end align-items-md-center gap-3">

            <div className="d-flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
                className="btn btn-light border d-flex align-items-center gap-2 px-3 fw-medium shadow-sm transition-all"
              >
                <i className={`fa-solid ${viewMode === "grid" ? "fa-table-columns" : "fa-grip"}`}></i>
                {viewMode === "grid" ? "Table View" : "Grid View"}
              </button>
              <button
                onClick={() => setIsAddCourseModalOpen(true)}
                className="btn btn-primary d-flex align-items-center gap-2 px-4 fw-bold rounded-pill shadow"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                <i className="fa-solid fa-plus"></i>
                Create Course
              </button>
            </div>
          </div>

          <div className="row mt-4 g-3">
            <div className="col-lg-6 col-md-5">
              <div className="search-wrapper position-relative">
                <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="text"
                  className="form-control border-0 shadow-sm ps-5 py-2 rounded-3"
                  placeholder="Search by title, description or category..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  style={{ height: "48px" }}
                />
              </div>
            </div>
            <div className="col-lg-3 col-md-3">
              <select
                className="form-select border-0 shadow-sm rounded-3"
                style={{ height: "48px" }}
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.category}</option>
                ))}
              </select>
            </div>
            <div className="col-lg-3 col-md-4">
              <select
                className="form-select border-0 shadow-sm rounded-3"
                style={{ height: "48px" }}
                value={selectedLevel}
                onChange={(e) => handleLevelChange(e.target.value)}
              >
                <option value="all">All Levels</option>
                {levels?.map((lvl) => (
                  <option key={lvl._id} value={lvl._id}>{lvl.course_level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="courses-content py-5">
        <div className="container-fluid px-4">
          {coursesLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}></div>
              <p className="mt-4 text-muted fw-medium">Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            viewMode === "grid" ? (
              <div className="row g-4">
                {filteredCourses.map((course, index) => (
                  <div key={course._id || index} className="col-xl-3 col-lg-4 col-md-6">
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card border-0 shadow-sm overflow-hidden rounded-4">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light bg-opacity-50">
                      <tr>
                        <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted">Course info</th>
                        <th className="py-3 border-0 text-uppercase small fw-bold text-muted">Category</th>
                        <th className="py-3 border-0 text-uppercase small fw-bold text-muted">Level</th>
                        <th className="py-3 border-0 text-uppercase small fw-bold text-muted">Student Load</th>
                        <th className="py-3 border-0 text-uppercase small fw-bold text-secondary text-center">Status</th>
                        <th className="px-4 py-3 border-0 text-uppercase small fw-bold text-muted text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filteredCourses.map((course) => (
                        <tr key={course._id}>
                          <td className="px-4 py-3 border-bottom-0">
                            <div className="d-flex align-items-center">
                              <img
                                src={course.image ? `${import.meta.env.VITE_API_URL}/uploads/courses/${course.image}` : "/img/chessthumbnail.jpg"}
                                alt=""
                                className="rounded-3 me-3 shadow-sm"
                                style={{ width: "48px", height: "48px", objectFit: "cover" }}
                              />
                              <div>
                                <h6 className="mb-0 fw-bold text-dark">{course.course_title}</h6>
                                <small className="text-muted">{course.language?.language || "Global"}</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 border-bottom-0">
                            <span className="badge bg-soft-primary text-primary px-3 py-2 rounded-pill fw-medium">
                              {course.category?.category}
                            </span>
                          </td>
                          <td className="py-3 border-bottom-0">
                            <span className="text-dark small fw-bold">{course.level?.course_level}</span>
                          </td>
                          <td className="py-3 border-bottom-0">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold text-dark">{course.studentCount || 0}</span>
                              <span className="text-muted small">/ {course.max_enrollment}</span>
                            </div>
                            <div className="progress mt-1" style={{ height: "6px", width: "100px", borderRadius: '10px' }}>
                              <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{
                                  width: `${Math.min(100, ((course.studentCount || 0) / course.max_enrollment) * 100)}%`,
                                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3 border-bottom-0 text-center">
                            <span className={`badge px-3 py-2 rounded-pill fw-bold ${course.is_active ? "bg-soft-success text-success" : "bg-soft-danger text-danger"}`}>
                              {course.is_active ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-bottom-0 text-end">
                            <div className="d-flex gap-2 justify-content-end">
                              <Link to={`/tenant/view-course-details/${course._id}`} className="btn btn-sm btn-light border rounded-circle p-2" title="View Details">
                                <i className="fa-solid fa-eye text-primary"></i>
                              </Link>
                              <Link
                                to={`/tenant/edit-course/${course._id}`}
                                className="btn btn-sm btn-light border rounded-circle p-2"
                                title="Edit Course"
                              >
                                <i className="fa-solid fa-pen text-success"></i>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
              <div className="mb-4 opacity-25">
                <i className="fa-solid fa-box-open text-muted" style={{ fontSize: "5rem" }}></i>
              </div>
              <h4 className="fw-bold text-dark">No courses match your search</h4>
              <p className="text-muted mb-4">Try different filters or add a new course to get started.</p>
              <button
                onClick={() => { setSelectedCategory("all"); setSelectedLevel("all"); setSearchValue(""); }}
                className="btn btn-primary px-4 fw-bold rounded-pill"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredCourses.length > 0 && pagination?.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <Stack spacing={2}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  shape="rounded"
                  color="primary"
                  onChange={(event, value) => {
                    setPage(value);
                    dispatch(fetchCourses(value));
                  }}
                />
              </Stack>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-wrapper mt-auto py-4 bg-white border-top">
        <div className="container text-center">
          <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </div>
      </footer>

      {isAddCourseModalOpen && (
        <AddCourseModal setIsAddCourseModalOpen={setIsAddCourseModalOpen} />
      )}


      <style>{`
         .bg-soft-primary { background: #eef2ff !important; }
         .bg-soft-success { background: #ecfdf5 !important; }
         .bg-soft-danger { background: #fef2f2 !important; }
         .transition-all { transition: all 0.2s ease; }
         .form-control:focus { box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.1) !important; border-color: #667eea !important; }
         .table thead th { font-size: 0.75rem; letter-spacing: 0.05em; }
      `}</style>
    </main>
  );
};

export default TenantCourses;
