import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const UsersListing = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch tenants and roles on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tenantsRes, rolesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/superadmin/tenants`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/roles`, {
            withCredentials: true,
          }),
        ]);

        if (tenantsRes.data.success) {
          setTenants(tenantsRes.data.data);
        }
        if (rolesRes.data.success) {
          // Filter out super admin role from the list
          const filteredRoles = rolesRes.data.data.filter(
            (role) => !role.is_super_admin
          );
          setRoles(filteredRoles);
        }
      } catch (error) {
        toast.error("Error fetching data");
      }
    };

    fetchInitialData();
  }, []);

  // Fetch all users initially
  useEffect(() => {
    fetchUsers();
  }, [selectedTenant, selectedRole, search, pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/users`;
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: search,
      });

      // Add role and tenant filters if selected
      if (selectedRole) {
        params.append("role_id", selectedRole);
      }
      if (selectedTenant) {
        params.append("tenant_id", selectedTenant);
      }

      const response = await axios.get(`${url}?${params}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setAllUsers(response.data.data);
        setFilteredUsers(response.data.data);
        setPagination({
          ...pagination,
          total: response.data.pagination?.total || response.data.data.length,
          pages:
            response.data.pagination?.pages ||
            Math.ceil(response.data.data.length / pagination.limit),
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const isSuperAdmin = (user) => {
    return user.role?.is_super_admin === true;
  };

  const handleEdit = (user) => {
    if (isSuperAdmin(user)) {
      toast.warning("Super admin users cannot be edited");
      return;
    }
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${selectedUser._id}`,
        selectedUser,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("User updated successfully");
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating user");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle user status toggle
  const handleStatusToggle = async (user) => {
    if (isSuperAdmin(user)) {
      toast.warning("Cannot modify super admin status");
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${user._id}`,
        {
          ...user,
          is_active: !user.is_active,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(
          `User ${user.is_active ? "deactivated" : "activated"} successfully`
        );
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error updating user status"
      );
    }
  };

  // Handle activate user
  const handleActivateUser = async (user) => {
    if (isSuperAdmin(user)) {
      toast.warning("Cannot modify super admin status");
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${user._id}`,
        {
          ...user,
          is_active: true,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("User activated successfully");
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error activating user");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Users Listing</h2>

        {/* Search and Filter Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tenant Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Tenant
              </label>
              <select
                value={selectedTenant}
                onChange={(e) => {
                  setSelectedTenant(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tenants</option>
                {tenants.map((tenant) => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(search || selectedTenant || selectedRole) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Search: {search}
                  <button
                    onClick={() => setSearch("")}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedTenant && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Tenant: {tenants.find((t) => t._id === selectedTenant)?.name}
                  <button
                    onClick={() => setSelectedTenant("")}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedRole && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Role: {roles.find((r) => r._id === selectedRole)?.name}
                  <button
                    onClick={() => setSelectedRole("")}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {(search || selectedTenant || selectedRole) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedTenant("");
                    setSelectedRole("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : filteredUsers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.fname} {user.lname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.tenant?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <button
                            onClick={() => handleStatusToggle(user)}
                            disabled={isSuperAdmin(user)}
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 hover:bg-green-200 ${
                              isSuperAdmin(user)
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                            }`}
                          >
                            Active
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleActivateUser(user)}
                              disabled={isSuperAdmin(user)}
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 hover:bg-red-200 ${
                                isSuperAdmin(user)
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              }`}
                            >
                              Activate
                            </button>
                            <button
                              onClick={() => handleStatusToggle(user)}
                              disabled={isSuperAdmin(user)}
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 ${
                                isSuperAdmin(user)
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              }`}
                            >
                              Inactive
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(user)}
                          className={`${
                            isSuperAdmin(user)
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:text-blue-900"
                          }`}
                          disabled={isSuperAdmin(user)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">No users found</div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Edit User
              </h3>
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="fname"
                      value={selectedUser.fname}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lname"
                      value={selectedUser.lname}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={selectedUser.email}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      name="role_id"
                      value={selectedUser.role_id}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={isSuperAdmin(selectedUser)}
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersListing;
