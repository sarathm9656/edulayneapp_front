import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentSuperAdmin, fetchTenantsWithCourseCountandUserCount, updateSuperAdminProfile } from "../../redux/super.admin.slice";
import { toast } from "react-toastify";

const SuperAdminProfile = () => {
    const dispatch = useDispatch();
    const { currentSuperAdmin, tenantDetails, currentSuperAdminLoading } = useSelector((state) => state.superAdmin);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_number: ""
    });
    
    // Calculate statistics from tenant data
    const superAdminStats = {
        totalTenants: tenantDetails?.length || 0,
        totalUsers: tenantDetails?.reduce((total, tenant) => total + (tenant.userCount || 0), 0) || 0,
        activeTenants: tenantDetails?.filter(tenant => tenant.tenant?.is_active === true)?.length || 0
    };

    useEffect(() => {
        dispatch(fetchCurrentSuperAdmin());
        dispatch(fetchTenantsWithCourseCountandUserCount());
    }, [dispatch]);

    useEffect(() => {
        if (currentSuperAdmin) {
            setFormData({
                name: currentSuperAdmin.name || "",
                email: currentSuperAdmin.email || "",
                phone_number: currentSuperAdmin.phone_number || ""
            });
        }
    }, [currentSuperAdmin]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        // Basic validation
        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error("Please fill in all required fields");
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
            
            const updateData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone_number: formData.phone_number.trim()
            };

            await dispatch(updateSuperAdminProfile(updateData)).unwrap();
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            // Error is already handled by the Redux action
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        const hasChanges = 
            formData.name !== (currentSuperAdmin?.name || "") ||
            formData.email !== (currentSuperAdmin?.email || "") ||
            formData.phone_number !== (currentSuperAdmin?.phone_number || "");
        
        if (hasChanges) {
            if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
                resetForm();
            }
        } else {
            resetForm();
        }
    };

    const resetForm = () => {
        if (currentSuperAdmin) {
            setFormData({
                name: currentSuperAdmin.name || "",
                email: currentSuperAdmin.email || "",
                phone_number: currentSuperAdmin.phone_number || ""
            });
        }
        setIsEditing(false);
    };

    if (currentSuperAdminLoading || !currentSuperAdmin) {
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
                    border-color: #00bcd4 !important;
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
                                            <img src="/img/hourse-icon.png" alt="Super Admin" />
                                        </span>
                                        <h3>Super Admin Profile</h3>
                                        <p>Manage your account information and view system statistics</p>
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
                                        <i className="fa-solid fa-user-shield me-2"></i>
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
                                            <label className="form-label fw-bold">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                style={{
                                                    backgroundColor: isEditing ? '#fff' : '#f8f9fa',
                                                    border: isEditing ? '1px solid #ced4da' : '1px solid #e9ecef'
                                                }}
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
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Role</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value="Super Administrator"
                                                disabled={true}
                                                style={{
                                                    backgroundColor: '#f8f9fa',
                                                    border: '1px solid #e9ecef',
                                                    color: '#6c757d'
                                                }}
                                            />
                                            <small className="text-muted">
                                                <i className="fa-solid fa-info-circle me-1"></i>
                                                System administrator role
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Statistics */}
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
                                        System Overview
                                    </h4>

                                    {!tenantDetails || tenantDetails.length === 0 ? (
                                        <div className="text-center mb-3">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 text-muted">Loading system statistics...</p>
                                        </div>
                                    ) : null}

                                    <div className="row">
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
                                            }}>
                                                <i className="fa-solid fa-building fa-3x text-primary mb-3"></i>
                                                <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1976d2' }}>{superAdminStats.totalTenants}</h3>
                                                <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Total Tenants</h6>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
                                            <div className="text-center p-4 h-100 stats-card" style={{ 
                                                backgroundColor: '#e0f2f1', 
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
                                                <i className="fa-solid fa-check-circle fa-3x text-info mb-3"></i>
                                                <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00695c' }}>{superAdminStats.activeTenants}</h3>
                                                <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Active Tenants</h6>
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
                                            }}>
                                                <i className="fa-solid fa-users fa-3x text-success mb-3"></i>
                                                <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#388e3c' }}>{superAdminStats.totalUsers}</h3>
                                                <h6 className="text-muted mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>Total Users</h6>
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

export default SuperAdminProfile;
