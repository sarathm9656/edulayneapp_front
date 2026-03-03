import React, { useEffect, useState } from "react";
import CreateSubCategoryModal from "../CreateSubCategoryModal";
import CreateCategoryModal from "../tenants/CreateCategoryModal";
import CreateLanguageModal from "../tenants/CreateLanguageModal";
import CreateLevelModal from "../tenants/CreateLevelModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchSubcategories,
  fetchLevels,
  fetchLanguages,
  createCourse,
  fetchSubcategoriesByCategory,
  fetchCourses,
} from "@/redux/course.slice";
import { XIcon } from "lucide-react";
import { toast } from "react-toastify";

const AddCourseModal = ({ setIsAddCourseModalOpen }) => {
  const dispatch = useDispatch();
  const { categories, subcategories, levels, languages } = useSelector(
    (state) => state.course
  );

  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState(false);
  const [isAddLevelModalOpen, setIsAddLevelModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    course_title: "",
    short_description: "",
    description: "",
    category: "",
    subcategory: "",
    language: "",
    level: "",
    max_enrollment: 10,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    drip_content_enabled: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
    dispatch(fetchLevels());
    dispatch(fetchLanguages());
  }, [dispatch]);

  function checkDate() {
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (startDate >= new Date()) {
      toast.error("Start date cannot be in the past");
      return false;
    }
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (
        !formData.course_title ||
        !formData.short_description ||
        !formData.description ||
        !formData.category ||
        !formData.subcategory ||
        !formData.language ||
        !formData.level ||
        !formData.max_enrollment ||
        !formData.start_date ||
        !formData.end_date
      ) {
        toast.error("Please fill all the fields");
        return;
      }
      if (!checkDate()) {
        toast.error("Please check the date");
        return;
      }
      const courseData = {
        ...formData,
        category: formData.category,
        subcategory: formData.subcategory,
        language: formData.language,
        level: formData.level,
      };
      await dispatch(createCourse(courseData));
      setIsAddCourseModalOpen(false);
      toast.success("Course added successfully");
      dispatch(fetchCourses(1));
    } catch (error) {
      toast.error("Error adding course");
    }
  };

  useEffect(() => {
    if (formData.category) {
      dispatch(fetchSubcategoriesByCategory(formData.category));
    }
  }, [formData.category]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 w-full max-w-5xl mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add New Course</h2>
          <button
            onClick={() => setIsAddCourseModalOpen(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <XIcon
              size={32}
              className=" font-semibold cursor-pointer hover:text-gray-700 transition-all duration-300 hover:scale-110 hover:rotate-180 "
            />
          </button>
        </div>
        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className=" flex  gap-8 w-2xl mx-auto  justify-between "
        >
          <div className="w-1/2 flex flex-col gap-4">
            <div>
              <label htmlFor="course_title" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                id="course_title"
                name="course_title"
                value={formData.course_title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course title"
                required
              />
            </div>
            <div>
              <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <input
                type="text"
                id="short_description"
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter short description"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course description"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="flex gap-2">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option disabled selected value="">Select Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category._id}>{category.category}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <div className="flex gap-2">
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option disabled selected value="">Select Subcategory</option>
                  {subcategories.map((subcategory, index) => (
                    <option key={index} value={subcategory._id}>{subcategory.subcategory_name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddSubcategoryModalOpen(true)}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="w-1/2 flex flex-col gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <div className="flex gap-2">
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option disabled value="">Select Language</option>
                  {languages.map((language, index) => (
                    <option key={index} value={language._id}>{language.language}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddLanguageModalOpen(true)}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <div className="flex gap-2">
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option disabled value="">Select Level</option>
                  {levels.map((level, index) => (
                    <option key={index} value={level._id}>{level.course_level}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddLevelModalOpen(true)}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="max_enrollment" className="block text-sm font-medium text-gray-700 mb-1">Max Enrollment</label>
              <input
                type="number"
                id="max_enrollment"
                name="max_enrollment"
                value={formData.max_enrollment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter max enrollment"
                required
              />
            </div>
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="drip_content_enabled"
                name="drip_content_enabled"
                checked={formData.drip_content_enabled}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="drip_content_enabled" className="ml-2 block text-sm text-gray-900">Enable Drip Content</label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAddCourseModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Course
              </button>
            </div>
          </div>
        </form>
      </div>
      {isAddSubcategoryModalOpen && (
        <CreateSubCategoryModal
          setIsAddSubcategoryModalOpen={setIsAddSubcategoryModalOpen}
        />
      )}
      {isAddCategoryModalOpen && (
        <CreateCategoryModal
          setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
        />
      )}
      {isAddLanguageModalOpen && (
        <CreateLanguageModal
          setIsAddLanguageModalOpen={setIsAddLanguageModalOpen}
        />
      )}
      {isAddLevelModalOpen && (
        <CreateLevelModal
          setIsAddLevelModalOpen={setIsAddLevelModalOpen}
        />
      )}
    </div>
  );
};

export default AddCourseModal; 