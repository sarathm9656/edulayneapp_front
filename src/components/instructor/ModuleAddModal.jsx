import React from "react";
import { FaTimes } from "react-icons/fa";
import InstructorLessons from "../../pages/Instructor/InstructorLesson";

const InstructorModuleAddModal = ({ course, setIsAddModuleSectionOpen }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      {/* close button */}
      <div className="bg-white p-4 rounded-lg w-4xl overflow-y-auto max-h-[90vh]">
        {/* close icon  in the section itself */}
        <div className="flex justify-end mb-4">
          <button
            className="text-white bg-black  hover:rotate-180 transition-all duration-300 cursor-pointer rounded-full p-2"
            onClick={() => setIsAddModuleSectionOpen(false)}
          >
            <FaTimes />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <InstructorLessons course={course} />
        </div>
      </div>
    </div>
  );
};

export default InstructorModuleAddModal; 