// src/pages/ChatList.js

import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const ChatList = () => {
  const [admin] = useAuthState(auth);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Protect admin route
  useEffect(() => {
    if (!admin) return;
    if (admin.email !== process.env.REACT_APP_ADMIN_EMAIL) {
      navigate("/login");
    }
  }, [admin, navigate]);

  // Load users + unread messages
  useEffect(() => {
    const usersRef = ref(db, "users");

    return onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setUsers([]);
        return;
      }

      const usersArray = Object.keys(data).map((uid) => ({
        uid,
        name: data[uid].name || "Unknown User",
        online: data[uid].online || false,
        lastSeen: data[uid].lastSeen || null,
        unread: 0,
        lastMessage: "",
      }));

      usersArray.forEach((user, index) => {
        const msgRef = ref(db, `messages/${user.uid}/admin`);
        onValue(msgRef, (snap) => {
          const msgs = snap.val();
          if (!msgs) return;

          let unreadCount = 0;
          const msgArray = Object.values(msgs);
          msgArray.forEach((m) => {
            if (m.sender === "user" && !m.seen) unreadCount++;
          });

          usersArray[index].unread = unreadCount;
          usersArray[index].lastMessage =
            msgArray[msgArray.length - 1]?.text || "";

          setUsers([...usersArray]);
        });
      });
    });
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <h2 style={styles.header}>🛡️ Admin Chat List</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {filteredUsers.length === 0 ? (
        <p style={styles.empty}>No users found</p>
      ) : (
        filteredUsers.map((user) => (
          <div
            key={user.uid}
            style={styles.card}
            onClick={() => navigate(`/adminchatroom?user=${user.uid}`)}
          >
            <div>
              <div style={styles.nameRow}>
                <b>{user.name}</b>

                {user.unread > 0 && (
                  <span style={styles.badge}>{user.unread}</span>
                )}
              </div>

              <div style={styles.preview}>
                {user.lastMessage || "No messages yet"}
              </div>

              <div style={styles.time}>
                {user.online
                  ? "Online"
                  : user.lastSeen
                  ? `Last seen ${new Date(user.lastSeen).toLocaleString()}`
                  : "Offline"}
              </div>
            </div>

            {/* Online Dot */}
            <div
              style={{
                ...styles.dot,
                background: user.online ? "#22c55e" : "#64748b",
                boxShadow: user.online
                  ? "0 0 12px #22c55e"
                  : "none",
              }}
            />
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  page: {
    background: "radial-gradient(circle at top,#020617,#000)",
    minHeight: "100vh",
    padding: "20px",
    color: "#e5e7eb",
  },
  header: {
    textAlign: "center",
    color: "#c084fc",
    marginBottom: "15px",
  },
  search: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    background: "#020617",
    border: "1px solid #1e293b",
    color: "#fff",
    marginBottom: "15px",
    outline: "none",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px",
    marginBottom: "10px",
    borderRadius: "14px",
    background: "rgba(2,6,23,0.95)",
    boxShadow: "0 0 25px rgba(124,58,237,0.25)",
    cursor: "pointer",
    transition: "0.2s",
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  badge: {
    background: "#ef4444",
    color: "#fff",
    fontSize: "11px",
    padding: "2px 7px",
    borderRadius: "20px",
  },
  preview: {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "220px",
  },
  time: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "3px",
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
  },
};

export default ChatList;
