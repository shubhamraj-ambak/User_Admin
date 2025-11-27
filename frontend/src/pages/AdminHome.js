import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      name
      email
      userDetails {
        mobile
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $password: String) {
    updateUser(id: $id, name: $name, password: $password) {
      id
      name
      email
    }
  }
`;

const GET_DELETE_REQUESTS = gql`
  query GetDeleteRequests {
    getAllDeleteRequests {
      id
      userId
      status
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

const APPROVE_REQUEST = gql`
  mutation ApproveDeleteRequest($id: ID!) {
    approveDeleteRequest(id: $id) {
      id
      userId
      status
    }
  }
`;

const REJECT_REQUEST = gql`
  mutation RejectDeleteRequest($id: ID!) {
    rejectDeleteRequest(id: $id) {
      id
      userId
      status
    }
  }
`;

export default function AdminHome() {
  const navigate = useNavigate();
  const [view, setView] = useState("profile");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  const storedAdmin = JSON.parse(localStorage.getItem("admin"));
  if (!storedAdmin) navigate("/");

  const { data: usersData, refetch: refetchUsers } = useQuery(GET_USERS);
  const { data: requestsData, refetch: refetchRequests } =
    useQuery(GET_DELETE_REQUESTS);

  const [deleteUserMutation] = useMutation(DELETE_USER);
  const [approveMutation] = useMutation(APPROVE_REQUEST);
  const [rejectMutation] = useMutation(REJECT_REQUEST);
  const [updateUserMutation] = useMutation(UPDATE_USER);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUserMutation({
        variables: {
          id: editUser.id,
          name: editUser.name,
          password: editUser.password || null,
        },
      });
      alert("User updated successfully");
      setEditUser(null);
      refetchUsers();
    } catch (error) {
      console.error(error);
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await deleteUserMutation({ variables: { id } });
    refetchUsers();
  };

  const handleApprove = async (reqId) => {
    await approveMutation({ variables: { id: reqId } });
    refetchUsers();
    refetchRequests();
  };

  const handleReject = async (reqId) => {
    await rejectMutation({ variables: { id: reqId } });
    refetchRequests();
  };

  const toggleUserSelection = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    selectedUsers.forEach((id) => handleDeleteUser(id));
    setSelectedUsers([]);
  };

  return (
    <div style={{ margin: 20, fontFamily: "Arial, sans-serif" }}>
      <nav style={styles.nav}>
        <span style={styles.navTitle} onClick={() => setView("profile")}>
          Home
        </span>
        <div>
          <span style={{ marginRight: 25 }}>
            <strong>Hello,</strong> {storedAdmin?.name}
          </span>
          <button
            style={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem("admin");
              localStorage.removeItem("adminToken");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {view === "profile" && (
        <div style={styles.card}>
          <h2>Admin Profile</h2>
          <p>
            <strong>Name:</strong> {storedAdmin?.name}
          </p>
          <p>
            <strong>Email:</strong> {storedAdmin?.email}
          </p>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 20,
              justifyContent: "center",
            }}
          >
            <button style={styles.primaryBtn} onClick={() => setView("users")}>
              Users
            </button>
            <button
              style={styles.successBtn}
              onClick={() => setView("requests")}
            >
              Delete Requests
            </button>
          </div>
        </div>
      )}

      {view === "users" && (
        <div style={styles.card}>
          <h2>All Users</h2>
          {usersData?.getAllUsers?.length === 0 ? (
            <p>No users found</p>
          ) : (
            <>
              {selectedUsers.length > 0 && (
                <button style={styles.dangerBtn} onClick={handleBulkDelete}>
                  Delete Selected ({selectedUsers.length})
                </button>
              )}
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === usersData.getAllUsers.length
                        }
                        onChange={(e) =>
                          e.target.checked
                            ? setSelectedUsers(
                                usersData.getAllUsers.map((u) => u.id)
                              )
                            : setSelectedUsers([])
                        }
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.getAllUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => toggleUserSelection(u.id)}
                        />
                      </td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.userDetails?.mobile || "N/A"}</td>
                      <td>
                        <button
                          style={styles.successBtn}
                          onClick={() => setEditUser(u)}
                        >
                          Edit
                        </button>
                        <button
                          style={styles.dangerBtn}
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
      {editUser && (
        <form
          onSubmit={handleUpdateUser}
          style={styles.input}
        >
          <h3 style={{ textAlign: "center" }}>Edit User</h3>
          <input
            type="text"
            value={editUser.name}
            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
            placeholder="Name"
          />
          <input
            type="text"
            value={editUser.email}
            // disabled
            onChange={(e) =>
              setEditUser({ ...editUser, email: e.target.value })
            }
            placeholder="Email"
          />
          <input
            type="password"
            placeholder="Enter new Password"
            onChange={(e) =>
              setEditUser({ ...editUser, password: e.target.value })
            }
          />
          <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
            <button type="submit" style={styles.successBtn}>
              Save
            </button>
            <button
              type="button"
              style={styles.dangerBtn}
              onClick={() => setEditUser(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {view === "requests" && (
        <div style={styles.card}>
          <h2>Delete Requests</h2>
          {requestsData?.getAllDeleteRequests?.length === 0 ? (
            <p>No requests</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>User Id</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requestsData.getAllDeleteRequests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.userId}</td>
                    <td>{r.status}</td>
                    <td>
                      {r.status === "pending" && (
                        <>
                          <button
                            style={styles.successBtn}
                            onClick={() => handleApprove(r.id)}
                          >
                            Approve
                          </button>
                          <button
                            style={styles.dangerBtn}
                            onClick={() => handleReject(r.id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <span style={{ color: "#28a745" }}>Approved</span>
                      )}
                      {r.status === "rejected" && (
                        <span style={{ color: "#dc3545" }}>Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  navTitle: { cursor: "pointer", fontWeight: "bold", fontSize: 24 },
  logoutBtn: {
    background: "#dc3545",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  primaryBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
  },
  successBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 15,
  },
  dangerBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
  },
  card: {
    marginTop: 10,
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  table: {
    width: "100%",
    Collapse: "collapse",
    marginTop: 10,
  },
  th: {
    border: "1px solid #ddd",
    padding: "12px 8px",
    textAlign: "center",
  },
  td: {
    border: "1px solid #ddd",
    padding: "12px 8px",
    textAlign: "center",
  },
  input: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 400,
    margin: "20px auto",
    padding: 20,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
};