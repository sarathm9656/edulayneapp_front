import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: email.trim(),
      });

      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Password reset email sent successfully!");
      } else {
        toast.error(response.data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage = error.response?.data?.message || "Failed to send reset email. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: email.trim(),
      });

      if (response.data.success) {
        toast.success("Password reset email sent again!");
      } else {
        toast.error(response.data.message || "Failed to resend email");
      }
    } catch (error) {
      console.error("Resend email error:", error);
      const errorMessage = error.response?.data?.message || "Failed to resend email. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{
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
              <h4>Email Sent Successfully!</h4>
              <p>We've sent a password reset link to <strong>{email}</strong></p>
            </div>

            <div className="alert alert-info" role="alert" style={{ backgroundColor: '#e3f2fd', border: 'none', borderRadius: '8px' }}>
              <div className="d-flex align-items-start">
                <i className="fas fa-info-circle me-2 mt-1" style={{ color: 'var(--PrimaryColor)' }}></i>
                <div>
                  <h6 className="alert-heading mb-2">Next Steps:</h6>
                  <ul className="mb-0 small">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the reset link in the email</li>
                    <li>The link will expire in 1 hour</li>
                    <li>Create a new secure password</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="d-grid gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleResendEmail}
                disabled={loading}
                style={{
                  borderColor: 'var(--PrimaryColor)',
                  color: 'var(--PrimaryColor)',
                  borderRadius: '4px',
                  height: '45px'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-2"></i>
                    Resend Email
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                style={{ color: 'var(--PrimaryColor)' }}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Try Different Email
              </button>
            </div>

            <div className="text-center mt-4">
              <a href="/users/login" className="forgot-pass">
                Back to Login
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
            <h4>Forgot Password?</h4>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="inputitem">
              <i className="fa-solid fa-user"></i>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}{" "}
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

export default ForgotPassword;