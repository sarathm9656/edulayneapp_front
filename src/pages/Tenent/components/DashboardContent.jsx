import React, { useState, useEffect } from 'react';
import { FaUsers, FaBook, FaCertificate, FaCalendarAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';

const DashboardContent = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { tenant } = useSelector((state) => state.tenant);
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    instructors: 0,
    liveSessions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/tenants/stats`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Get tenant name for welcome message
  const getTenantName = () => {
    if (tenant?.user?.user_id?.fname) {
      return tenant.user.user_id.fname;
    }
    if (tenant?.name) {
      return tenant.name;
    }
    return 'Tenant';
  };

  const dashboardCards = [
    {
      icon: <FaUsers className="w-6 h-6" />,
      label: "Total Students",
      value: stats.students,
      color: "text-blue-600"
    },
    {
      icon: <FaCertificate className="w-6 h-6" />,
      label: "Total Instructors",
      value: stats.instructors,
      color: "text-green-600"
    },
    {
      icon: <FaBook className="w-6 h-6" />,
      label: "Active Courses",
      value: stats.courses,
      color: "text-purple-600"
    },
    {
      icon: <FaCalendarAlt className="w-6 h-6" />,
      label: "Live Sessions",
      value: stats.liveSessions,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {getTenantName()}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your courses today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className={`${card.color} mb-4`}>{card.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{card.value}</div>
            <div className="text-sm text-gray-600">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-white/30">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FaUsers className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">New student enrolled</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Sessions</h2>
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <FaCalendarAlt className="text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Introduction to Web Development</p>
                  <p className="text-sm text-gray-600">Today, 10:00 AM</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Join Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent; 