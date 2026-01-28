import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Pagination } from "@mui/material";
import UserCreationModal from "../../components/User/UserCreationModal";
import { useSelector } from "react-redux";

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  // console.log(tenants, "tenants state=========sssssssssssssssssss=");
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10); // Convert to state variable
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);




  useEffect(() => {
    fetchTenants();
    fetchRoles();
  }, []); // Only fetch once on component mount

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, selectedTenant, selectedRole, itemsPerPage, searchValue]); // Fetch users when filters change



  const fetchUsers = async (page = 1) => {
    try {
      setTableLoading(true);
      let url = `${import.meta.env.VITE_API_URL}/users?page=${page}&limit=${itemsPerPage}`;

      // Add filters if selected
      if (selectedRole !== "all") {
        url += `&role=${selectedRole}`;
      }
      if (selectedTenant !== "") {
        url += `&tenant=${selectedTenant}`;
      }
      if (searchValue && searchValue.trim() !== "") {
        url += `&search=${encodeURIComponent(searchValue.trim())}`;
      }

      // console.log("Fetching users with URL:", url);
      // console.log("Search value being sent:", searchValue);

      const response = await axios.get(url, { withCredentials: true });
      // console.log("API Response:", response.data);
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalUsers(response.data.total || response.data.data.length);
        setTotalPages(Math.ceil((response.data.total || response.data.data.length) / itemsPerPage));
      }
    } catch (error) {
      toast.error("Error fetching users");
      setUsers([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/roles`,
        { withCredentials: true }
      );
      // console.log(response, "roles fetch");
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch (error) {
      toast.error("Error fetching roles");
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      setTenantsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tenants/list`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setTenants(response.data.data || []);
      }
    } catch (error) {
      toast.error("Error fetching tenants");
      setTenants([]);
    } finally {
      setTenantsLoading(false);
    }
  };

  const filterUsers = (roleId) => {
    setSelectedRole(roleId);
  };

  const searchUsers = (value) => {
    setSearchValue(value);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedRole("all");
    setSelectedTenant("");
    setSearchValue("");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedRole !== "all" || selectedTenant !== "" || searchValue !== "";

  const toggleUserStatus = async (userId) => {
    // confirm the action
    const confirm = window.confirm(
      "Are you sure you want to toggle the user status?"
    );
    if (!confirm) {
      return;
    }
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/toggle-status/${userId}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("User status toggled successfully");
        fetchUsers(currentPage);
      }
    } catch (error) {
      toast.error("Error toggling user status");
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/${userToDelete._id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("User deleted successfully");
        setDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers(currentPage);
      }
    } catch (error) {
      toast.error("Error deleting user");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-between userlist-header">
        <div className="col-lg-4 col-md-6">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-7">
              <select
                className="form-select"
                value={selectedTenant}
                onChange={(e) => {
                  setSelectedTenant(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={tenantsLoading}
              >
                <option value="">
                  {tenantsLoading ? "Loading tenants..." : "Select Tenant"}

                </option>
                {tenants && tenants.length > 0 && tenants.map((tenant) => (
                  <option value={tenant._id} key={tenant._id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
            {/* <div className="col-lg-6 col-md-6 col-5">
              <button className="addtenant-btn" onClick={handleOpen}>
                <i className="fa-solid fa-plus"></i> Create User
              </button>
            </div> */}
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-7">
              <div className="input-group">
                {/* <span className={`input-group-text ${searchValue ? 'bg-primary text-white' : ''}`}>
                  <i className="fa-solid fa-search"></i>
                </span> */}
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={searchValue}
                  onChange={(e) => searchUsers(e.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      searchUsers(e.target.value);
                      e.preventDefault();
                    }
                  }}

                  disabled={tableLoading}
                />
                {/* {searchValue && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => searchUsers("")}
                    title="Clear search"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                )} */}
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-5">
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => filterUsers(e.target.value)}
                disabled={rolesLoading}
              >
                <option value="all">
                  {rolesLoading ? "Loading roles..." : "All Users"}
                </option>
                {roles && roles.length > 0 && roles.map((role) => (
                  <option value={role._id} key={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-7">

              {hasActiveFilters && (
                <button
                  className={`btn ${hasActiveFilters ? 'btn-warning' : 'btn-secondary'}`}
                  onClick={clearFilters}
                  style={{ width: '100%' }}
                  disabled={!hasActiveFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
            {/* <div className="col-lg-6 col-md-6 col-5">
              <button className="addtenant-btn" onClick={handleOpen}>
                <i className="fa-solid fa-plus"></i> Create User
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {open && roles && roles.length > 0 && (
        <UserCreationModal
          open={open}
          handleOpen={handleOpen}
          handleClose={handleClose}
          roles={roles}
        />
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="alert alert-info mt-3 mb-3">
          <strong>Active Filters:</strong>
          {selectedRole !== "all" && (
            <span className="badge bg-primary me-2">
              Role: {roles.find(r => r._id === selectedRole)?.name || selectedRole}
            </span>
          )}
          {selectedTenant !== "" && (
            <span className="badge bg-success me-2">
              Tenant: {tenants.find(t => t._id === selectedTenant)?.name || selectedTenant}
            </span>
          )}
          {searchValue !== "" && (
            <span className="badge bg-info me-2">
              Search: "{searchValue}"
            </span>
          )}
        </div>
      )}

      <div className="table-responsive table-styles mt-4">
        {/* Results Summary */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* <div>
            <strong>Showing {users.length} of {totalUsers} users</strong>
            {hasActiveFilters && (
              <span className="text-muted ms-2">
                (filtered results)
              </span>
            )}
          </div> */}
          <div>
            {/* <select
              value={itemsPerPage}
              onChange={handleLimitChange}
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select> */}
          </div>
        </div>

        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Tenant</th>
              <th scope="col">Status</th>
              {/* <th scope="col">Actions</th> */}
            </tr>
          </thead>
          <tbody>

            {tableLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <p className="text-muted">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user._id}>
                  <th scope="row">{(currentPage - 1) * itemsPerPage + index + 1}</th>
                  <td>{user.fname} {user.lname}</td>
                  <td>{user.email}</td>
                  <td>{user.role?.name || "N/A"}</td>
                  <td>{user.tenant?.name || "N/A"}</td>
                  <td>
                    <span
                      onClick={() => toggleUserStatus(user._id)}
                      className={`px-2 py-1 rounded-full text-sm cursor-pointer ${user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {/* <td>
                    <button 
                      className="edit"
                      onClick={() => {
                        setUserToEdit(user);
                        setEditModalOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button 
                      className="delete"
                      onClick={() => {
                        setUserToDelete(user);
                        setDeleteModalOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center my-4">
        <div className="d-flex align-items-center">
          <span className="me-2">Show:</span>
          <select
            value={itemsPerPage}
            onChange={handleLimitChange}
            className="form-select form-select-sm me-3"
            style={{ width: 'auto' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          {/* <span className="text-muted">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} entries
          </span> */}
        </div>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </div>


      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete {userToDelete?.fname} {userToDelete?.lname}?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteUser}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - You can implement this similar to UserCreationModal */}
      {editModalOpen && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Add edit form here */}
                <p>Edit functionality to be implemented</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
