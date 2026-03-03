import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../components/super-admin/Sidebar";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchTenantsWithCourseCountandUserCount, fetchCurrentSuperAdmin } from "../../redux/super.admin.slice";
import { logoutUser } from "../../redux/user.slice";

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tenantDetails, currentSuperAdmin } = useSelector((state) => state.superAdmin);
  const [isMenuHidden, setIsMenuHidden] = useState(false);
  const location = useLocation();

  // console.log("tenantDetails", tenantDetails);

  useEffect(() => {
    dispatch(fetchTenantsWithCourseCountandUserCount());
    dispatch(fetchCurrentSuperAdmin());
  }, []);

  const toggleMenu = () => {
    setIsMenuHidden(!isMenuHidden);
  };

  // Handle logout function
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/superadmin/auth");
    } catch (error) {
      toast.error(error?.message || "Error logging out");
    }
  };
  useEffect(() => {
    if (isMenuHidden) {
      window.document.body.classList.add("hidemenu");
    } else {
      document.body.classList.remove("hidemenu");
    }
  }, [isMenuHidden]);

  // Get current page title based on location
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("tenants")) return "Tenants";
    if (path.includes("courses")) return "Courses";
    if (path.includes("users")) return "Users";
    if (path.includes("analytics")) return "Analytics";
    if (path.includes("profile")) return "Profile";
    return "Dashboard";
  };

  // Get the first letter of the super admin's name for the profile icon
  const getProfileInitial = () => {
    if (currentSuperAdmin?.name) {
      return currentSuperAdmin.name.charAt(0).toUpperCase();
    }
    return "SA"; // Fallback to "SA" if no name is available
  };

  return (
    <div
      style={{
        background: "url(/img/bg.jpg) no-repeat center center fixed #e2eaf3",
        backgroundSize: "cover",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Sidebar toggleMenu={toggleMenu} />

      <section className="headertop-wrapper">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-6 col-md-8 col-sm-8 col-7">
              <button
                className="burgermenu"
                id="menubutton"
                onClick={toggleMenu}
              >
                <i className="fa-solid fa-bars"></i>
              </button>
              <h4>{getPageTitle()}</h4>
            </div>
            <div className="col-lg-6 col-md-4 col-sm-4 col-5 d-flex justify-content-end align-items-center gap-3">
              <button className="bell-icon active border-0 bg-transparent position-relative">
                <i className="fa-regular fa-bell"></i>
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span className="visually-hidden">New alerts</span>
                </span>
              </button>

              <div className="dropdown border-start ps-3">
                <button
                  className="d-flex align-items-center gap-2 border-0 bg-transparent p-0"
                  type="button"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="text-end d-none d-md-block">
                    <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                      {currentSuperAdmin?.name || "Super Admin"}
                    </h6>
                    <span className="text-muted d-block" style={{ fontSize: '0.75rem', lineHeight: '1' }}>Administrator</span>
                  </div>
                  <div
                    className="profile-icon shadow-sm text-white"
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                      fontSize: '1.2rem',
                    }}
                  >
                    {currentSuperAdmin?.profile_image ? (
                      <img
                        src={currentSuperAdmin.profile_image}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover rounded-circle border border-2 border-white"
                      />
                    ) : (
                      getProfileInitial()
                    )}
                  </div>
                </button>

                <ul
                  className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-3 animate__animated animate__fadeIn"
                  aria-labelledby="profileDropdown"
                  style={{ minWidth: '200px' }}
                >
                  <li className="px-3 py-2 border-bottom bg-light mb-2">
                    <div className="fw-bold text-dark">{currentSuperAdmin?.name || "Super Admin"}</div>
                    <div className="small text-muted text-truncate">{currentSuperAdmin?.email}</div>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center" to="/superadmin/profile">
                      <i className="fa-regular fa-user me-2 text-primary bg-primary bg-opacity-10 p-2 rounded-circle"></i>
                      <span>My Profile</span>
                    </Link>
                  </li>
                  {/* <li><a className="dropdown-item" href="#">Settings</a></li> */}
                  <li><hr className="dropdown-divider mx-2" /></li>
                  <li>
                    <button
                      className="dropdown-item py-2 d-flex align-items-center text-danger"
                      onClick={handleLogout}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket me-2 bg-danger bg-opacity-10 p-2 rounded-circle"></i>
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
