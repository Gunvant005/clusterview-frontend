import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RoomCart.module.css";

const RoomCart = () => {
  const [savedRooms, setSavedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImages, setModalImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedRooms = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          setError("You must be logged in to view saved rooms.");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://127.0.0.1:8000/get-saved-rooms?email=${userEmail}`);
        if (!res.ok) {
          throw new Error("Failed to fetch saved rooms");
        }
        const data = await res.json();
        setSavedRooms(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSavedRooms();
  }, []);

  const handleUnsaveRoom = async (roomId) => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("You must be logged in to unsave rooms.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/unsave-room", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, roomId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to unsave room");
      }

      // Refresh the list by refetching saved rooms
      const res = await fetch(`http://127.0.0.1:8000/get-saved-rooms?email=${userEmail}`);
      const data = await res.json();
      setSavedRooms(data);
      alert(result.message);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleRoomClick = (images) => {
    setModalImages(images);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalImages([]);
    setIsModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.roomCartContainer}>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className={styles.roomCartContainer}>
      <h1>Your Saved Rooms</h1>
      {savedRooms.length > 0 ? (
        <div className={styles.roomGrid}>
          {savedRooms.map((item, index) => (
            <div key={index} className={styles.roomCard}>
              <img
                src={`http://127.0.0.1:8000/${item.room.images[0]}`}
                alt="Room"
                className={styles.roomImage}
                onClick={() => handleRoomClick(item.room.images)}
              />
              <div className={styles.roomDetails}>
                <p><strong>Type:</strong> {item.room.roomType}</p>
                <p><strong>Price:</strong> ₹{item.room.price}</p>
                <p><strong>Location:</strong> {item.room.location}</p>
                <p><strong>Contact:</strong> {item.room.contactNo}</p>
                <p><strong>Available:</strong> {item.room.availability ? "Yes" : "No"}</p>
                <p><strong>For:</strong> {item.room.forroom}</p>
                <button
                  className={styles.unsaveButton}
                  onClick={() => handleUnsaveRoom(item.room._id)}
                >
                  Unsave
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No saved rooms found.</p>
      )}
      <button className={styles.backButton} onClick={() => navigate("/search-room")}>
        Back to Search
      </button>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeModal} onClick={closeModal}>×</button>
            {modalImages.map((image, index) => (
              <img
                key={index}
                src={`http://127.0.0.1:8000/${image}`}
                alt={`Room ${index + 1}`}
                className={styles.modalImage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCart;