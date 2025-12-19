// src/pages/CreateAccount.js

import React, { useState, useEffect } from "react";
import { auth, db, googleProvider } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

const CreateAccount = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [typedText, setTypedText] = useState("");
  const fullText = "Create Your Secure Account";

  /* 🔤 Typing animation */
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 70);
    return () => clearInterval(interval);
  }, []);

  /* 🔐 Password strength */
  const getPasswordStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return "Strong";
    return "Medium";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await set(ref(db, `users/${user.uid}`), {
        name,
        email,
        online: true,
        lastSeen: Date.now(),
      });

      navigate("/chatroom");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await set(ref(db, `users/${user.uid}`), {
        name: user.displayName,
        email: user.email,
        online: true,
        lastSeen: Date.now(),
      });

      navigate("/chatroom");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>{typedText}<span style={styles.cursor}>|</span></h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSignup} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div style={{ position: "relative" }}>
            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              style={styles.showPass}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {password && (
            <p style={styles.strength}>
              Password strength: <b>{getPasswordStrength()}</b>
            </p>
          )}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <button
          onClick={handleGoogleSignup}
          style={{ ...styles.button, background: "#111827" }}
          disabled={loading}
        >
          Continue with Google
        </button>

        <p style={styles.linkText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

        {/* 🧠 Explanation box */}
        <div style={styles.infoBox}>
          <p>
            🔐 Your account is protected with Firebase security.
            <br />
            ⚡ Real-time chat, presence detection & instant sync.
            <br />
            🌍 Built for speed, privacy & modern communication.
          </p>
        </div>
      </div>
    </div>
  );
};

/* 🎨 Styles */
const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #0f172a, #020617)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Segoe UI, sans-serif",
  },
  card: {
    width: "360px",
    padding: "30px",
    background: "rgba(15, 23, 42, 0.85)",
    borderRadius: "16px",
    boxShadow: "0 0 40px rgba(59,130,246,0.25)",
    color: "#e5e7eb",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#60a5fa",
  },
  cursor: {
    color: "#93c5fd",
    animation: "blink 1s infinite",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #1e3a8a",
    background: "#020617",
    color: "#e5e7eb",
    outline: "none",
  },
  showPass: {
    position: "absolute",
    right: "12px",
    top: "12px",
    cursor: "pointer",
    fontSize: "12px",
    color: "#93c5fd",
  },
  strength: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  button: {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(90deg, #2563eb, #1e40af)",
    color: "#fff",
    fontWeight: "bold",
    marginTop: "10px",
  },
  linkText: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px",
  },
  link: {
    color: "#60a5fa",
    cursor: "pointer",
    fontWeight: "bold",
  },
  infoBox: {
    marginTop: "20px",
    padding: "12px",
    background: "rgba(2,6,23,0.6)",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#c7d2fe",
  },
  error: {
    color: "#f87171",
    textAlign: "center",
    fontSize: "13px",
  },
};

export default CreateAccount;
