import React from "react";
import InstructorCard from "./InstructorCard";
import { useSelector } from "react-redux";

const ListInstructors = ({ onEdit, search, instructors: propInstructors }) => {
  const { instructors: reduxInstructors } = useSelector((state) => state.tenant);
  const instructors = propInstructors || reduxInstructors;
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {instructors
        .filter((instructor) =>
          instructor.name?.toLowerCase().includes(search.toLowerCase())
        )
        .map((instructor, index) => (
          <InstructorCard key={index} instructor={instructor} onEdit={onEdit} />
        ))}
    </div>
  );
};

export default ListInstructors;
