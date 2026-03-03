import React, { useState } from "react";
import InstructorSidebar from "./InstructorSidebar";
import { Outlet } from "react-router-dom";

const InstructorLayout = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <InstructorSidebar isOpen={isOpen} toggleMenu={toggleMenu} />

            {/* Main Area */}
            <div className="flex flex-col flex-1">
                {/* Top Header (Mobile & Tablet) */}
                <header className="lg:hidden flex items-center gap-3 bg-white shadow px-4 py-3">
                    <button onClick={toggleMenu} className="text-2xl">
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <h1 className="font-semibold text-lg">Instructor Panel</h1>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default InstructorLayout;
