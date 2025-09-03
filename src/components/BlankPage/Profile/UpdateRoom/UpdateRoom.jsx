import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UpdateRoom.module.css';

const UpdateRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
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
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const email = localStorage.getItem('userEmail');
      const password = localStorage.getItem('userPassword');

      if (!email || !password) {
        setModalMessage('You must be logged in to view your rooms.');
        setModalType('error');
        setShowModal(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/fetch-rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Failed to fetch rooms');
        const data = await response.json();
        setRooms(data);
      } catch (err) {
        setModalMessage('Error fetching your rooms');
        setModalType('error');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      setModalMessage('You must be logged in to update a room.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    if (!/^\d{10}$/.test(formData.contactNo)) {
      setModalMessage('Contact number must be exactly 10 digits.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('roomId', selectedRoom._id);
    formDataToSend.append('email', email);
    formDataToSend.append('password', password);
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
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      setModalMessage('You must be logged in to delete a room.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/delete-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: selectedRoom._id, email, password }),
      });
      const data = await response.json();
      setModalMessage(data.error || 'Room deleted successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
      if (!data.error) {
        setSelectedRoom(null);
        setRooms(rooms.filter(room => room._id !== selectedRoom._id));
      }
    } catch (err) {
      setModalMessage('Error deleting room: ' + err.message);
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
    if (modalMessage.includes('successfully') && modalType !== 'confirm') {
      navigate('/profile');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.roomWrapper}>
      <h1 className={styles.pageTitle}>Modify Your Room Details</h1>

      {!selectedRoom ? (
        <div className={styles.roomList}>
          <h2 className={styles.sectionTitle}>Select a Room to Modify</h2>
          {rooms.length > 0 ? (
            <ul className={styles.roomGrid}>
              {rooms.map((room) => (
                <li
                  key={room._id}
                  className={styles.roomItem}
                  onClick={() => handleSelectRoom(room)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectRoom(room)}
                >
                  <div className={styles.roomItemContent}>
                    <h3>{room.roomType}</h3>
                    <p>{room.location}</p>
                    {room.images && room.images.length > 0 && (
                      <img
                        src={`http://127.0.0.1:8000/${room.images[0]}`}
                        alt={`${room.roomType} thumbnail`}
                        className={styles.roomThumbnail}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noItems}>You haven’t inserted any rooms yet.</p>
          )}
          <div className={styles.buttonGroup}>
            <button className={styles.insertButton} onClick={() => navigate('/insert-room')}>
              Insert New Room
            </button>
            <button className={styles.backButton} onClick={() => navigate('/profile')}>
              Back to Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="roomType">Room Type *</label>
            <select
              id="roomType"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              className={styles.inputField}
              required
            >
              <option value="" disabled>Select Room Type</option>
              <option value="PG">PG</option>
              <option value="1BHK">1BHK</option>
              <option value="2BHK">2BHK</option>
              <option value="3BHK">3BHK</option>
              <option value="4BHK">4BHK</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price (INR) *</label>
            <input
              id="price"
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className={styles.inputField}
              required
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="location">Location *</label>
            <input
              id="location"
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className={styles.inputField}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="contactNo">Contact Number (10 digits) *</label>
            <input
              id="contactNo"
              type="text"
              name="contactNo"
              placeholder="Contact No. (10 digits)"
              value={formData.contactNo}
              onChange={handleChange}
              className={styles.inputField}
              required
              pattern="\d{10}"
              title="Contact number must be exactly 10 digits."
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="forroom">Room For *</label>
            <select
              id="forroom"
              name="forroom"
              value={formData.forroom}
              onChange={handleChange}
              className={styles.inputField}
              required
            >
              <option value="" disabled>Select Room For</option>
              <option value="For Girls">For Girls</option>
              <option value="For Girl">For Girl</option>
              <option value="For Boys">For Boys</option>
              <option value="For Boy">For Boy</option>
              <option value="For Other">For Other</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              Availability:
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
                className={styles.checkbox}
              />
            </label>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="images">Room Images</label>
            {formData.images.length > 0 && typeof formData.images[0] === 'string' && (
              <div className={styles.imagePreview}>
                <p>Current Images:</p>
                {formData.images.map((img, index) => (
                  <img
                    key={index}
                    src={`http://127.0.0.1:8000/${img}`}
                    alt={`Room image ${index + 1}`}
                    className={styles.thumbnail}
                  />
                ))}
              </div>
            )}
            <input
              id="images"
              type="file"
              name="images"
              accept="image/*"
              onChange={handleChange}
              className={styles.fileInput}
              multiple
            />
          </div>
          <div className={styles.formActions}>
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

      {showModal && (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="modalTitle">
          <div
            className={`${styles.modalContent} ${
              modalType === 'error' ? styles.modalError : modalType === 'success' ? styles.modalSuccess : ''
            }`}
          >
            <h2 id="modalTitle" className={styles.modalTitle}>
              {modalType === 'confirm' ? 'Confirm Deletion' : modalType === 'error' ? 'Error' : 'Success'}
            </h2>
            <p>{modalMessage}</p>
            {modalType === 'confirm' ? (
              <div className={styles.modalButtonContainer}>
                <button
                  className={styles.modalButton}
                  onClick={handleConfirmDelete}
                  aria-label="Confirm deletion"
                >
                  Confirm
                </button>
                <button
                  className={`${styles.modalButton} ${styles.cancelButton}`}
                  onClick={handleCancelDelete}
                  aria-label="Cancel deletion"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className={styles.modalButton}
                onClick={closeModal}
                aria-label="Close modal"
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateRoom;