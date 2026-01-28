import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import TenantSidebar from "../../../components/tenants/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchTenant } from "../../../redux/tenant.slice";
import { fetchCourses } from "../../../redux/course.slice";
import { fetchInstructors } from "../../../redux/tenant.slice";
import { logoutUser } from "../../../redux/user.slice";
import api from "@/api/axiosInstance";
import { toast } from "react-toastify";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { tenant } = useSelector((state) => state.tenant);
  const [isMenuHidden, setIsMenuHidden] = useState(false);

  useEffect(() => {
    dispatch(fetchTenant());
    dispatch(fetchCourses(1));
    dispatch(fetchInstructors());
  }, []);

  const toggleMenu = () => {
    setIsMenuHidden(!isMenuHidden);
  };

  useEffect(() => {
    if (isMenuHidden) {
      document.body.classList.add("hidemenu");
    } else {
      document.body.classList.remove("hidemenu");
    }
  }, [isMenuHidden]);

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/check-auth");
      if (response.status === 401) {
        navigate("/users/login");
      }
      if (response.data.user.role !== "tenant") {
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

  // Handle logout function
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error(error?.message || "Error logging out");
    }
  };

  // Get current page title based on location
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard") || path === "/tenant") return "Dashboard";
    if (path.includes("courses")) return "Courses";
    if (path.includes("instructors")) return "Instructors";
    if (path.includes("batches")) return "Batches";
    if (path.includes("students")) return "Students";
    if (path.includes("meetings")) return "Live Sessions";
    return "Dashboard";
  };

  // Get the first letter of the tenant's name for the profile icon
  const getProfileInitial = () => {
    if (tenant?.user?.user_id?.fname) {
      return tenant.user.user_id.fname.charAt(0).toUpperCase();
    }
    if (tenant?.name) {
      return tenant.name.charAt(0).toUpperCase();
    }
    return "T"; // Fallback to "T" for Tenant
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
      <TenantSidebar toggleMenu={toggleMenu} />

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
            <div className="col-lg-6 col-md-4 col-sm-4 col-5">
              <div className="dropdown">
                <button
                  className="profile-icon"
                  href="#"
                  role="button"
                  id="dropdownMenuLink"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {getProfileInitial()}
                </button>

                <ul
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuLink"
                >
                  <li>
                    <Link className="dropdown-item" to="/tenant/profile">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={handleLogout}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </div>

              <button className="bell-icon active">
                <i className="fa-regular fa-bell"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="container-wrapper-scroll">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
