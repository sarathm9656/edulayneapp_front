import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const UserEmailOtpLoginForm = ({ onError, onLoginSuccess }) => {
  const [step, setStep] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const sendOtpRequest = async () => {
    onError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/users/email-otp/send`,
        { email: formData.email },
        { withCredentials: true }
      );

      setStep("otp");
      onLoginSuccess(null, response.data?.message || "OTP sent");
    } catch (requestError) {
      onError(requestError.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    await sendOtpRequest();
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    onError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/users/email-otp/verify`,
        { email: formData.email, otp: formData.otp },
        { withCredentials: true }
      );

      onLoginSuccess(response.data, "Login successful");
    } catch (requestError) {
      onError(
        requestError.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp}>
        <div className="inputitem">
          <i className="fa-solid fa-envelope"></i>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}{" "}
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    );
  }

  return (
    <>
      <form onSubmit={handleVerifyOtp}>
        <div className="inputitem">
          <i className="fa-solid fa-key"></i>
          <input
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            value={formData.otp}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
        </div>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}{" "}
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </form>
      <div className="auth-secondary-actions">
        <button
          type="button"
          className="auth-secondary-action"
          disabled={loading}
          onClick={sendOtpRequest}
        >
          Resend OTP
        </button>
        <button
          type="button"
          className="auth-secondary-action"
          onClick={() => {
            setStep("email");
            setFormData((current) => ({ ...current, otp: "" }));
            onError("");
          }}
        >
          Change email
        </button>
      </div>
    </>
  );
};

export default UserEmailOtpLoginForm;
