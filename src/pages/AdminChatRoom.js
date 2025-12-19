// src/pages/AdminChatRoom.js

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, onValue, push, update } from "firebase/database";
import { auth, db } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "👏"];

const AdminChatRoom = () => {
  const [admin] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [userTyping, setUserTyping] = useState(false);
  const [showReactionsFor, setShowReactionsFor] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const selectedUserUid = searchParams.get("user");

  useEffect(() => {
    if (!admin) return;
    if (admin.email !== process.env.REACT_APP_ADMIN_EMAIL) {
      navigate("/login");
    }
  }, [admin, navigate]);

  // Messages listener
  useEffect(() => {
    if (!selectedUserUid) return;

    const messagesRef = ref(db, `messages/${selectedUserUid}/admin`);
    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const msgs = data
        ? Object.entries(data).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setMessages(msgs);

      if (data) {
        Object.keys(data).forEach((key) => {
          if (data[key].sender === "user" && !data[key].seen) {
            update(ref(db, `messages/${selectedUserUid}/admin/${key}`), {
              seen: true,
            });
          }
        });
      }
    });
  }, [selectedUserUid]);

  // User typing indicator
  useEffect(() => {
    if (!selectedUserUid) return;

    const typingRef = ref(db, `typing/${selectedUserUid}/user`);
    return onValue(typingRef, (snapshot) => {
      setUserTyping(snapshot.val()?.typing || false);
    });
  }, [selectedUserUid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagesRef = ref(db, `messages/${selectedUserUid}/admin`);
    await push(messagesRef, {
      text: newMessage,
      sender: "admin",
      timestamp: Date.now(),
      seen: false,
      reactions: {},
    });

    setNewMessage("");
  };

  // Start editing message
  const startEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
  };

  // Save edited message
  const saveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    await update(ref(db, `messages/${selectedUserUid}/admin/${msgId}`), {
      text: editingText,
      edited: true,
    });
    setEditingMsgId(null);
    setEditingText("");
  };

  // Add reaction
  const addReaction = async (msgId, emoji) => {
    const reactionRef = ref(db, `messages/${selectedUserUid}/admin/${msgId}/reactions/${admin.uid}`);
    await update(reactionRef, emoji);
    setShowReactionsFor(null);
  };

  // Render seen ticks
  const renderTicks = (msg) => {
    if (msg.sender !== "admin") return null;
    if (!msg.seen) return "✔"; // grey single tick for offline
    return "✔✔"; // double tick blue for seen
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.header}>🛡️ Admin Control Room</h2>

      <p style={styles.sub}>
        Chatting with user: <span style={styles.uid}>{selectedUserUid}</span>
      </p>

      <div style={styles.chatBox}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.row,
              justifyContent: msg.sender === "admin" ? "flex-end" : "flex-start",
              position: "relative",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                background:
                  msg.sender === "admin"
                    ? "linear-gradient(135deg,#7c3aed,#4c1d95)"
                    : "#020617",
                boxShadow:
                  msg.sender === "admin"
                    ? "0 0 15px rgba(124,58,237,0.4)"
                    : "0 0 10px rgba(255,255,255,0.05)",
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowReactionsFor(msg.id);
              }}
            >
              {editingMsgId === msg.id ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    style={{ width: "80%", marginRight: "5px" }}
                  />
                  <button onClick={() => saveEdit(msg.id)}>Save</button>
                  <button onClick={() => setEditingMsgId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  {msg.text} {msg.edited && <i>(edited)</i>}
                  {msg.sender === "admin" && (
                    <span
                      style={{ marginLeft: "5px", cursor: "pointer", fontWeight: "bold" }}
                      onClick={() => startEdit(msg)}
                    >
                      ⋮
                    </span>
                  )}
                  <div style={{ fontSize: "10px", marginTop: "2px", textAlign: "right" }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {msg.sender === "admin" && <span>{renderTicks(msg)}</span>}
                  </div>
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div style={{ fontSize: "14px", marginTop: "2px" }}>
                      {Object.values(msg.reactions).join(" ")}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Reactions popup */}
            {showReactionsFor === msg.id && (
              <div style={styles.reactionsPopup}>
                {emojis.map((emoji) => (
                  <span
                    key={emoji}
                    style={{ fontSize: "20px", cursor: "pointer", margin: "0 3px" }}
                    onClick={() => addReaction(msg.id, emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {userTyping && (
          <div style={styles.typing}>
            <span style={styles.dot}></span>
            <span style={styles.dot}></span>
            <span style={styles.dot}></span>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} style={styles.inputBox}>
        <input
          type="text"
          placeholder="Type admin response..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.sendBtn}>
          ➤
        </button>
      </form>
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
    marginBottom: "4px",
  },
  sub: {
    textAlign: "center",
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "10px",
  },
  uid: {
    color: "#60a5fa",
    fontFamily: "monospace",
  },
  chatBox: {
    height: "420px",
    overflowY: "auto",
    padding: "15px",
    borderRadius: "16px",
    background: "rgba(2,6,23,0.95)",
    boxShadow: "0 0 40px rgba(124,58,237,0.25)",
    marginBottom: "12px",
    position: "relative",
  },
  row: {
    display: "flex",
    marginBottom: "10px",
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: "14px",
    maxWidth: "75%",
    fontSize: "14px",
  },
  time: {
    fontSize: "10px",
    opacity: 0.6,
    marginTop: "4px",
    textAlign: "right",
  },
  typing: {
    display: "flex",
    gap: "5px",
    marginTop: "5px",
  },
  dot: {
    width: "6px",
    height: "6px",
    background: "#c084fc",
    borderRadius: "50%",
    display: "inline-block",
    animation: "bounce 1s infinite alternate",
  },
  inputBox: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    background: "#020617",
    border: "1px solid #1e293b",
    color: "#fff",
    outline: "none",
  },
  sendBtn: {
    padding: "0 18px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  reactionsPopup: {
    position: "absolute",
    bottom: "30px",
    left: "-10px",
    background: "#111",
    padding: "5px 8px",
    borderRadius: "12px",
    display: "flex",
  },
};

// Typing animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes bounce {
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}`, styleSheet.cssRules.length);

export default AdminChatRoom;
