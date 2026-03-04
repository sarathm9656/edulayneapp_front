import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCoursesByTenant } from "../../redux/super.admin.slice";

const AdminCourseManagement = () => {
  const dispatch = useDispatch();
  const { tenantDetails, coursesByTenant } = useSelector(
    (state) => state.superAdmin
  );
  const [tenantId, setTenantId] = useState("");

  // display all courses in a card format based on the tenants
  const handleTenantChange = (e) => {
    setTenantId(e.target.value);
    dispatch(fetchCoursesByTenant(e.target.value));
  };

  return (
    <main className="container-wrapper-scroll">
      {/* Tenant Selection Section */}
      <section className="container-fluid mb-4">
        <div className="row">
          <div className="col-12">
            <h5 className="fw-bold mb-3">Courses (view only)</h5>
            <div className="d-flex flex-column gap-2">
              <select
                className="form-select"
                name=""
                id=""
                onChange={handleTenantChange}
              >
                <option value="">
                  Select Tenant to view courses
                </option>
                {tenantDetails.map((tenant, index) => (
                  <option
                    key={index}
                    onChange={handleTenantChange}
                    value={tenant.tenant._id}
                  >
                    {tenant.tenant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {coursesByTenant.length > 0 && tenantId !== "" && (
        <section className="container-fluid mb-4">
          <div className="row">
            <div className="col-12">
              <div className="sa-card p-3 p-md-4">
                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="small text-muted">Total Courses</div>
                    <div className="fs-5 fw-bold">{coursesByTenant.length}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Total Enrolled Students</div>
                    <div className="fs-5 fw-bold">
                      {coursesByTenant.reduce(
                        (acc, course) => acc + (Array.isArray(course.purchases) ? course.purchases.length : 0),
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* legacy: stats were h1 blocks */}
              {/*
              <div className="flex flex-col gap-4 my-6 border-b border-gray-300 pb-4">
                <h1 className="text-xl font-bold">
                  Total Courses: {coursesByTenant.length}
                </h1>
                <h1 className="text-xl font-bold">
                  Total Enrolled Students:{" "}
                  {coursesByTenant.reduce(
                    (acc, course) => acc + course.purchases.length,
                    0
                  )}
                </h1>
              </div>
              */}
            </div>
          </div>
        </section>
      )}

      {/* Course Cards Display */}
      {coursesByTenant.length > 0 && tenantId !== "" && (
        <section className="createcourse-wrapper ourcourse-page">
          <div className="container-fluid">
            <div className="row">
              {coursesByTenant.map((course) => (
                <div key={course._id} className="col-xl-3 col-lg-3 col-sm-6">
                  <a href="#" className="ourcourse-item-div">
                    <div className="course-image">
                      <img
                        src={course.course_image || "/img/chessthumbnail.jpg"}
                        alt={course.course_title || "Course"}
                      />
                    </div>
                    <div className="course-content">
                      <h4>
                        <font>{course.course_title}</font>
                      </h4>
                      <h3>
                        <font>
                          <i className="fa-solid fa-indian-rupee-sign"></i>
                          {course.price}
                        </font>
                        <span>
                          <i className="fa-solid fa-indian-rupee-sign"></i>
                          {course.discounted_price || course.price}
                        </span>
                      </h3>
                    </div>
                    <h6>
                      <i className="fa-regular fa-clock"></i>
                      {course.duration || "20 total hours"}
                    </h6>
                    <h6>
                      <i className="fa-solid fa-users"></i>
                      Enrolled: {course.purchases.length} / {course.max_enrollment}
                    </h6>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer Section */}
      <section className="footer-wrapper">
        <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
      </section>
    </main>
  );
};

export default AdminCourseManagement;
