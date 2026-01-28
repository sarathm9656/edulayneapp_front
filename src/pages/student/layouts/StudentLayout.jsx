import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser, logoutUser } from "../../../redux/user.slice";
import StudentSidebar from "../../../components/students/StudentSidebar";
import api from "@/api/axiosInstance";
import { toast } from "react-toastify";
import "../../Tenent/layouts/modern-dashboard.css";

const StudentHeader = ({ toggleMenu, user, handleLogout, getPageTitle }) => {
  return (
    <div className="modern-header">
      <div className="d-flex align-items-center gap-3">
        <button className="menu-toggle" onClick={toggleMenu}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="modern-header-title">
          <h2 className="fw-bold mb-0">{getPageTitle()}</h2>
          <p className="text-muted mb-0 small">Welcome to your learning portal</p>
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
                className="avatar-placeholder bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center fw-bold"
                style={{ width: "40px", height: "40px" }}
              >
                {user?.user?.user_id?.fname?.charAt(0) || "S"}
              </div>
              <div className="d-none d-md-block text-start">
                <h6 className="mb-0 fw-bold">
                  {user?.user?.user_id?.fname} {user?.user?.user_id?.lname}
                </h6>
                <small className="text-muted">Student</small>
              </div>
            </div>
            <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-2">
              <li>
                <a className="dropdown-item rounded-3 mb-1" href="/student/profile">
                  <i className="fa-regular fa-user me-2"></i> Profile
                </a>
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
};

const StudentLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.user?.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/check-auth");
      if (response.status === 401) {
        navigate("/users/login");
      }
      if (response.data.user.role !== "student") {
        navigate("/users/login");
      }
    } catch (error) {
      console.log(error, "error");
      navigate("/users/login");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error(error?.message || "Error logging out");
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard') || path === '/student') return 'Dashboard';
    if (path.includes('courses')) return 'My Courses';
    if (path.includes('livesession')) return 'Live Sessions';
    if (path.includes('profile')) return 'Profile';
    if (path.includes('progress')) return 'Progress';
    if (path.includes('certificates')) return 'Certificates';
    return 'Dashboard';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="modern-layout">
      <StudentSidebar isOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <main className="modern-main">
        <StudentHeader
          toggleMenu={toggleMenu}
          user={user}
          handleLogout={handleLogout}
          getPageTitle={getPageTitle}
        />
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
