import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const BatchJoinRedirect = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = String(searchParams.get("role") || "").toLowerCase().trim();
  const lockedRole = roleFromUrl === "admin" || roleFromUrl === "student" ? roleFromUrl : "";
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lockedRole) {
      setRole(lockedRole);
    }
  }, [lockedRole]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!batchId) {
      setError("Invalid batch link.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setJoining(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      const response = await axios.post(`${apiUrl}/dyte/public-join`, {
        batchId,
        name: name.trim(),
        role,
      });

      if (response.data?.authToken) {
        const meetingId = response.data.meeting_id || response.data.meetingId || "";
        const resolvedRole = response.data.role || role;
        const url = `${window.location.origin}/meeting?authToken=${encodeURIComponent(response.data.authToken)}&role=${encodeURIComponent(resolvedRole)}&batchId=${encodeURIComponent(batchId)}&meetingId=${encodeURIComponent(meetingId)}&public=1`;
        window.location.replace(url);
        return;
      }

      setError("No meeting access data was returned.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join class.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#111827",
        color: "#f9fafb",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "460px", width: "100%", background: "#1f2937", borderRadius: "16px", padding: "28px" }}>
        <h2 style={{ marginBottom: "12px" }}>Join Batch</h2>
        <p style={{ marginBottom: "20px", color: "#d1d5db" }}>
          Enter your name to join this class.
        </p>
        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: "14px", textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #374151",
                background: "#111827",
                color: "#f9fafb",
              }}
            />
          </div>
          {lockedRole ? (
            <div style={{ marginBottom: "18px", textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Role</label>
              <input
                type="text"
                value={lockedRole === "admin" ? "Admin" : "Student"}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  background: "#111827",
                  color: "#9ca3af",
                }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: "18px", textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  background: "#111827",
                  color: "#f9fafb",
                }}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          {error && (
            <p style={{ marginBottom: "16px", color: "#fca5a5" }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={joining}
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: joining ? "not-allowed" : "pointer",
              opacity: joining ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {joining ? "Joining..." : "Continue"}
          </button>
        </form>
        <div style={{ marginTop: "16px" }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "#f9fafb",
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchJoinRedirect;
