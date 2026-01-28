import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/user.slice";
import { toast } from "react-hot-toast";

const InstructorSidebar = ({ isOpen, toggleMenu }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/users/login");
    } catch (error) {
      toast.error(error?.message || "Error logging out");
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: <i className="fa-solid fa-gauge-high"></i>,
      path: "/instructor",
    },
    {
      label: "My Courses",
      icon: <i className="fa-solid fa-graduation-cap"></i>,
      path: "/instructor/instructor_courses",
    },
    {
      label: "Batches",
      icon: <i className="fa-solid fa-layer-group"></i>,
      path: "/instructor/batches",
    },
    {
      label: "Earnings",
      icon: <i className="fa-solid fa-indian-rupee-sign"></i>,
      path: "/instructor/earnings",
    },
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
      ></div>
      <aside className={`modern-sidebar ${isOpen ? "active" : ""}`}>
        <div className="modern-logo" style={{ width: "100%", justifyContent: "center" }}>
          <img src="/img/edulayne-full-logo.png" alt="Edulayne" style={{ height: "40px", width: "auto" }} />
        </div>

        <nav className="modern-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`modern-nav-item ${location.pathname === item.path ? "active" : ""
                }`}
              onClick={() => window.innerWidth < 992 && toggleMenu()}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <a onClick={handleLogout} className="modern-logout">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default InstructorSidebar;
