// src/pages/ChatRoom.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, update, push } from "firebase/database";
import { auth, db } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "👏"];

const ChatRoom = () => {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [adminTyping, setAdminTyping] = useState(false);
  const [showReactionsFor, setShowReactionsFor] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Messages listener
  useEffect(() => {
    if (!user) return;
    const messagesRef = ref(db, `messages/${user.uid}/admin`);
    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const msgs = data
        ? Object.entries(data).map(([key, value]) => ({ id: key, ...value }))
        : [];
      setMessages(msgs);

      if (data) {
        Object.keys(data).forEach((key) => {
          if (data[key].sender === "admin" && !data[key].seen) {
            update(ref(db, `messages/${user.uid}/admin/${key}`), { seen: true });
          }
        });
      }
    });
  }, [user]);

  // Admin typing
  useEffect(() => {
    if (!user) return;
    const typingRef = ref(db, `typing/${user.uid}/admin`);
    return onValue(typingRef, (snapshot) => {
      setAdminTyping(snapshot.val()?.typing || false);
    });
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagesRef = ref(db, `messages/${user.uid}/admin`);
    await push(messagesRef, {
      text: newMessage,
      sender: "user",
      timestamp: Date.now(),
      seen: false,
      reactions: {},
    });

    setNewMessage("");
  };

  const handleTyping = () => {
    const typingRef = ref(db, `typing/${user.uid}/user`);
    update(typingRef, { typing: true });
    setTimeout(() => update(typingRef, { typing: false }), 1000);
  };

  // Start editing a message
  const startEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
  };

  // Save edited message
  const saveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    await update(ref(db, `messages/${user.uid}/admin/${msgId}`), {
      text: editingText,
      edited: true,
    });
    setEditingMsgId(null);
    setEditingText("");
  };

  // Add reaction
  const addReaction = async (msgId, emoji) => {
    const reactionRef = ref(db, `messages/${user.uid}/admin/${msgId}/reactions/${user.uid}`);
    await update(reactionRef, emoji);
    setShowReactionsFor(null);
  };

  // Render seen ticks
  const renderTicks = (msg) => {
    if (msg.sender !== "user") return null;
    if (!msg.seen) return "✔✔"; // grey ticks for sent
    return "✔✔"; // blue ticks for seen
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.header}>💬 Secure Chat</h2>

      <div style={styles.chatBox}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.messageRow,
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              position: "relative",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                background:
                  msg.sender === "user"
                    ? "linear-gradient(135deg,#2563eb,#1e3a8a)"
                    : "#020617",
                boxShadow:
                  msg.sender === "user"
                    ? "0 0 15px rgba(37,99,235,0.4)"
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
                  {msg.sender === "user" && (
                    <span
                      style={{
                        marginLeft: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                      onClick={() => startEdit(msg)}
                    >
                      ⋮
                    </span>
                  )}
                  <div style={{ fontSize: "10px", marginTop: "2px", textAlign: "right" }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                    {msg.sender === "user" && <span>{renderTicks(msg)}</span>}
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
        {adminTyping && (
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
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleTyping}
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
    color: "#60a5fa",
    marginBottom: "10px",
  },
  chatBox: {
    height: "420px",
    overflowY: "auto",
    padding: "15px",
    borderRadius: "16px",
    background: "rgba(2,6,23,0.9)",
    boxShadow: "0 0 40px rgba(37,99,235,0.2)",
    marginBottom: "12px",
    position: "relative",
  },
  messageRow: {
    display: "flex",
    marginBottom: "10px",
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: "14px",
    maxWidth: "75%",
    fontSize: "14px",
  },
  typing: {
    display: "flex",
    gap: "5px",
    marginTop: "5px",
  },
  dot: {
    width: "6px",
    height: "6px",
    background: "#60a5fa",
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
    background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
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

export default ChatRoom;
