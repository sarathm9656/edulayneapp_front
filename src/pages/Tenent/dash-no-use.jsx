import React from "react";

const DashboardNOUse = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-[#F7F9FB] shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                style={{
                  width: "100%",
                  padding: "10px 36px 10px 16px",
                  borderRadius: 8,
                  border: "1px solid #eee",
                  background: "#fff",
                }}
              />
              <FaSearch
                className="absolute right-3 top-3 text-gray-400"
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  color: "#bbb",
                }}
              />
            </div>
          </div>
          <div
            className="flex items-center space-x-4"
            style={{ display: "flex", alignItems: "center", gap: 20 }}
          >
            <IoMdNotificationsOutline size={24} style={{ color: "#6C63FF" }} />
            <img
              src="https://img.icons8.com/color/48/000000/user-male-circle--v2.png"
              alt="user"
              style={{ width: 36, borderRadius: "50%" }}
            />
            <FaChevronDown style={{ color: "#bbb" }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#F7F9FB]">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardNOUse;
