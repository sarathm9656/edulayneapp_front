import { Link } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdSecurity,
  MdSchool,
  MdBusiness,
  MdSettings,
} from "react-icons/md";

export const Sidebar = () => {
  const menuItems = [
    {
      label: "Dashboard",
      icon: <MdDashboard className="w-6 h-6" />,
      path: "/superadmin/dashboard",
    },
    {
      label: "Users",
      icon: <MdPeople className="w-6 h-6" />,
      path: "/superadmin/users",
    },
    {
      label: "Roles",
      icon: <MdSecurity className="w-6 h-6" />,
      path: "/superadmin/roles",
    },
    {
      label: "Courses",
      icon: <MdSchool className="w-6 h-6" />,
      path: "/superadmin/courses",
    },
    {
      label: "Tenants",
      icon: <MdBusiness className="w-6 h-6" />,
      path: "/superadmin/tenants",
    },
    {
      label: "Settings",
      icon: <MdSettings className="w-6 h-6" />,
      path: "/superadmin/settings",
    },
  ];

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
};
