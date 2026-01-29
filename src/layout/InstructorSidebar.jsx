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
        } catch (err) {
            toast.error(err?.message || "Logout failed");
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
            {/* Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={toggleMenu}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static z-50 top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex justify-center items-center h-20 border-b">
                    <img
                        src="/img/edulayne-full-logo.png"
                        alt="Edulayne"
                        className="h-14 object-contain"
                    />
                </div>

                {/* Menu */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 1024 && toggleMenu()}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
              ${location.pathname === item.path
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <i className={`fa-solid ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-4 w-full px-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
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
