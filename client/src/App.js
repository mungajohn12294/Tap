// src/App.js

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// Pages
import Splash from "./pages/Splash";
import CreateAccount from "./pages/CreateAccount";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ChatRoom from "./pages/ChatRoom";
import ChatList from "./pages/ChatList";
import AdminChatRoom from "./pages/AdminChatRoom";

const App = () => {
  const [user, loading] = useAuthState(auth);
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000); // 2s splash
    return () => clearTimeout(timer);
  }, []);

  if (loading || showSplash) return <Splash />; // show splash while loading or during splash timer

  return (
    <Router>
      <Routes>
        {/* Public routes: login / create account / forgot password */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/chatroom" />} />
        <Route path="/create" element={!user ? <CreateAccount /> : <Navigate to="/chatroom" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/chatroom" />} />

        {/* User chat route */}
        <Route path="/chatroom" element={user && user.email !== process.env.REACT_APP_ADMIN_EMAIL ? <ChatRoom /> : <Navigate to="/login" />} />

        {/* Admin routes */}
        <Route
          path="/chatlist"
          element={user?.email === process.env.REACT_APP_ADMIN_EMAIL ? <ChatList /> : <Navigate to="/login" />}
        />
        <Route
          path="/adminchatroom"
          element={user?.email === process.env.REACT_APP_ADMIN_EMAIL ? <AdminChatRoom /> : <Navigate to="/login" />}
        />

        {/* Default redirect: if logged in, send to appropriate page */}
        <Route
          path="*"
          element={
            !user
              ? <Navigate to="/login" />
              : user.email === process.env.REACT_APP_ADMIN_EMAIL
              ? <Navigate to="/chatlist" />
              : <Navigate to="/chatroom" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
