import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createSubcategory,
  fetchSubcategoriesByCategory,
} from "@/redux/course.slice";
import toast from "react-hot-toast";

const CreateSubCategoryModal = ({ setIsAddSubcategoryModalOpen }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.course);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    subcategory_name: "",
    category_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subcategory_name.trim()) {
      newErrors.subcategory_name = "Subcategory name is required";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Parent category is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await dispatch(createSubcategory(formData));

      if (createSubcategory.fulfilled.match(response)) {
        setIsAddSubcategoryModalOpen(false);
        toast.success("Subcategory created successfully");

        // Reset form
        setFormData({
          subcategory_name: "",
          category_id: "",
        });
      } else if (createSubcategory.rejected.match(response)) {
        const errorMessage = response.payload?.message || "Failed to create subcategory";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error("Failed to create subcategory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsAddSubcategoryModalOpen(false);
  };

  useEffect(() => {
    if (formData.category_id) {
      dispatch(fetchSubcategoriesByCategory(formData.category_id)).then(
        (response) => {
          setSubcategories(response.payload);
        }
      );
    }
  }, [formData.category_id, dispatch]);

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 2040,
        }}
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2050,
          overflow: "auto",
        }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="createSubcategoryModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="document"
          style={{ maxWidth: "500px" }}
        >
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title" id="createSubcategoryModalLabel">
                Create New Subcategory
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#000',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  lineHeight: '1',
                  opacity: '0.75'
                }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="subcategory_name" className="form-label">
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.subcategory_name ? "is-invalid" : ""
                      }`}
                    id="subcategory_name"
                    name="subcategory_name"
                    value={formData.subcategory_name}
                    onChange={handleChange}
                    placeholder="Enter subcategory name"
                    required
                  />
                  {errors.subcategory_name && (
                    <div className="invalid-feedback">
                      {errors.subcategory_name}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="category_id" className="form-label">
                    Parent Category *
                  </label>
                  <select
                    className={`form-control ${errors.category_id ? "is-invalid" : ""
                      }`}
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.category}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <div className="invalid-feedback">
                      {errors.category_id}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Creating...
                  </>
                ) : (
                  "Create Subcategory"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSubCategoryModal;
