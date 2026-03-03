import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Tooltip,
} from "@material-tailwind/react";

export function StudentCard({ student, onEdit }) {
  const status = student.status || (typeof student.is_active === 'boolean' ? (student.is_active ? 'active' : 'inactive') : 'active');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  console.log(student, "student inside the StudentCard");
  return (
    <Card className="w-66 shadow-2xl relative">
      {/* Status Badge */}
      <span
        className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold z-10
          ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      {/* 3-dot menu */}
      <div className="absolute top-2 right-2 z-20" ref={menuRef}>
        <button
          className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open menu"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="4" cy="10" r="2" />
            <circle cx="10" cy="10" r="2" />
            <circle cx="16" cy="10" r="2" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg py-1">
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(false);
                if (onEdit) onEdit();
              }}
            >
              Edit
            </button>
          </div>
        )}
      </div>
      <CardHeader floated={false} className="flex justify-center">
        <img
          className="w-40 h-40 object-cover rounded-full"
          src="https://www.freepnglogos.com/uploads/student-png/student-png-currents-change-social-studies-lesson-materials-7.png"
          alt="profile-picture"
        />
      </CardHeader>
      <CardBody className="text-left">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          {student.fname} {student.lname}
        </Typography>
        <Typography color="blue-gray" className="font-medium" textGradient>
          Email : <span className="text-red-500">{student.email}</span>
        </Typography>
        <Typography color="blue-gray" className="font-medium" textGradient>
          Phone : <span className="text-slate-500">{student.phone_number}</span>
        </Typography>
      </CardBody>
      <CardFooter className="flex justify-center gap-7 pt-2">
        {/* Edit button removed, now in dropdown */}
      </CardFooter>
    </Card>
  );
}

export default StudentCard;
