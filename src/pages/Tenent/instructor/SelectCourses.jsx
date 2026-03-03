import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SelectCourseCard from "@/components/tenants/SelectCourseCard";
import { assignCoursesToInstructor } from "@/redux/tenant.slice";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCourses } from "../../../redux/course.slice";
import { FaArrowLeft, FaBook, FaCheck } from "react-icons/fa";

const SelectCourses = () => {
  const dispatch = useDispatch();
  const { instructorId, loginId } = useParams();
  const [courseIds, setCourseIds] = useState([]);
  const { courses, pagination } = useSelector((state) => state.course);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();



  // Populate courseIds on courses load
  useEffect(() => {
    dispatch(fetchCourses(currentPage));
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (courses && courses.length > 0) {
      setCourseIds(
        courses.map((course) => {
          // Check if the instructor (User ID) is already assigned to this course
          const isAssigned = Array.isArray(course.instructors) &&
            course.instructors.some((instructor) => {
              // Handle both object and string formats
              if (typeof instructor === 'object' && instructor._id) {
                return instructor._id === loginId;
              } else if (typeof instructor === 'string') {
                return instructor === loginId;
              }
              return false;
            });

          return {
            courseid: course._id,
            status: isAssigned,
          };
        })
      );
    }
  }, [courses, loginId]);

  const handleAssignCourses = async () => {
    console.log(courseIds);
    try {
      const response = await dispatch(
        assignCoursesToInstructor({ instructorId, courseIds })
      ).unwrap();
      navigate(`/tenant/instructor/${instructorId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGoBack = () => {
    navigate(`/tenant/instructor/${instructorId}`);
  };

  const selectedCount = courseIds.filter(course => course.status).length;

  return (
    <>
      {/* Main Content */}
      <main className="container-wrapper-scroll">
        <section className="course-single-page container-height">
          <div className="container-fluid">
            {/* Header */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <button
                      onClick={handleGoBack}
                      className="btn btn-outline-secondary me-3"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '8px 16px'
                      }}
                    >
                      <FaArrowLeft className="me-2" />
                      Back to Instructor
                    </button>
                    <div>
                      <h2 className="mb-1" style={{ color: 'var(--HeadingColor)', fontWeight: 'bold' }}>
                        Assign Courses to Instructor
                      </h2>
                      <p className="text-muted mb-0">Select courses to assign to this instructor</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-center">
                      <div className="badge bg-primary fs-6 px-3 py-2" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}>
                        <FaBook className="me-2" />
                        {selectedCount} Selected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Selection Area */}
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm" style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '12px',
                  border: 'none'
                }}>
                  <div className="card-header bg-transparent border-bottom">
                    <h5 className="mb-0" style={{ color: 'var(--HeadingColor)', fontWeight: '600' }}>
                      Available Courses ({courses?.length || 0})
                    </h5>
                  </div>
                  <div className="card-body">
                    {courses && courses.length > 0 ? (
                      <div className="row g-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {courses.map((course) => (
                          <div key={course._id} className="col-lg-4 col-md-6">
                            <SelectCourseCard
                              setCourseIds={setCourseIds}
                              courseIds={courseIds}
                              course={course}
                              instructorId={instructorId}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <FaBook className="text-muted mb-3" style={{ fontSize: '48px' }} />
                        <h5 className="text-muted mb-2">No courses available</h5>
                        <p className="text-muted">There are no courses to assign at the moment.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {courses && courses.length > 0 && (
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card shadow-sm" style={{
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '12px',
                    border: 'none'
                  }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-center align-items-center gap-3">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1 || !pagination.hasPrevPage}
                          style={{
                            borderRadius: '8px',
                            padding: '8px 16px'
                          }}
                        >
                          <FaArrowLeft className="me-2" />
                          Previous
                        </button>

                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary px-3 py-2" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                          }}>
                            Page {pagination.currentPage || currentPage} of {pagination.totalPages || 1}
                          </span>
                        </div>

                        <button
                          className="btn btn-outline-primary"
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          disabled={currentPage === (pagination.totalPages || 1) || !pagination.hasNextPage}
                          style={{
                            borderRadius: '8px',
                            padding: '8px 16px'
                          }}
                        >
                          Next
                          <FaArrowLeft className="ms-2" style={{ transform: 'rotate(180deg)' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    onClick={handleGoBack}
                    className="btn btn-outline-secondary"
                    style={{
                      borderRadius: '8px',
                      padding: '12px 24px'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAssignCourses}
                    className="btn btn-primary"
                    disabled={selectedCount === 0}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 32px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    <FaCheck className="me-2" />
                    Assign {selectedCount} Course{selectedCount !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="footer-wrapper">
          <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </section>
      </main>
    </>
  );
};

export default SelectCourses;
