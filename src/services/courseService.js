import axios from "axios";

const API_URL = import.meta.env.CORS_ORIGIN;

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: API_URL
});

export const courseService = {
  // Course CRUD operations
  getAllCourses: () => axiosInstance.get("/courses"),
  getCourse: (id) => axiosInstance.get(`/courses/${id}`),
  createCourse: (courseData) => axiosInstance.post("/courses", courseData),
  updateCourse: (id, courseData) => axiosInstance.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => axiosInstance.delete(`/courses/${id}`),

  // Related data operations
  getCategories: () => axiosInstance.get("/categories"),
  getSubcategories: () => axiosInstance.get("/subcategories"),
  getLanguages: () => axiosInstance.get("/languages"),
  getCourseLevels: () => axiosInstance.get("/course-levels"),
};
