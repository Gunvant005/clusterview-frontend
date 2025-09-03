import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaArrowLeft } from 'react-icons/fa';
import styles from './Room.module.css';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    roomType: '',
    price: '',
    location: '',
    images: [],
    contactNo: '',
    forroom: '',
    availability: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalImages, setModalImages] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/fetch-all-rooms?email=Admin@gmail.com&password=123', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data);
      setFilteredRooms(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomType: room.roomType,
      price: room.price,
      location: room.location,
      contactNo: room.contactNo,
      forroom: room.forroom,
      availability: room.availability,
      images: room.images || [],
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, images: Array.from(files) });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(e.target.value);
    const filtered = rooms.filter(
      (room) =>
        room.roomType.toLowerCase().includes(query) ||
        room.price.toString().includes(query) ||
        room.location.toLowerCase().includes(query) ||
        room.contactNo.includes(query) ||
        room.forroom.toLowerCase().includes(query)
    );
    setFilteredRooms(query ? filtered : rooms);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredRooms(rooms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(formData.contactNo)) {
      setModalMessage('Contact number must be exactly 10 digits.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('roomId', selectedRoom._id);
    formDataToSend.append('email', 'Admin@gmail.com');
    formDataToSend.append('password', '123');
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'images') {
        formDataToSend.append(key, value);
      }
    });
    formData.images.forEach((image) => {
      if (typeof image === 'string') {
        formDataToSend.append('existingImages', image);
      } else {
        formDataToSend.append('images', image);
      }
    });

    try {
      const response = await fetch('http://127.0.0.1:8000/update-room', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      setModalMessage(data.error || 'Room updated successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
      if (!data.error) {
        fetchRooms();
      }
    } catch (err) {
      setModalMessage('Error updating room');
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    setModalMessage('Are you sure you want to delete this room?');
    setModalType('confirm');
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/delete-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: selectedRoom._id, email: 'Admin@gmail.com', password: '123' }),
      });
      const data = await response.json();
      setModalMessage(data.error || 'Room deleted successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
      if (!data.error) {
        setSelectedRoom(null);
        fetchRooms();
      }
    } catch (err) {
      setModalMessage('Error deleting room');
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setModalType('info');
  };

  const closeModal = () => {
    setShowModal(false);
    if (modalType === 'success') {
      setSelectedRoom(null);
    }
  };

  const handleImageClick = (images) => {
    setModalImages(images);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setModalImages([]);
    setIsImageModalOpen(false);
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    fetchRooms();
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate('/admin')}
          aria-label="Go back to admin dashboard"
        >
          <FaArrowLeft />
        </button>
        <h1>Manage Rooms</h1>
      </header>

      <main className={styles.main}>
        {!selectedRoom ? (
          <>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by type, price, location, contact, or room for..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search rooms"
              />
              {searchQuery && (
                <button
                  className={styles.clearButton}
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
              <FaSearch className={styles.searchIcon} />
            </div>
            {error ? (
              <div className={styles.errorContainer}>
                <p className={styles.error}>{error}</p>
                <button
                  className={styles.retryButton}
                  onClick={retryFetch}
                  aria-label="Retry fetching rooms"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className={styles.loader}>Loading...</div>
            ) : filteredRooms.length === 0 ? (
              <p className={styles.noRooms}>No rooms found.</p>
            ) : (
              <div className={styles.roomGrid}>
                {filteredRooms.map((room) => (
                  <div
                    className={styles.roomCard}
                    key={room._id}
                    onClick={() => handleSelectRoom(room)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectRoom(room)}
                  >
                    <img
                      src={`http://127.0.0.1:8000/${room.images[0]}`}
                      alt={`${room.roomType} preview`}
                      className={styles.roomImage}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(room.images);
                      }}
                    />
                    <div className={styles.roomDetails}>
                      <p><strong>Type:</strong> {room.roomType}</p>
                      <p><strong>Price:</strong> ₹{room.price}</p>
                      <p><strong>Location:</strong> {room.location}</p>
                      <p><strong>Contact:</strong> {room.contactNo}</p>
                      <p><strong>Room For:</strong> {room.forroom}</p>
                      <p><strong>Available:</strong> {room.availability ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.formContainer}>
            <select
              className={styles.inputField}
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              required
              aria-label="Room type"
            >
              <option value="" disabled>Select Room Type</option>
              <option value="PG">PG</option>
              <option value="1BHK">1BHK</option>
              <option value="2BHK">2BHK</option>
              <option value="3BHK">3BHK</option>
              <option value="4BHK">4BHK</option>
            </select>
            <input
              className={styles.inputField}
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
              aria-label="Room price"
            />
            <input
              className={styles.inputField}
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
              aria-label="Room location"
            />
            <input
              className={styles.inputField}
              type="text"
              name="contactNo"
              placeholder="Contact No."
              value={formData.contactNo}
              onChange={handleChange}
              required
              aria-label="Contact number"
            />
            <select
              className={styles.inputField}
              name="forroom"
              value={formData.forroom}
              onChange={handleChange}
              required
              aria-label="Room for"
            >
              <option value="" disabled>Select Room For</option>
              <option value="For Girls">For Girls</option>
              <option value="For Girl">For Girl</option>
              <option value="For Boys">For Boys</option>
              <option value="For Boy">For Boy</option>
              <option value="For Other">For Other</option>
            </select>
            <label className={styles.checkboxLabel}>
              Availability:
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
                className={styles.checkbox}
                aria-label="Room availability"
              />
            </label>
            <input
              className={styles.fileInput}
              type="file"
              name="images"
              accept="image/*"
              onChange={handleChange}
              multiple
              aria-label="Upload room images"
            />
            {formData.images.length > 0 && typeof formData.images[0] === 'string' && (
              <div className={styles.thumbnailContainer}>
                <p>Current Images:</p>
                {formData.images.map((img, index) => (
                  <img
                    key={index}
                    src={`http://127.0.0.1:8000/${img}`}
                    alt={`Thumbnail ${index + 1}`}
                    className={styles.thumbnail}
                  />
                ))}
              </div>
            )}
            <div className={styles.formButtons}>
              <button type="submit" className={styles.submitButton}>
                Save Changes
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
              >
                Delete Room
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setSelectedRoom(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className={styles.footer}>
        © 2025 ClusterView. All rights reserved.
      </footer>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${modalType === 'error' ? styles.modalError : modalType === 'success' ? styles.modalSuccess : ''}`}>
            <p>{modalMessage}</p>
            {modalType === 'confirm' ? (
              <div className={styles.modalButtonContainer}>
                <button className={styles.modalButton} onClick={handleConfirmDelete}>
                  OK
                </button>
                <button
                  className={`${styles.modalButton} ${styles.cancelButton}`}
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button className={styles.modalButton} onClick={closeModal}>
                OK
              </button>
            )}
          </div>
        </div>
      )}

      {isImageModalOpen && (
        <div className={styles.imageModal}>
          <div className={styles.imageModalContent}>
            <button
              className={styles.closeModal}
              onClick={closeImageModal}
              aria-label="Close image modal"
            >
              ×
            </button>
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

export default AdminRooms;