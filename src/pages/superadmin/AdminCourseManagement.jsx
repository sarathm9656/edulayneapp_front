import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCoursesByTenant } from "../../redux/super.admin.slice";

const AdminCourseManagement = () => {
  const dispatch = useDispatch();
  const { tenantDetails, coursesByTenant } = useSelector(
    (state) => state.superAdmin
  );
  console.log("tenantDetails", tenantDetails);
  console.log("coursesByTenant", coursesByTenant);
  coursesByTenant.map((as) => {
    console.log(as.instructors);
  })
  const [tenantId, setTenantId] = useState("");
  console.log(tenantId, "before");

  // display all courses in a card format based on the tenants
  const handleTenantChange = (e) => {
    console.log(e.target.value, "clicked");
    setTenantId(e.target.value);
    dispatch(fetchCoursesByTenant(e.target.value));
  };

  return (
    <main className="container-wrapper-scroll">
      <section className="addcourse">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-xl-2 col-lg-3 col-md-4">
              <button className="addnewcourse-btn">
                <i className="fa-solid fa-plus"></i> Add New Course
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tenant Selection Section */}
      <section className="container-fluid mb-4">
        <div className="row">
          <div className="col-12">
            <h1 className="text-2xl font-bold mb-3">
              Courses by Each Tenant and Enrolled Users Count
            </h1>
            <div className="flex flex-col gap-4">
              <select
                className="border border-gray-300 p-4 rounded-md"
                name=""
                id=""
                onChange={handleTenantChange}
              >
                <option className="text-gray-500" value="">
                  Select Tenant to view courses
                </option>
                {tenantDetails.map((tenant, index) => (
                  <option
                    key={index}
                    onChange={handleTenantChange}
                    className="text-gray-500 cursor-pointer"
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
