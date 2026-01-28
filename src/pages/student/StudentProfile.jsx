import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../../redux/user.slice";
import { fetchStudentLiveSessions } from "../../redux/student.slice";
import { toast } from "react-toastify";
import axios from "axios";

const StudentProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const { liveSessions } = useSelector((state) => state.student);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        email: "",
        phone_number: ""
    });
    const [studentStats, setStudentStats] = useState({
        totalCourses: 0,
        completedCourses: 0,
        totalLiveSessions: 0,
        totalBatches: 0,
        certificates: 0
    });

    useEffect(() => {
        dispatch(fetchUser());
        dispatch(fetchStudentLiveSessions());
        fetchStudentStats();
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            setFormData({
                fname: user?.user?.user_id?.fname || "",
                lname: user?.user?.user_id?.lname || "",
                email: user?.user?.email || "",
                phone_number: user?.user?.user_id?.phone_number || ""
            });
        }
    }, [user]);

    const fetchStudentStats = async () => {
        try {
            // Fetch student statistics from the new API endpoint
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/student/stats`, {
                withCredentials: true
            });

            if (response.data && response.data.success) {
                const stats = response.data.data;
                setStudentStats({
                    totalCourses: stats.totalCourses || 0,
                    completedCourses: stats.completedCourses || 0,
                    totalLiveSessions: stats.totalLiveSessions || 0,
                    totalBatches: stats.totalBatches || 0,
                    certificates: stats.certificates || 0
                });
                console.log("Student stats fetched:", stats);
            } else {
                throw new Error("Failed to fetch student statistics");
            }
        } catch (error) {
            console.error("Error fetching student stats:", error);
            // Set default stats
            setStudentStats({
                totalCourses: 0,
                completedCourses: 0,
                totalLiveSessions: liveSessions?.length || 0,
                totalBatches: 0,
                certificates: 0
            });
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
            const updateData = {
                fname: formData.fname.trim(),
                lname: formData.lname.trim(),
                email: formData.email.trim(),
                phone_number: formData.phone_number.trim()
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

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <main className="container-wrapper-scroll">
                <section className="welcometext-con">
                    <div className="welcometext-div">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8">
                                    <div>
                                        <span><img src="/img/hourse-icon.png" alt="Student" /></span>
                                        <h3>Student Profile</h3>
                                        <p>Manage your profile information and view your learning statistics.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container-fluid" style={{ marginTop: '30px' }}>
                    <div className="row">
                        {/* Profile Information */}
                        <div className="col-lg-4 mb-4">
                            <div className="card position-relative" style={{
                                background: 'rgba(255,255,255,0.9)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                padding: '25px'
                            }}>
                                {/* Edit Button - Top Right Corner of Card */}
                                <button
                                    className="btn btn-link position-absolute"
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        top: '15px',
                                        right: '15px',
                                        padding: '8px',
                                        color: '#3498db',
                                        textDecoration: 'none',
                                        border: 'none',
                                        background: 'none',
                                        fontSize: '18px',
                                        zIndex: 10
                                    }}
                                    title="Edit Profile"
                                >
                                    <i className="fa-solid fa-pen"></i>
                                </button>

                                <div className="text-center mb-4">
                                    <div className="profile-avatar" style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        backgroundColor: '#3498db',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 20px',
                                        fontSize: '48px',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        {user?.user?.user_id?.fname?.charAt(0)?.toUpperCase() || 'S'}
                                    </div>
                                    <h4 style={{ color: '#2c3e50', marginBottom: '5px' }}>
                                        {user?.user?.user_id?.fname || ''} {user?.user?.user_id?.lname || ''}
                                    </h4>
                                    <p className="text-muted mb-0">Student</p>
                                </div>

                                <div className="profile-info">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Email</label>
                                        <p className="form-control-plaintext">{user?.user?.email || 'N/A'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Phone</label>
                                        <p className="form-control-plaintext">{user?.user?.user_id?.phone_number || 'N/A'}</p>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Date of Birth</label>
                                        <p className="form-control-plaintext">
                                            {user?.user?.user_id?.dob ? new Date(user.user.user_id.dob).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Age</label>
                                        <p className="form-control-plaintext">{user?.user?.user_id?.age || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Learning Statistics */}
                        <div className="col-lg-8 mb-4">
                            <div className="card" style={{
                                background: 'rgba(255,255,255,0.9)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                padding: '25px'
                            }}>
                                <h4 className="mb-4" style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
                                    <i className="fa-solid fa-chart-bar me-2"></i>
                                    Learning Overview
                                </h4>

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
                                        }}>
                                            <i className="fa-solid fa-book fa-3x text-primary mb-3"></i>
                                            <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1976d2' }}>{studentStats.totalCourses}</h3>
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
                                        }}>
                                            <i className="fa-solid fa-check-circle fa-3x text-success mb-3"></i>
                                            <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#388e3c' }}>{studentStats.completedCourses}</h3>
                                            <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Completed</h6>
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
                                        }}>
                                            <i className="fa-solid fa-video fa-3x text-warning mb-3"></i>
                                            <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f57c00' }}>{studentStats.totalLiveSessions}</h3>
                                            <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Live Sessions</h6>
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
                                        }}>
                                            <i className="fa-solid fa-layer-group fa-3x text-info mb-3"></i>
                                            <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#7b1fa2' }}>{studentStats.totalBatches}</h3>
                                            <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Batches</h6>
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
                                        }}>
                                            <i className="fa-solid fa-certificate fa-3x text-danger mb-3"></i>
                                            <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#d32f2f' }}>{studentStats.certificates}</h3>
                                            <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Certificates</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Profile Modal */}
                    {isEditing && (
                        <div className="modal show d-block" style={{ 
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 1050,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div className="modal-dialog modal-lg" style={{
                                margin: 'auto',
                                maxWidth: '600px',
                                width: '90%'
                            }}>
                                <div className="modal-content" style={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                }}>
                                    <div className="modal-header" style={{
                                        borderBottom: '1px solid #e9ecef',
                                        padding: '20px 25px'
                                    }}>
                                        <h4 className="modal-title" style={{ color: '#fff', margin: 0 }}>
                                            <i className="fa-solid fa-user-edit me-2"></i>
                                            Edit Profile
                                        </h4>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={handleCancel}
                                            disabled={isUpdating}
                                        ></button>
                                    </div>
                                    <div className="modal-body" style={{ padding: '25px' }}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">First Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="fname"
                                                    value={formData.fname}
                                                    onChange={handleInputChange}
                                                    disabled={isUpdating}
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
                                                    disabled={isUpdating}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    disabled={isUpdating}
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
                                                    disabled={isUpdating}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer" style={{
                                        borderTop: '1px solid #e9ecef',
                                        padding: '20px 25px'
                                    }}>
                                        <button
                                            className="btn btn-secondary me-2"
                                            onClick={handleCancel}
                                            disabled={isUpdating}
                                        >
                                            <i className="fa-solid fa-times me-2"></i>Cancel
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            onClick={handleSave}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-save me-2"></i>Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
};

export default StudentProfile;
