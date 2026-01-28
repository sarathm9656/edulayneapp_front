import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiBook,
  FiClock,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleCourse } from "@/redux/course.slice";

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [modules, setModules] = useState(null);
  console.log(courseData, "courseData");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const singleCourse = useSelector((state) => state.course.singleCourse);

  // get course details from api
  useEffect(() => {
    console.log("id", id);
    dispatch(fetchSingleCourse(id));
    fetchTheModulesAssociatedWithTheCourse();
  }, [dispatch, id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#fffb0c33]">
          {/* cover image */}
          <div className="w-full h-48 object-cover rounded-lg mb-4">
            <img
              src={courseData?.image}
              alt={courseData?.course_title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {courseData?.course_title}
          </h1>
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <FiUsers className="mr-2" />
              <span>{courseData?.max_enrollment} students</span>
            </div>
            <div className="flex items-center">
              <FiClock className="mr-2" />
              <span>{courseData?.duration} hours</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1">{courseData?.rating}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Course Content
              </h2>
              {/* <div className="space-y-4">
                {courseData?.lessons.map((module) => (
                  <div key={module.id} className="border rounded-lg">
                    <button
                      onClick={() => toggleModule(module?.lesson_id)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                    >
                      <div className="flex items-center">
                        <FiBook className="mr-3 text-gray-500" />
                        <span className="font-medium">
                          {module?.lesson_title}
                        </span>
                      </div>
                      {expandedModules[module?.lesson_id] ? (
                        <FiChevronUp className="text-gray-500" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </button>
                    {expandedModules[module?.lesson_id] && (
                      <div className="px-4 py-3 space-y-2">
                        {module?.lessons.map((lesson) => (
                          <div
                            key={lesson?.id}
                            className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded"
                          >
                            <span className="text-gray-700">
                              {lesson?.lesson_title}
                            </span>
                            <span className="text-sm text"></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div> */}
            </div>
          </div>

          {/* Course Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About This Course
              </h2>
              <p className="text-gray-600 mb-6">{courseData?.description}</p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Instructor:</span>
                  <span className="text-gray-900">
                    {courseData?.instructor}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Duration:</span>
                  <span className="text-gray-900">{courseData?.duration}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Students:</span>
                  <span className="text-gray-900">{courseData?.students}</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
