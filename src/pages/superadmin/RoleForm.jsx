import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PERMISSION_GROUPS } from '../../config/permissions';

const RoleForm = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    if (roleId) {
      fetchRole();
    }
  }, [roleId]);

  const fetchRole = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/roles/${roleId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        const role = response.data.data;
        setFormData({
          name: role.name,
          description: role.description,
          permissions: role.permissions || []
        });
      }
    } catch (error) {
      toast.error('Error fetching role details');
      navigate('/superadmin/roles');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionKey) => {
    setFormData(prev => {
      const permissions = prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...prev.permissions, permissionKey];
      
      return {
        ...prev,
        permissions
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = roleId
        ? `${import.meta.env.VITE_API_URL}/roles/${roleId}`
        : `${import.meta.env.VITE_API_URL}/roles`;
      
      const method = roleId ? 'put' : 'post';
      
      const response = await axios[method](
        url,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Role ${roleId ? 'updated' : 'created'} successfully`);
        navigate('/superadmin/roles');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Error ${roleId ? 'updating' : 'creating'} role`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {roleId ? 'Edit Role' : 'Create Role'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter role name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter role description"
              rows="3"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
            <div className="space-y-6">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.name} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{group.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.key}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.key)}
                          onChange={() => handlePermissionChange(permission.key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {permission.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/superadmin/roles')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : roleId ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm; 