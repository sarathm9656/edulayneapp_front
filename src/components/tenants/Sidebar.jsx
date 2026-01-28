import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/user.slice";
import { toast } from "react-toastify";

const TenantSidebar = ({ toggleMenu }) => {
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
      path: "/tenant",
    },
    {
      label: "Courses",
      icon: <i className="fa-solid fa-graduation-cap"></i>,
      path: "/tenant/courses",
    },
    {
      label: "Instructors",
      icon: <i className="fa-solid fa-user-group"></i>,
      path: "/tenant/instructors",
    },
    {
      label: "Batches",
      icon: <i className="fa-solid fa-graduation-cap"></i>,
      path: "/tenant/Batches"
    },
    {
      label: "Students",
      icon: <i className="fa-solid fa-user-group"></i>,
      path: "/tenant/students",
    },
    {
      label: "Attendance",
      icon: <i className="fa-solid fa-clipboard-list"></i>,
      path: "/tenant/attendance",
    },
    {
      label: "Live Sessions",
      icon: <i className="fa-solid fa-video"></i>,
      path: "/tenant/meetings",
    },
    {
      label: "Payroll",
      icon: <i className="fa-solid fa-money-bill"></i>,
      path: "/tenant/payroll",
    }
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
        <span key={index} className="search-highlight">{part}</span>
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
    }
  };

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div className="sidebarmenu-wrapper" style={{
      background: '#e2eaf3',
      minHeight: '100vh',
    }}>
      <button className="menuback-button" onClick={toggleMenu}>
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="sidemenu-header">
        <Link to="/tenant" className="sidebarlogo" style={{ width: "100%", paddingLeft: "0", display: "flex", justifyContent: "center" }}>
          <img src="/img/EDULAYNE-Logo- icon2048x510.png" alt="EduLayne" style={{ maxHeight: "80px", width: "auto" }} />
        </Link>
        <div className="search-container">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="search-input"
            autoComplete="off"
          />
          {searchTerm ? (
            <button onClick={clearSearch} className="clear-search-btn" title="Clear search (Esc)">
              <i className="fa-solid fa-times"></i>
            </button>
          ) : (
            <button className="search-btn" title="Search menu items">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="search-info">
            <small>
              {filteredMenuItems.length} of {menuItems.length} items
              {filteredMenuItems.length === 1 && " • Press Enter to navigate"}
            </small>
          </div>
        )}
      </div>

      <ul>
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item) => (
            <li key={item.label}>
              <Link to={item.path} onClick={() => searchTerm && clearSearch()}>
                <button
                  className={location.pathname === item.path ? "active" : ""}
                >
                  {item.icon} {highlightSearchTerm(item.label)}
                </button>
              </Link>
            </li>
          ))
        ) : (
          <li className="no-results">
            <div className="no-results-message">
              <i className="fa-solid fa-search"></i>
              <span>No menu items found for "{searchTerm}"</span>
              <small>Try a different search term</small>
            </div>
          </li>
        )}
      </ul>

      <div className="sidebarfooter">
        <button className="settings-btn">
          <i className="fa-solid fa-gear"></i>
        </button>
        <button className="customersupport-btn">
          <i className="fa-solid fa-headphones-simple"></i> Customer Support
        </button>
        <button className="logout-btn" onClick={handleLogout} title="Sign Out">
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </div>
  );
};

export default TenantSidebar;
