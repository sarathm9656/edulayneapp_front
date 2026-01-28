import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createCategory } from "@/redux/course.slice";
import toast from "react-hot-toast";

const CreateCategoryModal = ({ setIsAddCategoryModalOpen }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    category: "",
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

    if (!formData.category.trim()) {
      newErrors.category = "Category name is required";
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

      const response = await dispatch(createCategory(formData.category, { dispatch }));

      if (createCategory.fulfilled.match(response)) {
        setIsAddCategoryModalOpen(false);
        toast.success("Category created successfully");

        // Reset form
        setFormData({
          category: "",
        });
      } else if (createCategory.rejected.match(response)) {
        const errorMessage = response.payload?.message || "Failed to create category";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsAddCategoryModalOpen(false);
  };

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
        aria-labelledby="createCategoryModalLabel"
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
              <h5 className="modal-title" id="createCategoryModalLabel">
                Create New Category
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
                  <label htmlFor="category" className="form-label">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.category ? "is-invalid" : ""
                      }`}
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter category name"
                    required
                  />
                  {errors.category && (
                    <div className="invalid-feedback">
                      {errors.category}
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
                  "Create Category"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCategoryModal;
