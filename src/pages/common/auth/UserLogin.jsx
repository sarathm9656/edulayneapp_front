import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuthPageLayout from "../../../components/auth/AuthPageLayout";

const UserLogin = () => {
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });
  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/users/login`, signinData, {
        withCredentials: true,
      });

      toast.success("Login successful");
      if (response.data) {
        try {
          if (response.data.token) {
            window.localStorage.setItem("token", response.data.token);
          } else {
            window.localStorage.removeItem("token");
          }
        } catch {
          // ignore storage errors
        }

        if (response.data.user.role === "tenant") {
          navigate("/tenant");
        } else if (response.data.user.role === "instructor") {
          navigate("/instructor");
        } else {
          navigate("/student");
        }
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "An error occurred during login"
      );
      toast.error(requestError.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSigninData({ ...signinData, [e.target.name]: e.target.value });
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
          <p>Log in to access your account & explore more.</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="inputitem">
            <i className="fa-solid fa-user"></i>
            <input
              type="email"
              name="email"
              placeholder="Username / Email"
              value={signinData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="inputitem">
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signinData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "sign in"}{" "}
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </form>

        <Link to="/forgot-password" className="forgot-pass">
          Forgot Password?
        </Link>
        <hr />
      </div>
    </AuthPageLayout>
  );
};

export default UserLogin;
