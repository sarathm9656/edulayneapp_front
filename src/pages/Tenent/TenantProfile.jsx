import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTenant, fetchStudents, fetchInstructors } from "../../redux/tenant.slice";
import { fetchCourses } from "../../redux/course.slice";
import { toast } from "react-toastify";
import axios from "axios";

const TenantProfile = () => {
    const dispatch = useDispatch();
    const { tenant, students, instructors } = useSelector((state) => state.tenant);
    const { courses } = useSelector((state) => state.course);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        email: "",
        phone_number: ""
    });

    useEffect(() => {
        dispatch(fetchTenant());
        dispatch(fetchStudents());
        dispatch(fetchCourses(1));
        dispatch(fetchInstructors());
    }, [dispatch]);

    useEffect(() => {
        if (tenant) {
            setFormData({
                fname: tenant?.user?.user_id?.fname || "",
                lname: tenant?.user?.user_id?.lname || "",
                email: tenant?.user?.email || "",
                phone_number: tenant?.user?.user_id?.phone_number || ""
            });
        }
    }, [tenant]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        // Basic validation
        if (!formData.fname.trim() || !formData.lname.trim() || !formData.email.trim() || !formData.phone_number.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            setIsUpdating(true);
            
            // Prepare the data for the API call
            // IMPORTANT: Do NOT send status field to prevent affecting is_active
            const updateData = {
                fname: formData.fname.trim(),
                lname: formData.lname.trim(),
                email: formData.email.trim(),
                phone_number: formData.phone_number.trim()
                // Note: We intentionally don't send status to preserve current is_active
            };

            // Get the user ID from the tenant data
            const userId = tenant?.user?.user_id?._id;
            
            if (!userId) {
                toast.error("User ID not found");
                return;
            }

            // Make the API call to update the user
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/users/${userId}`,
                updateData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            if (response.data && response.data.success) {
                // Refresh the tenant data to get updated information
                dispatch(fetchTenant());
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            } else {
                toast.error(response.data?.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error?.response?.data?.message || "Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        // Check if there are unsaved changes
        const hasChanges = 
            formData.fname !== (tenant?.user?.user_id?.fname || "") ||
            formData.lname !== (tenant?.user?.user_id?.lname || "") ||
            formData.email !== (tenant?.user?.email || "") ||
            formData.phone_number !== (tenant?.user?.user_id?.phone_number || "");
        
        if (hasChanges) {
            if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
                resetForm();
            }
        } else {
            resetForm();
        }
    };

    const resetForm = () => {
        // Reset form data to original values
        if (tenant) {
            setFormData({
                fname: tenant?.user?.user_id?.fname || "",
                lname: tenant?.user?.user_id?.lname || "",
                email: tenant?.user?.email || "",
                phone_number: tenant?.user?.user_id?.phone_number || ""
            });
        }
        setIsEditing(false);
    };

    return (
        <>
            <style jsx>{`
                .stats-card:hover {
                    transform: translateY(-5px) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
                }
                
                .stats-card:nth-child(1):hover {
                    border-color: #2196f3 !important;
                }
                
                .stats-card:nth-child(2):hover {
                    border-color: #4caf50 !important;
                }
                
                .stats-card:nth-child(3):hover {
                    border-color: #ff9800 !important;
                }
            `}</style>
            <main className="container-wrapper-scroll">
            {/* Profile Header */}
            <section className="welcometext-con">
                <div className="welcometext-div">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8">
                                <div>
                                    <span>
                                        <img src="/img/hourse-icon.png" alt="Go Chess" />
                                    </span>
                                    <h3>Profile Settings</h3>
                                    <p>Manage your account information and preferences</p>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 d-flex justify-content-center align-items-center">
                                {!isEditing ? (
                                    <div>
                                        <button
                                            className="getstarted-btn"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <i className="fa-solid fa-edit"></i> Edit Profile
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <button
                                            className="getstarted-btn"
                                            onClick={handleSave}
                                            style={{ backgroundColor: '#28a745' }}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? (
                                                <>
                                                    <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-save"></i> Save
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="getstarted-btn"
                                            onClick={handleCancel}
                                            style={{ backgroundColor: '#6c757d' }}
                                            disabled={isUpdating}
                                        >
                                            <i className="fa-solid fa-times"></i> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile Content */}
            <section className="counts-wrapper">
                <div className="container-fluid">
                    <div className="row">
                        {/* Personal Information */}
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <div className="card" style={{
                                background: 'rgba(255,255,255,0.9)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                padding: '25px'
                            }}>
                                <h4 className="mb-4" style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
                                    <i className="fa-solid fa-user me-2"></i>
                                    Personal Information
                                </h4>

                                {isUpdating && (
                                    <div className="alert alert-info" role="alert" style={{ marginBottom: '1rem' }}>
                                        <i className="fa-solid fa-spinner fa-spin me-2"></i>
                                        Updating your profile...
                                    </div>
                                )}

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="fname"
                                            value={formData.fname}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            style={{
                                                backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                                                border: isEditing ? '1px solid #ced4da' : '1px solid #e9ecef'
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lname"
                                            value={formData.lname}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            style={{
                                                backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                                                border: isEditing ? '1px solid #ced4da' : '1px solid #e9ecef'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            style={{
                                                backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                                                border: isEditing ? '1px solid #ced4da' : '1px solid #e9ecef'
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            style={{
                                                backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                                                border: isEditing ? '1px solid #ced4da' : '1px solid #e9ecef'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={tenant?.user?.tenant_id?.name || "Loading..."}
                                            disabled={true}
                                            style={{
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #e9ecef',
                                                color: '#6c757d'
                                            }}
                                        />
                                        <small className="text-muted">
                                            <i className="fa-solid fa-info-circle me-1"></i>
                                            Company name cannot be edited
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Statistics */}
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="card" style={{
                                background: 'rgba(255,255,255,0.9)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                padding: '25px'
                            }}>
                                <h4 className="mb-4" style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
                                    <i className="fa-solid fa-chart-bar me-2"></i>
                                    Account Overview
                                </h4>

                                {(!students || !courses || !instructors) && (
                                    <div className="text-center mb-3">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2 text-muted">Loading account statistics...</p>
                                    </div>
                                )}


                                <div className="row justify-content-center">
                                    <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
                                        <div className="text-center p-4 h-100 stats-card" style={{ 
                                            backgroundColor: '#e3f2fd', 
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            border: '1px solid transparent',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                            minHeight: '140px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}
                                        >
                                            <i className="fa-solid fa-users fa-3x text-primary mb-3"></i>
                                            <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1976d2' }}>{students?.length || 0}</h3>
                                            <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Total Students</h6>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
                                        <div className="text-center p-4 h-100 stats-card" style={{ 
                                            backgroundColor: '#e8f5e8', 
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            border: '1px solid transparent',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                            minHeight: '140px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}
                                        >
                                            <i className="fa-solid fa-graduation-cap fa-3x text-success mb-3"></i>
                                            <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#388e3c' }}>{courses?.length || 0}</h3>
                                            <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Total Courses</h6>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
                                        <div className="text-center p-4 h-100 stats-card" style={{ 
                                            backgroundColor: '#fff3e0', 
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            border: '1px solid transparent',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                            minHeight: '140px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}
                                        >
                                            <i className="fa-solid fa-user-tie fa-3x text-warning mb-3"></i>
                                            <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f57c00' }}>{instructors?.length || 0}</h3>
                                            <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Total Instructors</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        </>
    );
};

export default TenantProfile;
