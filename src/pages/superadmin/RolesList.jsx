import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PERMISSIONS } from "../../config/permissions";

const RolesList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  console.log(roleToDelete);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/roles`,
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      toast.error("Error fetching roles");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setRoleToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      console.log('Attempting to delete role:', roleToDelete);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/roles/${roleToDelete._id}`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        toast.success("Role deleted successfully");
        fetchRoles();
        closeDeleteModal();
      }
    } catch (error) {
      console.error('Delete role error:', error);
      const errorMessage = error.response?.data?.message || error.message || "Error deleting role";
      toast.error(errorMessage);
      console.log('Error response:', error.response);
    }
  };

  const getPermissionLabel = (permissionKey) => {
    // Find the permission label from the permission key
    for (const group of Object.values(PERMISSIONS)) {
      for (const [key, value] of Object.entries(group)) {
        if (value === permissionKey) {
          return key.toLowerCase().replace("_", " ");
        }
      }
    }
    return permissionKey;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Roles</h2>
          <button
            onClick={() => navigate("/superadmin/roles/create")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Role
          </button>
        </div>

        {roles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                    <td className="px-6 py-4">{role.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(role.permissions || []).map((permission) => (
                          <span
                            key={permission}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {getPermissionLabel(permission)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            navigate(`/superadmin/roles/${role._id}`)
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(role)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No roles found</div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Role
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the role "{roleToDelete?.name}
                  "? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesList;
