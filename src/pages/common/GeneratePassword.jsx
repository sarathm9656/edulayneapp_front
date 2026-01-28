import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const GeneratePassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const validateForm = () => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
    
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
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/generate/password`,
        {
          token,
          password,
        }
      );
      
      toast.success(res.data.message || "Password set successfully!");
      setIsSuccess(true);
    } catch (err) {
      console.error('Password setting error:', err);
      toast.error(err.response?.data?.message || "Error setting password");
    } finally {
      setLoading(false);
    }
  };

  const resendMail = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/resend-mail`,
        {
          token,
        }
      );
      toast.success("Email resent successfully!");
    } catch (err) {
      console.error('Resend mail error:', err);
      toast.error("Failed to resend email. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 9999,
        background: 'url(../img/bg.jpg) no-repeat center center fixed #e2eaf3',
        backgroundSize: 'cover'
      }}>
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="login-container-wrap" style={{ maxWidth: '500px', width: '100%', margin: '0 20px' }}>
            <div className="text-center">
              <div className="mb-4">
                <i className="fa-solid fa-check-circle" style={{ fontSize: '4rem', color: 'var(--SecondaryColor)' }}></i>
              </div>
              <h4 className="mb-3" style={{ color: 'var(--HeadingColor)' }}>Password Set Successfully!</h4>
              <p style={{ color: 'var(--TextColor)', marginBottom: '30px' }}>
                Your password has been set successfully. You can now log in to your account.
              </p>
              <a href="/users/login" className="login-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                <i className="fa-solid fa-sign-in-alt" style={{ marginRight: '5px' }}></i>
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      zIndex: 9999,
      background: 'url(../img/bg.jpg) no-repeat center center fixed #e2eaf3',
      backgroundSize: 'cover'
    }}>
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="login-container-wrap" style={{ maxWidth: '500px', width: '100%', margin: '0 20px' }}>
          <div className="welcometext">
            <h4 style={{ color: 'var(--HeadingColor)', textAlign: 'center', marginBottom: '10px' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: '10px', color: 'var(--PrimaryColor)' }}></i>
              Set Your Password
            </h4>
            <p style={{ color: 'var(--TextColor)', textAlign: 'center', marginBottom: '30px' }}>
              Create a secure password for your account
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="inputitem">
              <i className="fa-solid fa-key"></i>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                disabled={loading}
                style={{ 
                  borderColor: errors.password ? '#dc3545' : 'rgba(0, 0, 0, 0.3)',
                  backgroundColor: errors.password ? '#fff5f5' : 'transparent'
                }}
              />
            </div>
            {errors.password && (
              <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '-10px', marginBottom: '15px' }}>
                {errors.password}
              </div>
            )}
            <small style={{ color: 'var(--TextColor)', fontSize: '12px', marginBottom: '15px', display: 'block' }}>
              Password must be at least 8 characters long
            </small>

            <div className="inputitem">
              <i className="fa-solid fa-key"></i>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                disabled={loading}
                style={{ 
                  borderColor: errors.confirmPassword ? '#dc3545' : 'rgba(0, 0, 0, 0.3)',
                  backgroundColor: errors.confirmPassword ? '#fff5f5' : 'transparent'
                }}
              />
            </div>
            {errors.confirmPassword && (
              <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '-10px', marginBottom: '15px' }}>
                {errors.confirmPassword}
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
              style={{ 
                width: '100%', 
                marginBottom: '20px',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" style={{ marginRight: '8px', width: '1rem', height: '1rem' }} role="status" aria-hidden="true"></span>
                  Setting Password...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check" style={{ marginRight: '5px' }}></i>
                  Set Password
                </>
              )}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button 
                type="button"
                onClick={resendMail}
                className="forgot-pass"
                disabled={loading}
                style={{ 
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <i className="fa-solid fa-envelope" style={{ marginRight: '5px' }}></i>
                Resend Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeneratePassword;
