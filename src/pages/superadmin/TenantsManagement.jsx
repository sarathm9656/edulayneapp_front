import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import AddTenantModal from "../../components/super-admin/AddTenantModal.jsx";
import EditTenantModal from "../../components/super-admin/EditTenantModal.jsx";
import {
  deleteTenant,
  fetchTenantsWithCourseCountandUserCount,
} from "../../redux/super.admin.slice";
import { toast } from "react-toastify";

const TenantsManagement = () => {
  const tenantDetails = useSelector((state) => state.superAdmin.tenantDetails);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [deletingTenant, setDeletingTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();

  console.log("tenantDetails=====================================", tenantDetails);

  console.log(
    "TenantsManagement rendered - isAddTenantModalOpen:",
    isAddTenantModalOpen,
    "isEditModalOpen:",
    isEditModalOpen,
    "editingTenant:",
    editingTenant
  );
  console.log("tenantDetails:", tenantDetails);

  useEffect(() => {
    dispatch(fetchTenantsWithCourseCountandUserCount());
  }, [dispatch]);

  const handleEdit = (tenantId) => {
    console.log("Edit button clicked for tenant ID:", tenantId);
    const tenant = tenantDetails.find((t) => t.tenant._id === tenantId);

    if (tenant) {
      console.log("Found tenant for editing:", tenant);
      // Pass the entire tenant object with all details (login, zoomapikey, etc.)
      setEditingTenant(tenant);
      setIsEditModalOpen(true);
    } else {
      console.log("Tenant not found for ID:", tenantId);
    }
  };

  const handleDeleteClick = (tenantId) => {
    console.log("Delete button clicked for tenant ID:", tenantId);
    const tenant = tenantDetails.find((t) => t.tenant._id === tenantId);
    if (tenant) {
      console.log("Found tenant for deletion:", tenant.tenant);
      setDeletingTenant(tenant.tenant);
      setIsDeleteModalOpen(true);
    } else {
      console.log("Tenant not found for ID:", tenantId);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTenant) return;

    try {
      await dispatch(deleteTenant(deletingTenant._id)).unwrap();
      setIsDeleteModalOpen(false);
      setDeletingTenant(null);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingTenant(null);
  };

  const addTenant = () => {
    console.log("Add tenant button clicked");
    setIsAddTenantModalOpen(true);
  };

  const closeEditModal = () => {
    console.log("Closing edit modal");
    setIsEditModalOpen(false);
    setEditingTenant(null);
  };

  const closeAddModal = () => {
    console.log("Closing add modal");
    setIsAddTenantModalOpen(false);
  };

  // Filter tenants based on search term
  const filteredTenants =
    tenantDetails?.filter(
      (tenant) => {
        const userFullName = tenant.user?.fname && tenant.user?.lname
          ? `${tenant.user.fname} ${tenant.user.lname}`.toLowerCase()
          : '';
        const companyName = tenant.tenant.name.toLowerCase();
        const subdomain = tenant.tenant.subdomain.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        return userFullName.includes(searchLower) ||
          companyName.includes(searchLower) ||
          subdomain.includes(searchLower);
      }
    ) || [];

  return (
    <>
      {/* Main Content */}
      <main className="container-wrapper-scroll">
        <section className="course-single-page container-height">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-lg-2 col-md-3 col-6">
                <button className="addtenant-btn" onClick={addTenant}>
                  <i className="fa-solid fa-plus"></i> Add Tenant
                </button>
              </div>
            </div>

            <div
              className="table-responsive table-styles mt-4"
              style={{
                overflowX: "auto",
                overflowY: "auto",
                minWidth: "100%",
                maxHeight: "70vh"
              }}
            >
              <table
                className="table table-striped table-hover"
                style={{ minWidth: "800px" }}
              >
                <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    <th scope="col" className="text-nowrap">
                      #
                    </th>
                    <th scope="col" className="text-nowrap">
                      User Name
                    </th>
                    <th scope="col" className="text-nowrap">
                      Company Name
                    </th>
                    <th scope="col" className="text-nowrap">
                      Active
                    </th>
                    <th scope="col" className="text-nowrap">
                      Created at
                    </th>
                    <th scope="col" className="text-nowrap">
                      Courses
                    </th>
                    <th scope="col" className="text-nowrap">
                      Users
                    </th>
                    <th scope="col" className="text-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants &&
                    filteredTenants.map((tenant, index) => (
                      <tr key={index}>
                        <th scope="row" className="text-nowrap">
                          {index + 1}
                        </th>
                        <td className="text-nowrap">
                          {tenant.user?.fname && tenant.user?.lname
                            ? `${tenant.user.fname} ${tenant.user.lname}`
                            : tenant.tenant.name
                          }
                        </td>
                        <td className="text-nowrap">
                          {tenant.tenant.name}
                        </td>
                        <td className="text-nowrap">
                          <span
                            className={`badge ${tenant.tenant.is_active
                                ? "bg-success"
                                : "bg-danger"
                              }`}
                          >
                            {tenant.tenant.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-nowrap">
                          {tenant?.tenant?.createdAt
                            ? new Date(
                              tenant.tenant.createdAt
                            ).toLocaleDateString()
                            : "Invalid Date"}
                        </td>
                        <td className="text-nowrap text-center">
                          {tenant.courseCount}
                        </td>
                        <td className="text-nowrap text-center">
                          {tenant.userCount}
                        </td>
                        <td className="text-nowrap">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => handleEdit(tenant.tenant._id)}
                              title="Edit Tenant"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDeleteClick(tenant.tenant._id)
                              }
                              title="Delete Tenant"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="footer-wrapper">
          <p>&copy; Copyright {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </section>
      </main>

      {/* Add Tenant Modal */}
      {isAddTenantModalOpen && (
        <AddTenantModal setIsAddTenantModalOpen={closeAddModal} />
      )}

      {/* Edit Tenant Modal */}
      {isEditModalOpen && editingTenant && (
        <EditTenantModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          editingTenant={editingTenant}
          onUpdate={closeEditModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingTenant && (
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
              zIndex: 1040,
            }}
            onClick={handleDeleteCancel}
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
              zIndex: 1050,
              overflow: "auto",
            }}
            tabIndex="-1"
            role="dialog"
            aria-labelledby="deleteTenantModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                {/* Modal Header */}
                <div className="modal-header">
                  <h5
                    className="modal-title text-danger"
                    id="deleteTenantModalLabel"
                  >
                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                    Confirm Delete
                  </h5>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <div className="alert alert-warning" role="alert">
                    <h6 className="alert-heading">Warning!</h6>
                    <p className="mb-0">
                      You are about to delete the tenant{" "}
                      <strong>"{deletingTenant.name}"</strong>. This action
                      cannot be undone.
                    </p>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <strong>Company Name:</strong>
                      <p>{deletingTenant.name}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Subdomain:</strong>
                      <p>{deletingTenant.subdomain}</p>
                    </div>
                  </div>

                  <div className="alert alert-danger" role="alert">
                    <i className="fa-solid fa-info-circle me-2"></i>
                    <strong>This will permanently delete:</strong>
                    <ul className="mb-0 mt-2">
                      <li>All tenant data and configurations</li>
                      <li>Associated courses and content</li>
                      <li>User accounts and permissions</li>
                      <li>All related records</li>
                    </ul>
                  </div>

                  <p className="text-muted">
                    <i className="fa-solid fa-shield-alt me-1"></i>
                    Please ensure you have backed up any important data before
                    proceeding.
                  </p>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleDeleteCancel}
                  >
                    <i className="fa-solid fa-times me-1"></i>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteConfirm}
                  >
                    <i className="fa-solid fa-trash me-1"></i>
                    Delete Tenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TenantsManagement;
