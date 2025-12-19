import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Toaster from "../components/Toaster";
import { FcGoogle } from "react-icons/fc";

export default function SignUp({ switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  // Email/Password signup
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setMessage("All fields are required");
      setType("error");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
      });

      setMessage("Account created successfully!");
      setType("success");
    } catch (err) {
      setMessage(err.message);
      setType("error");
    }
  };

  // Google signup
  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Save user data to Firestore (if not already)
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName || "Anonymous",
        email: user.email,
      });

      setMessage("Logged in with Google!");
      setType("success");
    } catch (err) {
      setMessage(err.message);
      setType("error");
    }
  };

  return (
    <div style={styles.container}>
      <Toaster message={message} type={type} />
      <div style={styles.card}>
        <h1 style={styles.title}>Sign Up</h1>
        <input style={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={styles.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={styles.button} onClick={handleSignUp}>Create Account</button>
        <button style={styles.googleButton} onClick={handleGoogleSignUp}><FcGoogle size={24} style={{marginRight:8}} />Sign in with Google</button>
        <p style={styles.switchText} onClick={switchToLogin}>Already have an account? Log In</p>
      </div>
    </div>
  );
}

// You can reuse the same styling from Login.js or slightly modify
const styles = {
  container: {
    height:"100vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    background: "linear-gradient(135deg, #0a0a2e, #001a5f)",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    background: "rgba(10,10,46,0.95)",
    padding: "40px",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 0 20px #00ffaa, 0 0 40px #00aaff",
    minWidth: "320px",
  },
  title: {
    color: "#00ffaa",
    textAlign: "center",
    fontSize: "36px",
    marginBottom: "16px",
    textShadow: "0 0 10px #00ffaa, 0 0 20px #00aaff",
  },
  input: {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#00ffaa",
    color: "#0f0f2b",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  },
  googleButton: {
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    padding:"12px",
    borderRadius:"12px",
    border:"none",
    background:"#001f7f",
    color:"#fff",
    fontWeight:"600",
    cursor:"pointer",
    transition:"0.3s",
  },
  switchText: {
    color:"#00aaff",
    textAlign:"center",
    cursor:"pointer",
    marginTop:"8px",
  },
};
