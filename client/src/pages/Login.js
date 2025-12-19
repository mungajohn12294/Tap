// src/pages/Login.js
import React, { useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ref, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Typing text effect
  const text = "Secure • Private • Real-Time Messaging";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await update(ref(db, `users/${user.uid}`), {
        online: true,
        lastSeen: Date.now(),
      });

      if (user.email === process.env.REACT_APP_ADMIN_EMAIL) {
        navigate("/chatlist");
      } else {
        navigate("/chatroom");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await update(ref(db, `users/${user.uid}`), {
        online: true,
        lastSeen: Date.now(),
      });

      if (user.email === process.env.REACT_APP_ADMIN_EMAIL) {
        navigate("/chatlist");
      } else {
        navigate("/chatroom");
      }
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
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#00b7ff" }}>
          TapTap Login
        </h2>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#9fdcff", minHeight: "18px" }}>
          {displayText}
        </p>

        {error && (
          <div
            style={{
              background: "rgba(255,0,0,0.15)",
              padding: "10px",
              borderRadius: "10px",
              marginTop: "15px",
              color: "#ff9a9a",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ marginTop: "20px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            ...buttonStyle,
            background: "linear-gradient(45deg, #ffffff, #e0e0e0)",
            color: "#000",
            marginTop: "12px",
          }}
        >
          Continue with Google
        </button>

        <div style={{ marginTop: "18px", textAlign: "center", fontSize: "13px" }}>
          <p style={linkStyle} onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </p>

          <p style={linkStyle} onClick={() => navigate("/create")}>
            Don’t have an account? Create one
          </p>
        </div>

        <p
          style={{
            marginTop: "25px",
            fontSize: "11px",
            color: "#7fbcd2",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          Your messages are protected with secure authentication and real-time encryption.
          Admin access is strictly controlled.
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "12px",
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
  marginTop: "18px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(45deg, #00b7ff, #0066ff)",
  color: "#fff",
  fontSize: "15px",
  cursor: "pointer",
  boxShadow: "0 0 15px rgba(0,183,255,0.4)",
};

const linkStyle = {
  color: "#00b7ff",
  cursor: "pointer",
  marginTop: "6px",
};

export default Login;
