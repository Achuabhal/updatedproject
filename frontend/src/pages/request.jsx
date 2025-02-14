"use client"

import { useState, useEffect } from "react"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"
import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore"

const AddFriend = () => {
  const { fetchFilteredUserss, isUserLoading } = useChatStore()
  const [users, setUsers] = useState([])
  const [error, setError] = useState("")
  const [requestedUsers, setRequestedUsers] = useState(new Set())

  useEffect(() => {
    fetchFilteredUserss()
      .then((data) => {
        // Check if the data is nested inside a 'sender' object
        const userData = data.sender ? [data.sender] : data.filteredUsers || []
        setUsers(userData)
      })
      .catch(() => setError("Failed to fetch users"))
  }, [fetchFilteredUserss])

  const handleAddFriend = async (friendId) => {
    const { authUser } = useAuthStore.getState();
    if (!authUser) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      await axiosInstance.post(`/addfriend/${authUser._id}`, {
        friendId, // Ensure the backend expects 'friendId'
      });
      setRequestedUsers((prev) => new Set([...prev, friendId]));
      toast.success("Friend request sent successfully!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(error.response?.data?.message || "Failed to send friend request.");
    }
  };
  

  if (isUserLoading) return <p>Loading...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Add Friends</h2>
      {users.length > 0 ? (
        <div style={styles.userList}>
          {users.map((user) => (
            <div key={user._id} style={styles.userCard}>
              <img src={user.profilePic || "/placeholder.svg"} alt={user.fullName} style={styles.profilePic} />
              <div style={styles.userInfo}>
                <h3 style={styles.userName}>{user.fullName}</h3>
                <p>Email: {user.email}</p>
                <p>College: {user.collegeName}</p>
                <p>Course: {user.course}</p>
                <p>Semester: {user.semester}</p>
              </div>
              <button
                onClick={() => handleAddFriend(user._id)}
                style={{
                  ...styles.addButton,
                  backgroundColor: requestedUsers.has(user._id) ? "#ccc" : "#0070f3",
                  cursor: requestedUsers.has(user._id) ? "not-allowed" : "pointer",
                }}
                disabled={requestedUsers.has(user._id)}
              >
                {requestedUsers.has(user._id) ? "Requested" : "Add Friend"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No users available</p>
      )}
    </div>
  )
}

const styles = {
    container: {
      maxWidth: "600px",
      margin: "100px auto",
      padding: "20px",
      textAlign: "center",
      borderRadius: "8px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    heading: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "16px",
    },
    userList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    userCard: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
    },
    profilePic: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      objectFit: "cover",
    },
    userInfo: {
      flex: 1,
      textAlign: "left",
    },
    userName: {
      fontSize: "18px",
      fontWeight: "bold",
    },
    addButton: {
      padding: "8px 12px",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      transition: "background-color 0.3s ease",
    },
  };

export default AddFriend

