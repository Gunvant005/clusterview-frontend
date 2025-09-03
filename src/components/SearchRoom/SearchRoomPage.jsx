import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCartCheckFill, BsBookmarkPlusFill } from 'react-icons/bs';
import styles from './SearchRoomPage.module.css';
import { FaArrowLeft } from "react-icons/fa";

const SearchRoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [type, setType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImages, setModalImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      setError('You must be logged in to view rooms.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/search-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type, priceRange, location }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRooms();
  };

  const handleRoomClick = (images) => {
    setModalImages(images);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalImages([]);
    setIsModalOpen(false);
  };

  const handleBackToHome = () => {
    navigate('/blank');
  };

  const handleSaveRoom = async (room) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        alert('You must be logged in to save rooms.');
        return;
      }
  
      const response = await fetch('http://127.0.0.1:8000/save-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          room,
        }),
      });
  
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save room');
      }
  
      alert(result.message);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button className={styles.cartButton} onClick={() => navigate('/roomcart')}>
          <BsCartCheckFill />
        </button>
        <h1>Search Room</h1>
        <div className={styles.back}>
          <button className={styles.backArrowButton} onClick={() => navigate("/blank")}>
              <FaArrowLeft />
          </button>
        </div>
      </header>

      <div className={styles.searchBar}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Select Type</option>
          <option value="PG">PG</option>
          <option value="1BHK">1BHK</option>
          <option value="2BHK">2BHK</option>
          <option value="3BHK">3BHK</option>
          <option value="4BHK">4BHK</option>
        </select>

        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <option value="">Select Price Range</option>
          <option value="0-5000">0-5000</option>
          <option value="5000-10000">5000-10000</option>
          <option value="10000-15000">10000-15000</option>
          <option value="15000-20000">15000-20000</option>
          <option value="20000+">20000+</option>
        </select>

        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      {loading ? (
        <p>Loading rooms...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : rooms.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        <div className={styles.roomGrid}>
          {rooms.map((room) => (
            <div className={styles.roomCard} key={room._id}>
              <img
                src={`http://127.0.0.1:8000/${room.images[0]}`}
                alt="Room"
                className={styles.roomImage}
                onClick={() => handleRoomClick(room.images)}
              />
              <div className={styles.roomDetails}>
                <div className={styles.saveButtonContainer}>
                  <button
                    className={styles.saveButton}
                    onClick={() => handleSaveRoom(room)}
                  >
                    <BsBookmarkPlusFill />
                  </button>
                </div>
                <p><strong>Type:</strong> {room.roomType}</p>
                <p><strong>Price:</strong> ₹{room.price}</p>
                <p><strong>Location:</strong> {room.location}</p>
                <p><strong>Contact:</strong> {room.contactNo}</p>
                <p><strong>Available:</strong> {room.availability ? 'Yes' : 'No'}</p>
                <p><strong>For:</strong> {room.forroom}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default SearchRoomPage;
