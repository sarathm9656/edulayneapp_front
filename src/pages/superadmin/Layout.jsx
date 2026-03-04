import React, { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../../components/super-admin/Sidebar";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchTenantsWithCourseCountandUserCount, fetchCurrentSuperAdmin } from "../../redux/super.admin.slice";
import { logoutUser } from "../../redux/user.slice";
import "./superadmin-theme.css";

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tenantDetails, currentSuperAdmin } = useSelector((state) => state.superAdmin);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchTenantsWithCourseCountandUserCount());
    dispatch(fetchCurrentSuperAdmin());
  }, [dispatch]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 991.98px)");

    const applyFromMedia = () => {
      setIsSidebarCollapsed(media.matches);
    };

    applyFromMedia();
    media.addEventListener?.("change", applyFromMedia);
    return () => media.removeEventListener?.("change", applyFromMedia);
  }, []);

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

  const toggleSidebar = () => setIsSidebarCollapsed((v) => !v);

  // Get current page title based on location
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("tenants")) return "Tenants";
    if (path.includes("courses")) return "Courses";
    if (path.includes("users")) return "Users";
    if (path.includes("analytics")) return "Analytics";
    if (path.includes("profile")) return "Profile";
    if (path.includes("settings")) return "Settings";
    if (path.includes("roles")) return "Roles";
    return "Dashboard";
  }, [location.pathname]);

  // Get the first letter of the super admin's name for the profile icon
  const getProfileInitial = () => {
    if (currentSuperAdmin?.name) {
      return currentSuperAdmin.name.charAt(0).toUpperCase();
    }
    return "SA"; // Fallback to "SA" if no name is available
  };

  const tenantOptions = useMemo(() => {
    return (tenantDetails || [])
      .map((t) => ({
        id: t?.tenant?._id,
        name: t?.tenant?.name || "Unnamed Tenant",
      }))
      .filter((t) => !!t.id);
  }, [tenantDetails]);

  const handleTenantJump = (e) => {
    const tenantId = e.target.value;
    if (!tenantId) return;
    navigate(`/superadmin/tenants/${tenantId}`);
    e.target.value = "";
  };

  return (
    <div className={`sa-shell ${isSidebarCollapsed ? "sa-sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={isSidebarCollapsed} onCollapseToggle={toggleSidebar} />
      <button
        className="sa-overlay"
        type="button"
        aria-label="Close sidebar"
        onClick={() => setIsSidebarCollapsed(true)}
      />

      <div className="sa-main">
        <header className="sa-topbar">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="sa-icon-btn"
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <div className="sa-title">
              <div className="sa-title-main">{pageTitle}</div>
              <div className="sa-title-sub">Super Admin</div>
            </div>
          </div>

          <div className="d-none d-md-flex align-items-center gap-2 sa-topbar-center">
            <select
              className="form-select form-select-sm sa-tenant-jump"
              defaultValue=""
              onChange={handleTenantJump}
              aria-label="Jump to tenant"
            >
              <option value="">Jump to tenant…</option>
              {tenantOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Link to="/superadmin/tenants" className="btn btn-sm btn-outline-primary sa-pill-btn">
              <i className="fa-solid fa-building me-2"></i>
              Tenants
            </Link>
          </div>

          <div className="d-flex align-items-center gap-2 justify-content-end">
            <button className="sa-icon-btn" type="button" title="Notifications" aria-label="Notifications">
              <i className="fa-regular fa-bell"></i>
            </button>

            <div className="dropdown">
              <button
                className="sa-profile-btn"
                type="button"
                id="profileDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="sa-profile-meta d-none d-md-block">
                  <div className="sa-profile-name">{currentSuperAdmin?.name || "Super Admin"}</div>
                  <div className="sa-profile-role">Administrator</div>
                </div>
                <div className="sa-avatar" aria-hidden="true">
                  {currentSuperAdmin?.profile_image ? (
                    <img src={currentSuperAdmin.profile_image} alt="" />
                  ) : (
                    <span>{getProfileInitial()}</span>
                  )}
                </div>
              </button>

              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2 sa-dropdown">
                <li className="px-3 py-2 border-bottom">
                  <div className="fw-bold">{currentSuperAdmin?.name || "Super Admin"}</div>
                  <div className="small text-muted text-truncate">{currentSuperAdmin?.email}</div>
                </li>
                <li>
                  <Link className="dropdown-item py-2 d-flex align-items-center" to="/superadmin/profile">
                    <i className="fa-regular fa-user me-2 text-primary bg-primary bg-opacity-10 p-2 rounded-circle"></i>
                    <span>My Profile</span>
                  </Link>
                </li>
                <li><hr className="dropdown-divider mx-2" /></li>
                <li>
                  <button className="dropdown-item py-2 d-flex align-items-center text-danger" onClick={handleLogout}>
                    <i className="fa-solid fa-arrow-right-from-bracket me-2 bg-danger bg-opacity-10 p-2 rounded-circle"></i>
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <div className="sa-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
