import React, { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, fetchUser } from "../../redux/user.slice";
import InstructorSidebar from "../../components/instructor/Sidebar";
import "../Tenent/layouts/modern-dashboard.css";

function InstructorHeader({ toggleMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard") || path === "/instructor") return "Dashboard";
    if (path.includes("courses")) return "My Courses";
    if (path.includes("students")) return "My Students";
    if (path.includes("meetings")) return "Live Sessions";
    if (path.includes("batches")) return "My Batches";
    if (path.includes("earnings")) return "My Earnings";
    if (path.includes("profile")) return "Profile";
    return "Dashboard";
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/users/login");
    } catch (error) {
      toast.error(error?.message || "Error logging out");
    }
  };

  return (
    <div className="modern-header">
      <div className="d-flex align-items-center gap-3">
        <button className="menu-toggle" onClick={toggleMenu}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="modern-header-title">
          <h2 className="fw-bold mb-0">{getPageTitle()}</h2>
          <p className="text-muted mb-0 small">Manage your teaching activities</p>
        </div>
      </div>

      <div className="modern-header-actions">
        <div className="modern-user-profile">
          <button className="btn btn-light rounded-circle shadow-sm position-relative">
            <i className="fa-regular fa-bell text-muted"></i>
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
          </button>

          <div className="dropdown">
            <div
              className="d-flex align-items-center gap-2"
              role="button"
              data-bs-toggle="dropdown"
            >
              <div
                className="avatar-placeholder bg-pink-light text-pink rounded-3 d-flex align-items-center justify-content-center fw-bold"
                style={{ width: "40px", height: "40px" }}
              >
                {user?.user?.user_id?.fname?.charAt(0) || "I"}
              </div>
              <div className="d-none d-md-block text-start">
                <h6 className="mb-0 fw-bold">
                  {user?.user?.user_id?.fname} {user?.user?.user_id?.lname}
                </h6>
                <small className="text-muted">Instructor</small>
              </div>
            </div>
            <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-2">
              <li>
                <Link className="dropdown-item rounded-3 mb-1" to="/instructor/profile">
                  <i className="fa-regular fa-user me-2"></i> Profile
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item rounded-3 text-danger"
                  onClick={handleLogout}
                >
                  <i className="fa-solid fa-right-from-bracket me-2"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstructorLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/check-auth`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 401) {
        navigate("/users/login");
      }
      if (response.data.user.role !== "instructor") {
        navigate("/users/login");
      }
    } catch (error) {
      console.log(error, "error");
      navigate("/users/login");
    }
  };

  useEffect(() => {
    checkAuth();
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <div className="modern-layout">
      <InstructorSidebar isOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <main className="modern-main">
        <InstructorHeader toggleMenu={toggleMenu} />
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
