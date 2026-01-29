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
    { label: "Dashboard", path: "/instructor", icon: "fa-gauge-high" },
    { label: "My Courses", path: "/instructor/instructor_courses", icon: "fa-graduation-cap" },
    { label: "Batches", path: "/instructor/batches", icon: "fa-layer-group" },
    { label: "Earnings", path: "/instructor/earnings", icon: "fa-indian-rupee-sign" },
  ];

  return (
    <>
      {/* Overlay (mobile only) */}
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
      />

      <aside className={`modern-sidebar ${isOpen ? "active" : ""}`}>
        {/* Logo */}
        <div className="modern-logo d-flex justify-content-center align-items-center">
          <img
            src="/img/edulayne-full-logo.png"
            alt="Edulayne"
            style={{ height: "80px" }}
          />
        </div>

        {/* Menu */}
        <nav className="modern-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`modern-nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => window.innerWidth < 992 && toggleMenu()}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto px-3 pb-3">
          <button
            onClick={handleLogout}
            className="modern-logout w-100"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default InstructorSidebar;
