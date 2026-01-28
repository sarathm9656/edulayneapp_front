import { MdDashboard, MdSchool } from "react-icons/md";
import { Link } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: <MdDashboard className="w-6 h-6" />,
    path: "/student",
  },
  {
    label: "Courses",
    icon: <MdSchool className="w-6 h-6" />,
    path: "/student/courses",
  },
  {
    label: "Lessons",
    icon: <MdSchool className="w-6 h-6" />,
    path: "/student/lessons",
  },
  {
    label: "Quizzes",
    icon: <MdSchool className="w-6 h-6" />,
    path: "/student/quizzes",
  },
];

export default function StudentSidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
