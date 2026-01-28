import React from "react";
import { useState } from "react";
import { MdClose } from "react-icons/md";

const UserCreationModal = ({ open, handleOpen, handleClose, roles }) => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users`,
        formData
      );
      console.log(response);
      if (response.data.success) {
        toast.success("User created successfully");
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-[#000000ea]  flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-md w-1/2 relative">
        <div className="flex justify-end cursor-pointer">
          <MdClose onClick={handleClose} />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 border-2 border-gray-300 rounded-md p-4"
        >
          <input
            className="border-2 border-gray-300 rounded-md p-2"
            type="text"
            name="fname"
            placeholder="First Name"
            value={formData.fname}
            onChange={handleChange}
          />
          <input
            className="border-2 border-gray-300 rounded-md p-2"
            type="text"
            name="lname"
            placeholder="Last Name"
            value={formData.lname}
            onChange={handleChange}
          />
          <input
            className="border-2 border-gray-300 rounded-md p-2"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            className="border-2 border-gray-300 rounded-md p-2"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <select
            className="border-2 border-gray-300 rounded-md p-2"
            name="role"
            id=""
            value={formData.role}
            onChange={handleChange}
          >
            <option className="text-gray-500" value="">
              Select Role
            </option>
            {roles.map((role) => (
              <option className="text-gray-500" value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md p-2"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserCreationModal;
