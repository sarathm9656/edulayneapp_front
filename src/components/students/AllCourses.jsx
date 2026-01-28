import React, { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import axios from "axios";
const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  async function fetchAllCoursesOfTheTenant() {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/courses`,
      {
        withCredentials: true,
      }
    );
    const data = await response.data;
    console.log("data", data);
    setCourses(data.data);
  }
  useEffect(() => {
    fetchAllCoursesOfTheTenant();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">All Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default AllCourses;
