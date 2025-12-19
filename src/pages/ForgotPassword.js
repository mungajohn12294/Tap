// src/pages/ForgotPassword.js
import React, { useState } from "react";
import { auth } from "../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0a1a2f, #000)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "35px",
          borderRadius: "18px",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0,183,255,0.3)",
          boxShadow: "0 0 30px rgba(0,183,255,0.25)",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#00b7ff", marginBottom: "10px" }}>
          Reset Password
        </h2>

        <p style={{ fontSize: "13px", color: "#9fdcff", marginBottom: "20px" }}>
          Enter your email and we’ll send you a secure reset link.
        </p>

        {message && (
          <div
            style={{
              background: "rgba(0,255,0,0.15)",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "15px",
              color: "#8cffb3",
              fontSize: "13px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(255,0,0,0.15)",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "15px",
              color: "#ff9a9a",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            fontSize: "13px",
            color: "#00b7ff",
            cursor: "pointer",
          }}
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </p>

        <p
          style={{
            marginTop: "18px",
            fontSize: "11px",
            color: "#7fbcd2",
            lineHeight: "1.5",
          }}
        >
          For your security, reset links expire automatically.
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "15px",
  borderRadius: "12px",
  border: "1px solid rgba(0,183,255,0.4)",
  background: "rgba(0,0,0,0.6)",
  color: "#00d4ff",
  outline: "none",
  fontSize: "14px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(45deg, #00b7ff, #0066ff)",
  color: "#fff",
  fontSize: "15px",
  cursor: "pointer",
  boxShadow: "0 0 15px rgba(0,183,255,0.4)",
};

export default ForgotPassword;
