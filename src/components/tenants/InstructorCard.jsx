import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Tooltip,
} from "@material-tailwind/react";
import axios from "axios";
import { useState } from "react";
import { deleteInstructor, fetchInstructors } from "../../redux/tenant.slice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
export function InstructorCard({ instructor, onEdit, onDelete }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useDispatch();


  console.log(instructor, "instructor================");

  const navigate = useNavigate();
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEdit = () => {
    setShowDropdown(false);
    onEdit && onEdit(instructor);
  };

  const handleDelete = async (instructor) => {
    console.log(instructor);
    try {
      await dispatch(deleteInstructor(instructor)).unwrap();
      setShowDropdown(false);
      // Refetch instructors after successful delete
      dispatch(fetchInstructors());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card className="w-66 shadow-2xl relative cursor-pointer">
      <CardHeader floated={false} className="relative">
        <img
          className="w-full h-full object-cover"
          src="https://imgs.search.brave.com/FtYHVsc4P8McEV3twQ6jBZOUqy36aRSvD5AM4DMVfjY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvNC9NYWxl/LVRlYWNoZXItUE5H/LUNsaXBhcnQucG5n"
          alt="profile-picture"
        />
        {instructor.status !== "undefined" && (
          <span
            className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${instructor.status
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
              }`}
          >
            {instructor.status ? "Active" : "Inactive"}
          </span>
        )}

        {/* 3-dots menu */}
        <div className="absolute top-2 right-2">
          <button
            onClick={handleMenuClick}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-50 border">
              <div className="py-1">
                <button
                  onClick={handleEdit}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    navigate(`/tenant/instructor/${instructor.id}`)
                  }
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  View Details
                </button>
                {/* <button
                  onClick={()=>handleDelete(instructor)}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button> */}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody className="text-center">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          {instructor.name}
        </Typography>
        <Typography color="blue-gray" className="font-medium" textGradient>
          Role : {instructor.role}
        </Typography>
      </CardBody>
      {/* <CardFooter className="flex justify-center gap-7 pt-2"></CardFooter> */}
    </Card>
  );
}

export default InstructorCard;
