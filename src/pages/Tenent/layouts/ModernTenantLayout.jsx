import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTenant } from "../../../redux/tenant.slice";
import { fetchCourses } from "../../../redux/course.slice";
import { fetchInstructors } from "../../../redux/tenant.slice";
import { logoutUser } from "../../../redux/user.slice";
import { toast } from "react-toastify";
import "./modern-dashboard.css";

const ModernTenantLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { tenant } = useSelector((state) => state.tenant);
    const [isSidebarActive, setIsSidebarActive] = useState(false);

    useEffect(() => {
        dispatch(fetchTenant());
        dispatch(fetchCourses(1));
        dispatch(fetchInstructors());
    }, [dispatch]);

    // Close sidebar on navigation (for mobile)
    useEffect(() => {
        setIsSidebarActive(false);
    }, [location.pathname]);

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
        if (path.includes("dashboard") || path === "/tenant") return "Dashboard";
        if (path.includes("courses")) return "Courses";
        if (path.includes("instructors")) return "Instructors";
        if (path.includes("batches")) return "Batches";
        if (path.includes("students")) return "Students";
        if (path.includes("meetings")) return "Live Sessions";
        if (path.includes("payroll")) return "Financials";
        return "Dashboard";
    };

    const menuItems = [
        { label: "Dashboard", icon: "fa-solid fa-table", path: "/tenant" },
        { label: "Batches", icon: "fa-solid fa-layer-group", path: "/tenant/batches" },
        { label: "Courses", icon: "fa-solid fa-graduation-cap", path: "/tenant/courses" },
        { label: "Instructors", icon: "fa-solid fa-chalkboard-user", path: "/tenant/instructors" },
        { label: "Students", icon: "fa-solid fa-user-graduate", path: "/tenant/students" },
        { label: "Attendance", icon: "fa-solid fa-clipboard-list", path: "/tenant/attendance" },
        { label: "Financials", icon: "fa-solid fa-money-bill-trend-up", path: "/tenant/payroll" },
    ];

    return (
        <div className="modern-layout">
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isSidebarActive ? "active" : ""}`}
                onClick={() => setIsSidebarActive(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`modern-sidebar ${isSidebarActive ? "active" : ""}`}>
                <div className="modern-logo">
                    <img src="/img/edulayne-full-logo.png" alt="EDULAYN" />
                    
                </div>

                <nav className="modern-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`modern-nav-item ${location.pathname === item.path ? "active" : ""
                                }`}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="modern-upgrade-card d-none d-lg-block">
                    <h4>Upgrade your plan</h4>
                    <p>Unlock premium features & enhance your LMS experience!</p>
                    <button className="modern-upgrade-btn">Upgrade Now</button>
                </div>

                <div className="modern-logout" onClick={handleLogout}>
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    <span>Sign Out</span>
                </div>
            </aside>

            {/* Main Content */}
            <main className="modern-main">
                <header className="modern-header">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="menu-toggle"
                            onClick={() => setIsSidebarActive(!isSidebarActive)}
                        >
                            <i className="fa-solid fa-bars"></i>
                        </button>

                        <button className="btn btn-light rounded-circle d-none d-md-flex" onClick={() => navigate(-1)}>
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>

                        <div>
                            <h2 className="mb-0 h4 fw-bold">{getPageTitle()}</h2>
                            <small className="text-muted d-none d-sm-block">Dashboard / {getPageTitle()}</small>
                        </div>
                    </div>

                    <div className="modern-search-container">
                        <i className="fa-solid fa-magnifying-glass modern-search-icon"></i>
                        <input
                            type="text"
                            className="modern-search-input"
                            placeholder="Search anything..."
                        />
                    </div>

                    <div className="modern-header-actions d-flex align-items-center gap-3">
                        <button className="btn btn-light rounded-circle p-2 position-relative border-0 bg-transparent">
                            <i className="fa-regular fa-bell"></i>
                            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                <span className="visually-hidden">New alerts</span>
                            </span>
                        </button>

                        <div className="dropdown">
                            <button
                                className="d-flex align-items-center gap-2 border-0 bg-transparent p-0"
                                type="button"
                                id="tenantProfileDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <div className="modern-user-info text-end d-none d-md-block">
                                    <span className="fw-bold text-dark d-block" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>
                                        {tenant?.user?.user_id?.fname || tenant?.name || "Admin"}
                                    </span>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Administrator</small>
                                </div>
                                <img
                                    src={tenant?.logo || `https://ui-avatars.com/api/?name=${tenant?.name || "Admin"}&background=ff4d94&color=fff`}
                                    alt="Profile"
                                    className="modern-avatar shadow-sm border border-2 border-white"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                                />
                            </button>

                            <ul
                                className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 mt-3 animate__animated animate__fadeIn"
                                aria-labelledby="tenantProfileDropdown"
                                style={{ minWidth: '220px', padding: '0.5rem' }}
                            >
                                <li className="px-3 py-2 mb-2 border-bottom">
                                    <div className="fw-bold text-dark text-truncate">
                                        {tenant?.user?.user_id?.fname ? `${tenant?.user?.user_id?.fname} ${tenant?.user?.user_id?.lname || ''}` : (tenant?.name || "Admin")}
                                    </div>
                                    <div className="small text-muted text-truncate">{tenant?.email}</div>
                                </li>
                                <li>
                                    <Link className="dropdown-item py-2 px-3 rounded-3 d-flex align-items-center gap-2" to="/tenant/profile">
                                        <i className="fa-regular fa-user text-primary bg-primary bg-opacity-10 p-2 rounded-circle" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
                                        <span>My Profile</span>
                                    </Link>
                                </li>
                                <li><hr className="dropdown-divider mx-2 my-2" /></li>
                                <li>
                                    <button
                                        className="dropdown-item py-2 px-3 rounded-3 d-flex align-items-center gap-2 text-danger"
                                        onClick={handleLogout}
                                    >
                                        <i className="fa-solid fa-arrow-right-from-bracket text-danger bg-danger bg-opacity-10 p-2 rounded-circle" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </header>

                <div className="modern-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ModernTenantLayout;
