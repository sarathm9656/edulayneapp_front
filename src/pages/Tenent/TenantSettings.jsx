import React, { useState } from 'react';
import { FaUser, FaLock, FaBell, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TenantSettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState({
        profile: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            organization: 'Acme Corp',
            position: 'Administrator'
        },
        security: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            twoFactorAuth: false
        },
        notifications: {
            emailNotifications: true,
            meetingReminders: true,
            courseUpdates: true,
            systemAnnouncements: true
        }
    });

    const handleInputChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = (section) => {
        // Add your save logic here
        console.log(`Saving ${section} settings:`, settings[section]);
    };

    const renderProfileSettings = () => (
        <div className="settings-section">
            <h3>Profile Information</h3>
            <div className="settings-grid">
                <div className="input-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={settings.profile.name}
                        onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Phone</label>
                    <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Organization</label>
                    <input
                        type="text"
                        value={settings.profile.organization}
                        onChange={(e) => handleInputChange('profile', 'organization', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Position</label>
                    <input
                        type="text"
                        value={settings.profile.position}
                        onChange={(e) => handleInputChange('profile', 'position', e.target.value)}
                    />
                </div>
            </div>
            <button className="save-button" onClick={() => handleSave('profile')}>
                <FaSave /> Save Changes
            </button>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="settings-section">
            <h3>Security Settings</h3>
            <div className="settings-grid">
                <div className="input-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={settings.security.currentPassword}
                        onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={settings.security.newPassword}
                        onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        value={settings.security.confirmPassword}
                        onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                    />
                </div>
                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.security.twoFactorAuth}
                            onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                        />
                        Enable Two-Factor Authentication
                    </label>
                </div>
            </div>
            <button className="save-button" onClick={() => handleSave('security')}>
                <FaSave /> Save Changes
            </button>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="settings-section">
            <h3>Notification Preferences</h3>
            <div className="settings-grid">
                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                        />
                        Email Notifications
                    </label>
                </div>
                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.notifications.meetingReminders}
                            onChange={(e) => handleInputChange('notifications', 'meetingReminders', e.target.checked)}
                        />
                        Meeting Reminders
                    </label>
                </div>
                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.notifications.courseUpdates}
                            onChange={(e) => handleInputChange('notifications', 'courseUpdates', e.target.checked)}
                        />
                        Course Updates
                    </label>
                </div>
                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.notifications.systemAnnouncements}
                            onChange={(e) => handleInputChange('notifications', 'systemAnnouncements', e.target.checked)}
                        />
                        System Announcements
                    </label>
                </div>
            </div>
            <button className="save-button" onClick={() => handleSave('notifications')}>
                <FaSave /> Save Changes
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <button
                    onClick={() => navigate('/tenant/dashboard')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="flex gap-8">
                {/* Sidebar */}
                <div className="w-80 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer w-full text-left transition-all duration-200 ${activeTab === 'profile'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FaUser /> Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer w-full text-left transition-all duration-200 ${activeTab === 'security'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FaLock /> Security
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer w-full text-left transition-all duration-200 ${activeTab === 'notifications'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FaBell /> Notifications
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
                    {activeTab === 'profile' && renderProfileSettings()}
                    {activeTab === 'security' && renderSecuritySettings()}
                    {activeTab === 'notifications' && renderNotificationSettings()}
                </div>
            </div>

            <style>
                {`
                    .settings-section {
                        display: flex;
                        flex-direction: column;
                        gap: 24px;
                    }

                    .settings-description {
                        color: #666;
                        margin-bottom: 16px;
                        font-size: 14px;
                    }

                    .settings-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 32px;
                    }

                    .settings-group {
                        background: #f7f9fb;
                        padding: 20px;
                        border-radius: 12px;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }

                    .settings-group h4 {
                        margin: 0;
                        color: #333;
                        font-size: 16px;
                        font-weight: 600;
                    }

                    .input-group {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .input-group label {
                        font-weight: 500;
                        color: #333;
                    }

                    .input-group input,
                    .input-group select {
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 14px;
                        width: 100%;
                        transition: border-color 0.2s ease;
                    }

                    .input-group input:focus,
                    .input-group select:focus {
                        outline: none;
                        border-color: #6C63FF;
                    }

                    .checkbox-group {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px;
                        background: white;
                        border-radius: 8px;
                        transition: background-color 0.2s ease;
                    }

                    .checkbox-group:hover {
                        background: #f0f0ff;
                    }

                    .checkbox-group label {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        color: #333;
                    }

                    .checkbox-group input[type="checkbox"] {
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                    }

                    .save-button {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 24px;
                        background: #6C63FF;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        align-self: flex-start;
                        transition: background-color 0.2s ease;
                    }

                    .save-button:hover {
                        background: #5a52d5;
                    }

                    @media (max-width: 768px) {
                        .settings-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default TenantSettings;