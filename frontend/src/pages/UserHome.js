import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql, useApolloClient } from "@apollo/client";

const GET_USER_DETAIL = gql`
  query GetDetailById($id: ID!) {
    getDetailById(id: $id) {
      mobile
      address
      pan_card
    }
  }
`;

const GET_PAN = gql`
  query GetPan($id: Int!) {
    getPanCard(id: $id) {
      pan_card
    }
  }
`;

const UPDATE_DETAIL = gql`
  mutation UpdateUserDetail(
    $userId: ID!
    $mobile: String
    $address: String
    $pan_card: String
  ) {
    updateUserDetail(
      userId: $userId
      mobile: $mobile
      address: $address
      pan_card: $pan_card
    ) {
      userId
      mobile
      address
      pan_card
    }
  }
`;

const CREATE_DELETE_REQUEST = gql`
  mutation CreateDeleteRequest($userId: ID!) {
    createDeleteRequest(userId: $userId) {
      id
      status
    }
  }
`;

const CREATE_URL = gql`
  mutation CreateURL($originalUrl: String!) {
    createUrl(originalUrl: $originalUrl) {
      shortUrl
      originalUrl
      shortCode
    }
  }
`;

const GET_URL_DETAILS = gql`
  query GetUrlByShortCode($shortCode: String!) {
    getUrlByShortCode(shortCode: $shortCode) {
      originalUrl
      shortUrl
      shortCode
      createdAt
      clicks
      userId
      user {
        name
        email
      }
    }
  }
`;

export default function UserHome() {
  const navigate = useNavigate();
  const client = useApolloClient();

  const [details, setDetails] = useState({
    mobile: "",
    address: "",
    pan_card: "",
  });
  const [pan, setPan] = useState("**********");
  const [visible, setVisible] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [view, setView] = useState("profile");
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [urlDetail, setUrlDetail] = useState(null);
  const [shortCode, setShortCode] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    if (!storedUser) navigate("/");
  }, [storedUser, navigate]);

  const { data, loading, refetch } = useQuery(GET_USER_DETAIL, {
    variables: { id: storedUser?.id },
    skip: !storedUser,
  });

  const [updateDetail] = useMutation(UPDATE_DETAIL);
  const [createDeleteRequest] = useMutation(CREATE_DELETE_REQUEST);

  const [createUrl] = useMutation(CREATE_URL, {
    onCompleted: (data) => {
      setShortUrl(data.createUrl.shortUrl);
      setShortCode(data.createUrl.shortCode);
    },
  });

  useEffect(() => {
    if (data?.getDetailById) {
      setDetails(data.getDetailById);
    }
  }, [data]);

  const togglePan = async () => {
    if (!visible) {
      try {
        const userId = parseInt(storedUser.id);
        const { data: panData } = await client.query({
          query: GET_PAN,
          variables: { id: userId },
          fetchPolicy: "no-cache",
        });
        setPan(panData?.getPanCard?.pan_card || "**********");
      } catch (err) {
        console.error(err);
        alert("Failed to fetch PAN");
      }
    } else {
      setPan("**********");
    }
    setVisible(!visible);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDetail({
        variables: {
          userId: storedUser.id,
          mobile: details.mobile,
          address: details.address,
          pan_card: details.pan_card,
        },
      });
      await refetch();
      setView("profile");
      alert("Details updated successfully");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const requestDelete = async () => {
    try {
      await createDeleteRequest({ variables: { userId: storedUser.id } });

      setDeleteRequested(true);
      alert("Delete request sent");
    } catch (err) {
      console.error(err);
      alert("Failed to request deletion");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) return alert("Enter a valid URL");
    if (shortUrl) return;
    await createUrl({ variables: { originalUrl } });
  };

  const fetchUrlDetails = async (shortCodeValue) => {
    try {
      const { data } = await client.query({
        query: GET_URL_DETAILS,
        variables: { shortCode: shortCodeValue },
        fetchPolicy: "no-cache",
      });
      setUrlDetail(data.getUrlByShortCode);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch URL details");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div style={{ margin: 20, fontFamily: "Arial, sans-serif" }}>
      <nav style={styles.nav}>
        <span style={styles.navTitle} onClick={() => setView("profile")}>
          Home
        </span>
        <div>
          <span style={{ marginRight: 25 }}>
            <strong>Hello,</strong> {storedUser?.name}
          </span>
          <button
            style={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("userToken");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      {view === "profile" && (
        <div style={styles.card}>
          <h2>Profile</h2>
          <p>
            <strong>Name:</strong> {storedUser?.name}
          </p>
          <p>
            <strong>Email:</strong> {storedUser?.email}
          </p>
          <p>
            <strong>Mobile:</strong> {details.mobile || "Not set"}
          </p>
          <p>
            <strong>Address:</strong> {details.address || "Not set"}
          </p>
          <p>
            <strong>PAN Card:</strong> {pan}
          </p>
          <button style={styles.primaryBtn} onClick={togglePan}>
            {visible ? "Hide" : "Show"} PAN
          </button>

          <div style={{ marginTop: 20 }}>
            <button style={styles.successBtn} onClick={() => setView("update")}>
              Update Details
            </button>
            <button
              style={styles.dangerBtn}
              onClick={requestDelete}
              disabled={deleteRequested}
            >
              {deleteRequested
                ? "Delete Request Pending"
                : "Request Account Deletion"}
            </button>
          </div>
          <div>
            <button
              style={styles.primaryBtn}
              onClick={() => setView("urlGenerator")}
            >
              Short URL Generator
            </button>
          </div>
        </div>
      )}
      {view === "update" && (
        <div style={styles.card}>
          <form onSubmit={handleUpdate} style={styles.form}>
            <h2 style={{ textAlign: "center" }}>Update Details</h2>
            <input
              placeholder="Mobile"
              value={details.mobile}
              onChange={(e) =>
                setDetails({ ...details, mobile: e.target.value })
              }
              style={styles.input}
            />
            <input
              placeholder="Address"
              value={details.address}
              onChange={(e) =>
                setDetails({ ...details, address: e.target.value })
              }
              style={styles.input}
            />
            <input
              placeholder="PAN Card"
              // value={details.pan_card}
              onChange={(e) =>
                setDetails({ ...details, pan_card: e.target.value })
              }
              style={styles.input}
            />
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <button type="submit" style={styles.successBtn}>
                Save
              </button>
              <button
                type="button"
                style={styles.dangerBtn}
                onClick={() => setView("profile")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {view === "urlGenerator" && (
        <div style={styles.card}>
          <form onSubmit={handleGenerate} style={styles.form}>
            <h2 style={{ textAlign: "center" }}> Short URL Generator </h2>

            <input
              type="text"
              placeholder="Enter URL"
              value={originalUrl}
              onChange={(e) => {
                setOriginalUrl(e.target.value);
                setShortUrl("");
              }}
              style={styles.input}
            />
            <button style={styles.primaryBtn} type="submit">
              Generate Short URL
            </button>

            {shortUrl && (
              <div>
                <p>
                  Short URL:{" "}
                  <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                    {shortUrl}
                  </a>
                </p>
                <button
                  style={styles.primaryBtn}
                  onClick={() => fetchUrlDetails(shortCode)}
                >
                  More Details
                </button>
              </div>
            )}
          </form>
        </div>
      )}
      {urlDetail && (
        <div style={styles.card}>
          <h2>URL Details</h2>
          <div>
            <p>
              <b>Original URL:</b> {urlDetail.originalUrl}
            </p>
            <p>
              <b>Short URL:</b> {urlDetail.shortUrl}
            </p>
            <p>
              <b>Short Code:</b> {urlDetail.shortCode}
            </p>
            <p>
              <b>Created At:</b>{" "}
              {new Date(Number(urlDetail.createdAt)).toLocaleString() || "NA"}
            </p>
            <p>
              <b>Total Clicks:</b> {urlDetail.clicks}
            </p>
            {urlDetail.user && (
              <>
                <p>
                  <b>Created By:</b> {urlDetail.user.name}
                </p>
                <p>
                  <b>Email:</b> {urlDetail.user.email}
                </p>
              </>
            )}
          </div>
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
  navTitle: {
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 24,
  },
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
    marginBottom: 20,
  },
  dangerBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 20,
  },
  card: {
    marginTop: 10,
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
    maxWidth: 400,
    margin: "20px auto",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 15,
  },
};