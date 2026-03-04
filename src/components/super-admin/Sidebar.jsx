import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ collapsed, onCollapseToggle }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);

  const menuSections = [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          icon: <i className="fa-solid fa-gauge-high"></i>,
          path: "/superadmin/dashboard",
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          label: "Tenants",
          icon: <i className="fa-solid fa-building"></i>,
          path: "/superadmin/tenants",
        },
        {
          label: "Roles",
          icon: <i className="fa-solid fa-user-shield"></i>,
          path: "/superadmin/roles",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: "Settings",
          icon: <i className="fa-solid fa-gear"></i>,
          path: "/superadmin/settings",
        },
        {
          label: "Profile",
          icon: <i className="fa-regular fa-user"></i>,
          path: "/superadmin/profile",
        },
      ],
    },
  ];

  const flatMenuItems = useMemo(() => {
    return menuSections.flatMap((section) =>
      section.items.map((item) => ({ ...item, section: section.title }))
    );
  }, [menuSections]);

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm.trim()) return flatMenuItems;
    const searchLower = searchTerm.toLowerCase().trim();
    return flatMenuItems.filter((item) =>
      item.label.toLowerCase().includes(searchLower)
    );
  }, [flatMenuItems, searchTerm]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const highlightSearchTerm = (text) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="sa-search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") clearSearch();
    else if (e.key === "Enter" && filteredMenuItems.length === 1) clearSearch();
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const isActivePath = (itemPath) => {
    if (location.pathname === itemPath) return true;
    if (location.pathname.startsWith(`${itemPath}/`)) return true;
    if (
      itemPath === "/superadmin/tenants" &&
      location.pathname.startsWith("/superadmin/tenants/")
    )
      return true;
    return false;
  };

  return (
    <aside className={`sidebarmenu-wrapper sa-sidebar ${collapsed ? "sa-sidebar-collapsed" : ""}`}>
      <div className="sa-sidebar-top">
        <button
          className="sa-icon-btn sa-sidebar-close d-lg-none"
          onClick={onCollapseToggle}
          aria-label="Close sidebar"
          type="button"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <Link
          to="/superadmin/dashboard"
          className="sa-brand"
          aria-label="Super Admin home"
        >
          <img src="/img/edulayne-full-logo.png" alt="Edulayne" />
        </Link>

        <div className="sa-search">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="form-control form-control-sm"
            autoComplete="off"
          />
          {searchTerm ? (
            <button
              onClick={clearSearch}
              className="sa-search-btn"
              title="Clear search (Esc)"
              type="button"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          ) : (
            <button
              className="sa-search-btn"
              title="Search menu items"
              type="button"
              aria-hidden="true"
              tabIndex={-1}
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          )}
        </div>

        {searchTerm && (
          <div className="sa-search-info">
            <small>
              {filteredMenuItems.length} of {flatMenuItems.length} items
              {filteredMenuItems.length === 1 && " • Press Enter to navigate"}
            </small>
          </div>
        )}
      </div>

      <nav className="sa-nav" aria-label="Super admin navigation">
        {filteredMenuItems.length > 0 ? (
          menuSections.map((section) => {
            const items = filteredMenuItems.filter(
              (i) => i.section === section.title
            );
            if (items.length === 0) return null;
            return (
              <div key={section.title} className="sa-nav-section">
                <div className="sa-nav-title">{section.title}</div>
                <div className="sa-nav-list">
                  {items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`sa-nav-item ${isActivePath(item.path) ? "active" : ""}`}
                      onClick={() => searchTerm && clearSearch()}
                    >
                      <span className="sa-nav-icon">{item.icon}</span>
                      <span className="sa-nav-label">
                        {highlightSearchTerm(item.label)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="sa-no-results">
            <div className="sa-no-results-icon">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <div className="fw-semibold">No menu items found</div>
            <div className="small opacity-75">Try a different search term</div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
