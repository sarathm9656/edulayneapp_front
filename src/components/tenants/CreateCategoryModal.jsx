import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/redux/course.slice";

const CreateCategoryModal = ({ setIsAddCategoryModalOpen }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.course);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const [formData, setFormData] = useState({
    category: "",
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

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

      const response = await dispatch(createCategory(formData.category));

      if (createCategory.fulfilled.match(response)) {
        setIsAddCategoryModalOpen(false);
        setFormData({
          category: "",
        });
      } else if (createCategory.rejected.match(response)) {
        setErrors({ category: response.payload?.message || "Failed to create category" });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      setErrors({ category: "Failed to create category. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setEditCategoryName(category.category || "");
  };

  const cancelEditCategory = () => {
    setEditingCategoryId("");
    setEditCategoryName("");
  };

  const saveCategoryUpdate = async (categoryId) => {
    const nextCategoryName = editCategoryName.trim();
    if (!nextCategoryName) return;

    try {
      setActionLoadingId(categoryId);
      const response = await dispatch(
        updateCategory({ categoryId, categoryName: nextCategoryName })
      );
      if (updateCategory.fulfilled.match(response)) {
        cancelEditCategory();
      }
    } finally {
      setActionLoadingId("");
    }
  };

  const removeCategory = async (categoryId) => {
    const confirmed = window.confirm(
      "Delete this category? If it is used in courses/subcategories, deletion will be blocked."
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(categoryId);
      await dispatch(deleteCategory(categoryId));
    } finally {
      setActionLoadingId("");
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

                <hr className="my-4" />
                <div>
                  <label className="form-label mb-2">Existing Categories</label>
                  <div
                    className="border rounded-3 p-2"
                    style={{ maxHeight: "220px", overflowY: "auto" }}
                  >
                    {categories?.length ? (
                      categories.map((category) => {
                        const isEditing = editingCategoryId === category._id;
                        const isBusy = actionLoadingId === category._id;
                        return (
                          <div
                            key={category._id}
                            className="d-flex align-items-center justify-content-between gap-2 py-2 border-bottom"
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                              />
                            ) : (
                              <span className="small fw-semibold">{category.category}</span>
                            )}
                            <div className="d-flex gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-success"
                                    onClick={() => saveCategoryUpdate(category._id)}
                                    disabled={isBusy || !editCategoryName.trim()}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={cancelEditCategory}
                                    disabled={isBusy}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => startEditCategory(category)}
                                    disabled={isBusy}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeCategory(category._id)}
                                    disabled={isBusy}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted small mb-0">No categories available.</p>
                    )}
                  </div>
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
