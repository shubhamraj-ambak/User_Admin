import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const LOGIN_ADMIN = gql`
  mutation LoginAdmin($email: String!, $password: String!) {
    loginAdmin(email: $email, password: $password) {
      token
      admin {
        id
        name
        email
      }
    }
  }
`;

export default function LoginForm({ mode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginUser] = useMutation(LOGIN_USER);
  const [loginAdmin] = useMutation(LOGIN_ADMIN);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const encodedPassword = btoa(password);

      if (mode === "user") {
        const { data } = await loginUser({
          variables: { email, password: encodedPassword },
        });
        localStorage.setItem("user", JSON.stringify(data.loginUser.user));
        localStorage.setItem("userToken", data.loginUser.token);
        navigate("/user/home");
      } else if (mode === "admin") {
        const { data } = await loginAdmin({
          variables: { email, password: encodedPassword },
        });
        localStorage.setItem("admin", JSON.stringify(data.loginAdmin.admin));
        localStorage.setItem("adminToken", data.loginAdmin.token);
        navigate("/admin/home");
      } else {
        setError("Invalid login mode.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      style={{
        maxWidth: 420,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h3 style={{ textAlign: "center" }}>Login as {mode?.toUpperCase()}</h3>

      <input
        type="email"
        value={email}
        placeholder="Email"
        required
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        value={password}
        placeholder="Password"
        required
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      {error && (
        <div style={{ color: "red", textAlign: "center", fontSize: 14 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: "#007bff",
          color: "#fff",
          padding: "10px",
          borderRadius: 6,
          fontSize: 16,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Logging in..." : `Login as ${mode}`}
      </button>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 15,
};