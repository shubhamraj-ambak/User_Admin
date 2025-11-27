import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $password: String!) {
    createUser(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

const CREATE_ADMIN = gql`
  mutation CreateAdmin($name: String!, $email: String!, $password: String!) {
    createAdmin(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export default function SignupForm({ mode }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [createUser] = useMutation(CREATE_USER);
  const [createAdmin] = useMutation(CREATE_ADMIN);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const encodedPassword = btoa(password);

      if (mode === "user") {
        await createUser({ variables: { name, email, password: encodedPassword } });
      } else if (mode === "admin") {
        await createAdmin({ variables: { name, email, password: encodedPassword } });
      } else {
        setError("Invalid SignUp mode.");
        return;
      }

      alert("SignUp successful! Please login.");
      navigate("/"); // Go back to login
    } catch (err) {
      console.error(err);
      setError(err.message || "SignUp failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      style={{
        maxWidth: 420,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h3 style={{ textAlign: "center" }}>SignUp as {mode?.toUpperCase()}</h3>

      <input
        type="text"
        value={name}
        placeholder="Name"
        required
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
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
          background: "#28a745",
          color: "#fff",
          padding: "10px",
          borderRadius: 6,
          fontSize: 16,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Signing up..." : `SignUp as ${mode}`}
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