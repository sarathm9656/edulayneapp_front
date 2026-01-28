
    import React, { useEffect, useState } from 'react';
    import axios from "axios";

    const EditStudent = ({ isEditModalOpen, setIsEditModalOpen, student }) => {
        const [role_id, setRole_id] = useState(null);
        const [role, setRole] = useState([]);
        
        const [formData, setFormData] = useState({
            fname: '',
            lname: '',
            age: '',
            dob: '',
            phone_number: '',
            email: '',
            role_id: '',
            is_active: false,
            _id:""
        });

        useEffect(() => {
            if (student && student.user_id) {
                setFormData({
                    fname: student.user_id.fname || '',
                    lname: student.user_id.lname || '',
                    age: student.user_id.age || '',
                    dob: student.user_id.dob?.slice(0, 10) || '',
                    phone_number: student.user_id.phone_number || '',
                    email: student.user_id.email || '',
                    _id: student.user_id._id || '',
                    role_id: student.role_id?._id || '',
                    is_active: student.is_active || false,
                });
            }
        }, [student]);

        useEffect(() => {
            getRoles();
        }, []);

        async function getRoles() {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/roles`, { withCredentials: true });
                const tenantAdmin = res.data.data.find(role => role.name === "tenant_admin");
                setRole_id(tenantAdmin?._id);
                setRole(res.data.data);
            } catch (err) {
                console.error("Error fetching roles", err);
            }
        }

        const handleChange = (e) => {
            const { name, type, value, checked } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            console.log("Form Submitted:", formData);

            try {
                const emptyField = Object.entries(formData).some(
                    ([key, value]) => key !== "is_active" && value === ""
                );
                if (emptyField) {
                    alert("Please fill in all fields.");
                    return;
                }

                const res = await axios.put(
                    `${import.meta.env.VITE_API_URL}/users/${formData._id}`,
                    { ...formData, role_id: formData.role_id },
                    { withCredentials: true }
                );
                console.log("Submitted response:", res);
                setIsEditModalOpen(false);
            } catch (error) {
                console.error(error?.response?.data?.message || error.message);
            }
        };

        if (!isEditModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-[#000000d3] flex items-center justify-center z-50 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-center">User Information</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="fname"
                                placeholder="First Name"
                                value={formData.fname}
                                onChange={handleChange}
                                className="border border-gray-300 rounded p-2 w-full outline-none"
                                required
                            />
                            <input
                                type="text"
                                name="lname"
                                placeholder="Last Name"
                                value={formData.lname}
                                onChange={handleChange}
                                className="border border-gray-300 rounded p-2 w-full outline-none"
                                required
                            />
                        </div>
                        <input
                            type="number"
                            name="age"
                            placeholder="Age"
                            value={formData.age}
                            onChange={handleChange}
                            className="border border-gray-300 rounded p-2 w-full outline-none"
                            required
                        />
                        <input
                            type="date"
                            name="dob"
                            placeholder="Date of Birth"
                            value={formData.dob}
                            onChange={handleChange}
                            className="border border-gray-300 rounded p-2 w-full outline-none"
                            required
                        />
                        <input
                            type="tel"
                            name="phone_number"
                            placeholder="Phone Number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="border border-gray-300 rounded p-2 w-full outline-none"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="border border-gray-300 rounded p-2 w-full outline-none"
                            required
                        />
                        <select
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChange}
                            className="border border-gray-300 rounded p-2 w-full outline-none"
                            required
                        >
                            <option value={formData.role_id}>{role.find(role => role._id === formData.role_id)?.name}</option>
                            {role.map((r) => (
                                <option key={r._id} value={r._id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-4 h-4"
                            />
                            <label htmlFor="is_active" className="text-sm">Active</label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    export default EditStudent;
