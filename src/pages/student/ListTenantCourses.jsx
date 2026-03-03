import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchTenantCourses } from "../../redux/course.slice";
import { FaSearch, FaFilter, FaClock, FaRupeeSign, FaStar, FaCalendarAlt, FaLayerGroup } from "react-icons/fa";

const ListTenantCourses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    dispatch(fetchTenantCourses());
  }, [dispatch]);

  const courses = useSelector((state) => state.course.tenantCourses || []);
  const loading = useSelector((state) => state.course.coursesLoading);

  const api_url = import.meta.env.VITE_API_URL;

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="container-wrapper-scroll">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading courses...</p>
          </div>
        </div>
      </main>
    );
  }

  const getLessonCount = (course) => {
    if (course.lectures && course.lectures > 0) return course.lectures;
    if (course.modules && Array.isArray(course.modules)) {
      return course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
    }
    return 0;
  };

  return (
    <div className="modern-grid">
      {/* Header and Search */}
      <div className="modern-card" style={{ gridColumn: 'span 12' }}>
        <div className="d-flex flex-column flex-md-row justify-content-end align-items-md-center gap-3">
          <div className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-select bg-light" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} style={{ maxWidth: '150px' }}>
              <option value="">Filter By</option>
              <option value="new">Newest</option>
              <option value="top-rated">Top Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="col-span-12" style={{ gridColumn: 'span 12' }}>
        <div className="row g-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course._id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                <div className="card h-100 hover-shadow transition-all border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <div className="position-relative">
                    <Link to={`/student/viewcourse/${course._id}`}>
                      <img
                        src={course.image ? `${api_url}/uploads/courses/${course.image}` : course.course_thumbnail || "/img/chessthumbnail.jpg"}
                        alt={course.course_title}
                        className="card-img-top object-fit-cover"
                        style={{ height: '180px', w: '100%' }}
                      />
                    </Link>
                    <span className="badge bg-white text-primary position-absolute top-0 end-0 m-3 shadow-sm">
                      {course.category || 'General'}
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-1 text-warning small">
                       
                        <span className="fw-bold text-dark">{}</span>
                        <span className="text-muted"></span>
                      </div>
                      <small className="text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                        {course.level || 'All Levels'}
                      </small>
                    </div>
                    <Link to={`/student/viewcourse/${course._id}`} className="text-decoration-none text-dark">
                      <h6 className="fw-bold mb-2 text-truncate-2" style={{ minHeight: '40px', lineHeight: '1.4' }}>{course.course_title}</h6>
                    </Link>
                    <p className="text-muted small text-truncate mb-3" style={{ fontSize: '0.85rem' }}>{course.description || 'No description available'}</p>

                    <div className="mt-auto">
                      <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                        <div className="d-flex align-items-center gap-1"><FaClock className="text-primary" /> {course.duration || 0} hrs</div>
                        <div className="d-flex align-items-center gap-1"><FaLayerGroup className="text-primary" /> {getLessonCount(course)} lessons</div>
                      </div>
                      <div className="d-flex justify-content-end align-items-center border-top pt-3">
                        <Link to={`/student/viewcourse/${course._id}`} className="btn btn-sm btn-outline-primary rounded-pill px-4 w-100">
                          View Course
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <div className="text-muted">
                <FaSearch className="fs-1 opacity-25 mb-3" />
                <h4>No courses found</h4>
                <p>Try adjusting your search terms or filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListTenantCourses;