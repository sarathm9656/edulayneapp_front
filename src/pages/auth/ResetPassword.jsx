import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error("Invalid reset link. Please request a new password reset.");
      navigate("/forgot-password");
      return;
    }
    setToken(tokenParam);
  }, [searchParams, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting reset password form...");
    console.log("Token:", token);
    console.log("New Password Length:", formData.newPassword?.length);

    if (!validateForm()) {
      return;
    }

    if (!token) {
      toast.error("Missing reset token. Please use the link from your email.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      console.log("Sending payload to:", `${API_URL}/auth/reset-password`);

      const response = await axios.post(`${API_URL}/auth/reset-password`, payload);

      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error full:", error);

      let errorMessage = "Failed to reset password. Please try again.";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
        errorMessage = error.response.data.message || error.response.statusText || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error Request:", error.request);
        errorMessage = "No response from server. Check your connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error Message:", error.message);
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="forgot-password-fullscreen" style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        background: 'url(/img/bg.jpg) no-repeat center center fixed #e2eaf3',
        backgroundSize: 'cover',
        margin: '0',
        padding: '0',
        zIndex: 9999
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '450px',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div className="login-container-wrap">
            <div className="login-logo">
              <img src="/img/edulayne-full-logo.png" alt="Edulayne" />
            </div>

            <div className="welcometext">
              <h4>Password Reset Successful!</h4>
              <p>Your password has been successfully reset.</p>
            </div>

            <div className="alert alert-success" role="alert" style={{ backgroundColor: '#d4edda', border: 'none', borderRadius: '8px' }}>
              <div className="d-flex align-items-start">
                <i className="fas fa-shield-alt me-2 mt-1" style={{ color: '#155724' }}></i>
                <div>
                  <h6 className="alert-heading mb-2">Security Updated</h6>
                  <p className="mb-0 small">
                    Your new password is now active. You can login with your new credentials.
                  </p>
                </div>
              </div>
            </div>

            <div className="d-grid mt-4">
              <button
                type="button"
                className="login-btn"
                onClick={() => navigate("/users/login")}
              >
                Go to Login <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-fullscreen" style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: 'url(/img/bg.jpg) no-repeat center center fixed #e2eaf3',
      backgroundSize: 'cover',
      margin: '0',
      padding: '0',
      zIndex: 9999
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '450px',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div className="login-container-wrap">
          <div className="login-logo">
            <img src="/img/edulayne-full-logo.png" alt="Edulayne" />
          </div>

          <div className="welcometext">
            <h4>Set New Password</h4>
            <p>Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="inputitem">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
                className={errors.newPassword ? 'is-invalid' : ''}
              />
            </div>
            {errors.newPassword && (
              <div className="text-danger small mb-2">
                {errors.newPassword}
              </div>
            )}

            <div className="inputitem">
              <i className="fa-solid fa-check"></i>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
                className={errors.confirmPassword ? 'is-invalid' : ''}
              />
            </div>
            {errors.confirmPassword && (
              <div className="text-danger small mb-2">
                {errors.confirmPassword}
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}{" "}
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          <a href="/users/login" className="forgot-pass">
            Back to Login
          </a>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;