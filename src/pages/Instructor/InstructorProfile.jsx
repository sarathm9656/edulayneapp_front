import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../../redux/user.slice";
import { fetchCourses } from "../../redux/course.slice";
import { toast } from "react-toastify";
import axios from "axios";

const InstructorProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const { courses } = useSelector((state) => state.course);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        email: "",
        phone_number: ""
    });
    const [instructorStats, setInstructorStats] = useState({
        totalCourses: 0,
        activeCourses: 0,
        totalStudents: 0,
        totalBatches: 0,
        totalLiveSessions: 0
    });

    useEffect(() => {
        dispatch(fetchUser());
        dispatch(fetchCourses(1));
        fetchInstructorStats();
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            console.log("Debug - Complete user data:", JSON.stringify(user, null, 2));
            console.log("Debug - User.user:", user?.user);
            console.log("Debug - User.user.user_id:", user?.user?.user_id);
            console.log("Debug - User role:", user?.user?.role_id?.name);
            console.log("Debug - Price per hour (old path):", user?.user?.user_id?.price_per_hour);
            console.log("Debug - Price per hour (new path):", user?.user?.price_per_hour);
            console.log("Debug - Price per hour type:", typeof user?.user?.price_per_hour);

            setFormData({
                fname: user?.user?.user_id?.fname || "",
                lname: user?.user?.user_id?.lname || "",
                email: user?.user?.email || "",
                phone_number: user?.user?.user_id?.phone_number || ""
            });
        }
    }, [user]);

    const fetchInstructorStats = async () => {
        try {
            setIsLoadingStats(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/instructors/stats`,
                { withCredentials: true }
            );

            if (response.data.success) {
                setInstructorStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching instructor stats:", error);
            // Fallback to basic stats from courses
            setInstructorStats({
                totalCourses: courses?.length || 0,
                activeCourses: courses?.filter(course => course.is_active)?.length || 0,
                totalStudents: 0,
                totalBatches: 0,
                totalLiveSessions: 0
            });
        } finally {
            setIsLoadingStats(false);
        }
    };

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

            // Get the user ID from the user data
            const userId = user?.user?.user_id?._id;

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
                // Refresh the user data to get updated information
                dispatch(fetchUser());
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
            formData.fname !== (user?.user?.user_id?.fname || "") ||
            formData.lname !== (user?.user?.user_id?.lname || "") ||
            formData.email !== (user?.user?.email || "") ||
            formData.phone_number !== (user?.user?.user_id?.phone_number || "");

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
        if (user) {
            setFormData({
                fname: user?.user?.user_id?.fname || "",
                lname: user?.user?.user_id?.lname || "",
                email: user?.user?.email || "",
                phone_number: user?.user?.user_id?.phone_number || ""
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
                
                .stats-card:nth-child(4):hover {
                    border-color: #9c27b0 !important;
                }
                
                .stats-card:nth-child(5):hover {
                    border-color: #f44336 !important;
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
                                        <span className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '60px', height: '60px' }}>
                                            <i className="fa-solid fa-user-tie fs-2 text-primary"></i>
                                        </span>
                                        <h3>Instructor Profile</h3>
                                        <p>Manage your account information and view your teaching statistics</p>
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
                                                disabled={true}
                                                style={{
                                                    backgroundColor: '#f8f9fa',
                                                    border: '1px solid #e9ecef',
                                                    color: '#6c757d'
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
                                                value={user?.user?.tenant_id?.name || "Loading..."}
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
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Hourly Rate</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={`$${user?.user?.price_per_hour || 0}/hour`}
                                                disabled={true}
                                                style={{
                                                    backgroundColor: '#f8f9fa',
                                                    border: '1px solid #e9ecef',
                                                    color: '#6c757d'
                                                }}
                                            />
                                            <small className="text-muted">
                                                <i className="fa-solid fa-info-circle me-1"></i>
                                                Hourly rate is set by the company
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Teaching Statistics */}
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
                                        Teaching Overview
                                    </h4>

                                    {isLoadingStats && (
                                        <div className="text-center mb-3">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 text-muted">Loading teaching statistics...</p>
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-lg col-md-6 col-sm-12 mb-4">
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
                                                <i className="fa-solid fa-book fa-3x text-primary mb-3"></i>
                                                <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1976d2' }}>{instructorStats.totalCourses}</h3>
                                                <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Total Courses</h6>
                                            </div>
                                        </div>
                                        <div className="col-lg col-md-6 col-sm-12 mb-4">
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
                                                <i className="fa-solid fa-check-circle fa-3x text-success mb-3"></i>
                                                <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#388e3c' }}>{instructorStats.activeCourses}</h3>
                                                <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Active Courses</h6>
                                            </div>
                                        </div>
                                        <div className="col-lg col-md-6 col-sm-12 mb-4">
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
                                                <i className="fa-solid fa-users fa-3x text-warning mb-3"></i>
                                                <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f57c00' }}>{instructorStats.totalStudents}</h3>
                                                <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Total Students</h6>
                                            </div>
                                        </div>
                                        <div className="col-lg col-md-6 col-sm-12 mb-4">
                                            <div className="text-center p-4 h-100 stats-card" style={{
                                                backgroundColor: '#f3e5f5',
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
                                                <i className="fa-solid fa-layer-group fa-3x text-info mb-3"></i>
                                                <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#7b1fa2' }}>{instructorStats.totalBatches}</h3>
                                                <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Total Batches</h6>
                                            </div>
                                        </div>
                                        <div className="col-lg col-md-6 col-sm-12 mb-4">
                                            <div className="text-center p-4 h-100 stats-card" style={{
                                                backgroundColor: '#ffebee',
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
                                                <i className="fa-solid fa-video fa-3x text-danger mb-3"></i>
                                                <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#d32f2f' }}>{instructorStats.totalLiveSessions}</h3>
                                                <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Live Sessions</h6>
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

export default InstructorProfile;
