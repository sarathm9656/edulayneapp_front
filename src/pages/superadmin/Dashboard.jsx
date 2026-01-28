import React from "react";
import { useSelector } from "react-redux";
import { fetchTenantsWithCourseCountandUserCount } from "../../redux/super.admin.slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { tenantDetails, currentSuperAdmin } = useSelector((state) => state.superAdmin);
  console.log("tenantDetails", tenantDetails);
  console.log("currentSuperAdmin", currentSuperAdmin);

  useEffect(() => {
    dispatch(fetchTenantsWithCourseCountandUserCount());
    // window.document.body.setAttribute("data-layout", "dashboard");
  }, []);

  // Calculate totals
  const totalUsers = tenantDetails?.reduce(
    (acc, tenant) => acc + tenant.userCount,
    0
  ) || 0;
  const totalCourses = tenantDetails?.reduce(
    (acc, tenant) => acc + tenant.courseCount,
    0
  ) || 0;
  const totalTenants = tenantDetails?.length || 0;

  // Get super admin name or fallback to "Super Admin"
  const superAdminName = currentSuperAdmin?.name || "Super Admin";

  return (
    <main className="container-wrapper-scroll">
      {/* Welcome Section */}
      <section className="welcometext-con">
        <div className="welcometext-div">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8">
                <div>
                  <span>
                    <img src="/img/hourse-icon.png" alt="Go Chess" />
                  </span>
                  <h3>Hello Super Admin {superAdminName}!</h3>
                  <p>Welcome back, you are doing great.</p>
                </div>
              </div>
              {/* <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4">
                <button className="getstarted-btn">
                  <i className="fa-solid fa-rocket"></i> Get Started
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Counts Section */}
      <section className="counts-wrapper">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-2 col-lg-4 col-md-4 col-sm-4 col-6">
              <button className="counts-item">
                <span>
                  <img src="/img/courses.png" alt="Courses" />
                </span>
                <div>
                  <h3>{totalCourses}</h3>
                  <h6>Courses</h6>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>
            </div>
            <div className="col-xl-2 col-lg-4 col-md-4 col-sm-4 col-6">
              <button className="counts-item">
                <span>
                  <img src="/img/learners.png" alt="Learners" />
                </span>
                <div>
                  <h3>{totalUsers}</h3>
                  <h6>Learners</h6>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>
            </div>
            <div className="col-xl-2 col-lg-4 col-md-4 col-sm-4 col-6">
              <button className="counts-item">
                <span>
                  <img src="/img/instructor.png" alt="Instructors" />
                </span>
                <div>
                  <h3>{totalTenants}</h3>
                  <h6>Tenants</h6>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>
            </div>
            <div className="col-xl-2 col-lg-4 col-md-4 col-sm-4 col-6">
              <button className="counts-item">
                <span>
                  <img src="/img/group-course.png" alt="Group Course" />
                </span>
                <div>
                  <h3>0</h3>
                  <h6>Group Course</h6>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>
            </div>
            <div className="col-xl-2 col-lg-4 col-md-4 col-sm-4 col-6">
              <button className="counts-item">
                <span>
                  <img src="/img/recorded-course.png" alt="Recorded Course" />
                </span>
                <div>
                  <h3>0</h3>
                  <h6>Recorded Course</h6>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>
            </div>
            <div className="col-xl-2 col-lg-4 col-md-4 col-sm-4 col-6">
              <button className="counts-item">
                <span>
                  <img src="/img/courses.png" alt="Courses" />
                </span>
                <div>
                  <h3>0</h3>
                  <h6>Active Courses</h6>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Create Course Section */}
      <section className="createcourse-wrapper">
        <div className="container-fluid">
          <h3>Create a course</h3>
          <div className="row">
            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6">
              <button className="courseitem">
                <span>
                  <img src="/img/courseicon.png" alt="Course" />
                </span>
                <h5>1:1 Course</h5>
                <p>
                  Add a single learner, schedule sessions, or allow them to book
                  directly.
                </p>
              </button>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6">
              <button className="courseitem">
                <span>
                  <img src="/img/groupcourseicon.png" alt="Group Course" />
                </span>
                <h5>Group Course</h5>
                <p>
                  Add multiple learners, content and sessions to a single
                  cohort.
                </p>
              </button>
            </div>
            <div className="col-xl-4 col-lg-4">
              <button className="courseitem">
                <span>
                  <img
                    src="/img/recordedcourseicon.png"
                    alt="Recorded Course"
                  />
                </span>
                <h5>Recorded Course</h5>
                <p>Add content and let learners progress at their own pace.</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Journey Section */}
      <section className="explore-journey-wrapper">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-4">
              <div>
                <span>
                  <img src="/img/explore-image.png" alt="Explore Journey" />
                </span>
                <h3>
                  Explore Your <br />
                  Learning Journey
                </h3>
              </div>
            </div>
            <div className="col-xl-8">
              <div className="row">
                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8">
                  <p>
                    Discover the perfect course for your needs – personalized,{" "}
                    <br />
                    group-based, or self-paced!
                  </p>
                </div>
                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4">
                  <button className="getstarted-btn">
                    <i className="fa-regular fa-eye"></i> View Courses
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learners & Instructors Section */}
      <section className="learners-instructor-wrap">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-8">
              <div className="learners-instructor-con">
                <h3>Add learner & instructors</h3>
                <div className="row">
                  <div className="col-lg-6 col-md-6 col-sm-6">
                    <button className="learners-itemdiv learnersbg">
                      <div>
                        <span>
                          <img src="/img/leaners-icon.png" alt="Learners" />
                        </span>
                        <h5>Learners</h5>
                        <p>Enroll learners in their courses</p>
                      </div>
                    </button>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-6">
                    <button className="learners-itemdiv instructorsbg">
                      <div>
                        <span>
                          <img
                            src="/img/instructors-icon.png"
                            alt="Instructors"
                          />
                        </span>
                        <h5>Instructors</h5>
                        <p>Add instructors, assign course & set roles</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="learners-instructor-con">
                <h3>Connect Calendar</h3>
                <button className="learners-itemdiv gcalandarbg">
                  <div>
                    <span>
                      <img src="/img/calandar-icon.png" alt="google calendar" />
                    </span>
                    <h5>
                      Connect <br />
                      your google calendar
                    </h5>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Graph Section */}
      {/* <section className="graph-wrapper">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6">
              <div className="graph-container-div">
                <h4>Weekly Activity</h4>
                <div className="card chart-container">
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
                    <div className="text-center">
                      <i className="fa-solid fa-chart-line fa-3x text-primary mb-3"></i>
                      <p className="text-muted">Chart will be displayed here</p>
                      <small className="text-muted">Weekly activity data</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6">
              <div className="graph-container-div">
                <h4>Course Distribution</h4>
                <div className="card chart-container">
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
                    <div className="text-center">
                      <i className="fa-solid fa-chart-pie fa-3x text-success mb-3"></i>
                      <p className="text-muted">Chart will be displayed here</p>
                      <small className="text-muted">Course distribution data</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4">
              <div className="graph-container-div">
                <h4>Monthly Progress</h4>
                <div className="card chart-container">
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
                    <div className="text-center">
                      <i className="fa-solid fa-chart-bar fa-3x text-warning mb-3"></i>
                      <p className="text-muted">Chart will be displayed here</p>
                      <small className="text-muted">Monthly progress data</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <section className="footer-wrapper">
        <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
      </section>
    </main>
  );
};

export default Dashboard;
