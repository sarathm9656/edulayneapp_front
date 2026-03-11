import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const UserPasswordLoginForm = ({ onError, onLoginSuccess }) => {
  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setSigninData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    onError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/users/login`, signinData, {
        withCredentials: true,
      });

      onLoginSuccess(response.data, "Login successful");
    } catch (requestError) {
      onError(
        requestError.response?.data?.message ||
          "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default UserPasswordLoginForm;
