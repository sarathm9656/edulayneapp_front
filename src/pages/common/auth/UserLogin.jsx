import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuthPageLayout from "../../../components/auth/AuthPageLayout";
import UserPasswordLoginForm from "./UserPasswordLoginForm";
import UserEmailOtpLoginForm from "./UserEmailOtpLoginForm";

const UserLogin = ({ initialMode = "password" }) => {
  const [loginMode, setLoginMode] = useState(initialMode);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuthSuccess = (responseData, successMessage) => {
    if (successMessage) {
      toast.success(successMessage);
    }

    if (!responseData) {
      return;
    }

    try {
      if (responseData.token) {
        window.localStorage.setItem("token", responseData.token);
      } else {
        window.localStorage.removeItem("token");
      }
    } catch {
      // ignore storage errors
    }

    if (responseData.user.role === "tenant") {
      navigate("/tenant");
    } else if (responseData.user.role === "instructor") {
      navigate("/instructor");
    } else {
      navigate("/student");
    }
  };

  return (
    <AuthPageLayout
      showcaseEyebrow="Chess Mastery"
      showcaseTitle="Sign in and step straight back into the board."
      showcaseDescription="Your GoChess dashboard is ready for you to continue your learning journey and improve your game."
    >
      <div className="login-container-wrap user-login-card">
        <div className="login-logo">
          <img src="/img/edulayne-full-logo.png" alt="Edulayne" />
        </div>

        <div className="welcometext">
          <h4>Welcome Back!</h4>
          <p>
            {loginMode === "password"
              ? "Log in with your password."
              : "Log in with OTP sent to your email."}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div
          className={`login-mode-switch ${loginMode === "otp" ? "is-otp" : "is-password"}`}
          aria-label="Choose login method"
        >
          <button
            type="button"
            className={`login-mode-option ${loginMode === "password" ? "is-active" : ""}`}
            onClick={() => {
              setLoginMode("password");
              setError("");
            }}
          >
            <span className="login-mode-option-label">Password</span>
          </button>
          <button
            type="button"
            className={`login-mode-option ${loginMode === "otp" ? "is-active" : ""}`}
            onClick={() => {
              setLoginMode("otp");
              setError("");
            }}
          >
            <span className="login-mode-option-label">Email OTP</span>
          </button>
        </div>

        {loginMode === "password" ? (
          <UserPasswordLoginForm
            onError={(message) => {
              setError(message);
              if (message) {
                toast.error(message);
              }
            }}
            onLoginSuccess={handleAuthSuccess}
          />
        ) : (
          <UserEmailOtpLoginForm
            onError={(message) => {
              setError(message);
              if (message) {
                toast.error(message);
              }
            }}
            onLoginSuccess={handleAuthSuccess}
          />
        )}

        {loginMode === "password" && (
          <Link to="/forgot-password" className="forgot-pass">
            Forgot Password?
          </Link>
        )}
        <hr />
      </div>
    </AuthPageLayout>
  );
};

export default UserLogin;
