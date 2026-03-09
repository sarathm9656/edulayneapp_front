import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import AuthPageLayout from "../../components/auth/AuthPageLayout";

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
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset email. Please try again.";
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
      const errorMessage =
        error.response?.data?.message ||
        "Failed to resend email. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthPageLayout
        showcaseEyebrow="Account Recovery"
        showcaseTitle="Return to the board."
        showcaseDescription="Reset your credentials and get back into your GoChess dashboard without missing a move."
      >
        <div className="login-container-wrap forgot-password-context">
          <div className="login-logo">
            <img src="/img/edulayne-full-logo.png" alt="Edulayne" />
          </div>

          <div className="welcometext">
            <h4>Email Sent Successfully!</h4>
            <p>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div
            className="alert alert-info"
            role="alert"
            style={{
              backgroundColor: "#e3f2fd",
              border: "none",
              borderRadius: "8px",
            }}
          >
            <div className="d-flex align-items-start">
              <i
                className="fas fa-info-circle me-2 mt-1"
                style={{ color: "var(--PrimaryColor)" }}
              ></i>
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
                borderColor: "var(--PrimaryColor)",
                color: "var(--PrimaryColor)",
                borderRadius: "4px",
                height: "45px",
              }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
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
              style={{ color: "var(--PrimaryColor)" }}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Try Different Email
            </button>
          </div>

          <div className="text-center mt-4">
            <Link to="/users/login" className="forgot-pass">
              Back to Login
            </Link>
          </div>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      showcaseEyebrow="Account Recovery"
      showcaseTitle="Let's get you back into the game."
      showcaseDescription="Enter your details to initiate a password reset link and regain access to all your tools and lessons."
    >
      <div className="login-container-wrap forgot-password-context">
        <div className="login-logo">
          <img src="/img/edulayne-full-logo.png" alt="Edulayne" />
        </div>

        <div className="welcometext">
          <h4>Forgot Password?</h4>
          <p>
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Sending Reset Link..." : "Send Reset Link"}{" "}
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </form>

        <Link to="/users/login" className="forgot-pass">
          Back to Login
        </Link>
      </div>
    </AuthPageLayout>
  );
};

export default ForgotPassword;
