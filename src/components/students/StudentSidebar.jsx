import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/user.slice";
import { toast } from "react-toastify";

const StudentSidebar = ({ isOpen, toggleMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error(error?.message || "Error logging out");
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: <i className="fa-solid fa-table"></i>,
      path: "/student",
    },
    {
      label: "My Courses",
      icon: <i className="fa-solid fa-graduation-cap"></i>,
      path: "/student/courses",
    },
    {
      label: "Batches",
      icon: <i className="fa-solid fa-users"></i>,
      path: "/student/batches",
    },
    {
      label: "Progress",
      icon: <i className="fa-solid fa-chart-line"></i>,
      path: "/student/progress",
    },
    // {
    //   label: "Certificates",
    //   icon: <i className="fa-solid fa-certificate"></i>,
    //   path: "/student/certificates",
    // },
  ];

  // Filter menu items based on search term
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return menuItems;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return menuItems.filter(item =>
      item.label.toLowerCase().includes(searchLower)
    );
  }, [menuItems, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  // Highlight search term in menu items
  const highlightSearchTerm = (text) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="search-highlight" style={{ backgroundColor: "#ffdbf1", color: "#ff4d94" }}>{part}</span>
      ) : part
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    } else if (e.key === 'Enter' && filteredMenuItems.length === 1) {
      // Navigate to the only result if there's exactly one match
      navigate(filteredMenuItems[0].path);
      clearSearch();
      if (window.innerWidth < 992) toggleMenu();
    }
  };

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      // searchInputRef.current.focus(); 
      // Don't auto focus largely on mobile as it pops keyboard
    }
  }, []);

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
      ></div>

      <aside className={`modern-sidebar ${isOpen ? "active" : ""}`}>
        {/* Header / Logo */}
        <div className="modern-logo" style={{ width: "100%", justifyContent: "center", marginBottom: "20px" }}>
          <img src="/img/edulayne-full-logo.png" alt="Edulayne" style={{ height: "100px", width: "auto", objectFit: "contain" }} />
        </div>
{/* 
        {/* Search */}
        {/* <div className="modern-search-container mb-4" style={{ width: "100%", maxWidth: "100%" }}>
          <i className="fa-solid fa-magnifying-glass modern-search-icon" style={{ left: "12px", fontSize: "14px" }}></i>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="modern-search-input"
            style={{ padding: "10px 10px 10px 35px", fontSize: "14px", background: "#f8fafc", boxShadow: "none", border: "1px solid #e2e8f0" }}
            autoComplete="off"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8"
              }}
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>  */}

        {/* Menu Items */}
        <nav className="modern-nav">
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`modern-nav-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => {
                  if (searchTerm) clearSearch();
                  if (window.innerWidth < 992) toggleMenu();
                }}
              >
                {item.icon}
                <span>{highlightSearchTerm(item.label)}</span>
              </Link>
            ))
          ) : (
            <div className="text-center p-3 text-muted">
              <small>No items found</small>
            </div>
          )}
        </nav>

        {/* Footer / Logout */}
        <div className="mt-auto">
          {/* <button className="settings-btn modern-nav-item w-100 border-0 bg-transparent text-start">
            <i className="fa-solid fa-gear"></i> Settings
          </button> */}
          <a onClick={handleLogout} className="modern-logout">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
