import React, { useState } from "react";
import LoginForm from "../component/LoginForm";
import SignupForm from "../component/SignupForm";

export default function LandingPage() {
  const [mode, setMode] = useState(null);
  const [authType, setAuthType] = useState(null);
  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setAuthType(null);
  };

  const handleBack = () => {
    setMode(null);
    setAuthType(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          Welcome to <span style={{ color: "#007bff" }}>User-Admin Portal</span>
        </h1>

        {!mode && (
          <div style={styles.buttonRow}>
            <button
              style={styles.primaryBtn}
              onClick={() => handleModeSelect("user")}
            >
              User
            </button>
            <button
              style={styles.successBtn}
              onClick={() => handleModeSelect("admin")}
            >
              Admin
            </button>
          </div>
        )}

        {mode && (
          <div style={styles.authRow}>
            <div>
              <h2>{mode.toUpperCase()} Section</h2>
              <div style={{ marginTop: 10 }}>
                <label style={{ marginRight: 16 }}>
                  <input
                    type="radio"
                    name="auth"
                    checked={authType === "login"}
                    onChange={() => setAuthType("login")}
                  />{" "}
                  Login
                </label>
                <label>
                  <input
                    type="radio"
                    name="auth"
                    checked={authType === "signup"}
                    onChange={() => setAuthType("signup")}
                  />{" "}
                  Signup
                </label>
              </div>
            </div>
            <button style={styles.dangerBtn} onClick={handleBack}>
              Back
            </button>
          </div>
        )}

        <div style={{ marginTop: 30 }}>
          {authType === "login" && <LoginForm mode={mode} />}
          {authType === "signup" && <SignupForm mode={mode} />}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f7f9fc",
    padding: 20,
  },
  card: {
    width: 900,
    maxWidth: "100%",
    background: "#fff",
    padding: 32,
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: 24,
    marginTop: 30,
  },
  authRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 30,
  },
  primaryBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: 6,
    cursor: "pointer",
  },
  successBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: 6,
    cursor: "pointer",
  },
  dangerBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: 6,
    cursor: "pointer",
  },
};