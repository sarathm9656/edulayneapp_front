import React from "react";
import { FaSearch } from "react-icons/fa";
const Search = () => {
  return (
    // align to right end
    <div className="flex items-center gap-2 lg:w-1/3 w-full bg-white p-2 rounded-md justify-end ">
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 rounded-md outline-none"
      />
      <FaSearch className="w-6 h-6" />
    </div>
  );
};

export default Search;
