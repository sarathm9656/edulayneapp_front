import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AuthPageLayout from "../../components/auth/AuthPageLayout";

const Signin = () => {
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const api_url = import.meta.env.VITE_API_URL;

  const from = location.state?.from?.pathname || "/superadmin/dashboard";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await axios.get(`${api_url}/auth/superadmin/me`, {
        withCredentials: true,
      });
      navigate(from, { replace: true });
    } catch {
      // Not authenticated, stay on login page
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${api_url}/auth/superadmin/login`, signinData, {
        withCredentials: true,
      });
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSigninData({ ...signinData, [e.target.name]: e.target.value });
  };

  return (
    <AuthPageLayout
      showcaseEyebrow="Admin Control"
      showcaseTitle="Manage and oversee the GoChess ecosystem."
      showcaseDescription="Access your administrative tools and manage the GoChess platform efficiently from one centralized hub."
    >
      <div className="login-container-wrap">
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
      </div>
    </AuthPageLayout>
  );
};

export default Signin;
