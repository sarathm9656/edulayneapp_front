import React from "react";
import { FaUser } from "react-icons/fa";
const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-800 text-white w-full">
      <h1 className="text-xl font-bold text-center">
        Welcome to <span className="text-yellow-500">Synnefo Solutions</span>
      </h1>
      <div className="flex items-center gap-4">
        <FaUser className="w-6 h-6" />
      </div>
    </div>
  );
};

export default Navbar;
