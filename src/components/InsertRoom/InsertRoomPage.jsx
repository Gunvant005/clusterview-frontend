import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InsertRoomPage.module.css';
import { FaArrowLeft } from "react-icons/fa";

const InsertRoomPage = () => {
  const [formData, setFormData] = useState({
    roomType: '',
    price: '',
    location: '',
    images: [],
    contactNo: '',
    forRoom: '',
    availability: true,
  });

  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
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

    if (!formData.roomType || !formData.price || !formData.location || !formData.contactNo || !formData.forRoom) {
      setPopupMessage('Please fill in all required fields.');
      setShowPopup(true);
      return;
    }

    if (formData.images.length === 0) {
      setPopupMessage('Please upload at least one image.');
      setShowPopup(true);
      return;
    }

    if (!/^\d{10}$/.test(formData.contactNo)) {
      setPopupMessage('Contact number must be exactly 10 digits.');
      setShowPopup(true);
      return;
    }

    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      setPopupMessage('You must be logged in to insert a room.');
      setShowPopup(true);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('email', email);
    formDataToSend.append('password', password);
    for (const key in formData) {
      if (key === 'images') {
        for (const file of formData[key]) {
          formDataToSend.append('images', file);
        }
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/insert-room', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to add room');
      }

      const result = await response.json();
      setPopupMessage(result.message || 'Room added successfully!');
      setShowPopup(true);
    } catch (error) {
      console.error('Error:', error);
      setPopupMessage(`Error: ${error.message}`);
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate('/blank');
  };

  return (
    <div className={styles.pageContainer}>
      <button className={styles.backArrowButton} onClick={() => navigate("/blank")}>
        <FaArrowLeft />
      </button>
      <h1>Insert Room</h1>
      <form onSubmit={handleSubmit}>
        <select className={styles.inputField} name="roomType" value={formData.roomType} onChange={handleChange} required>
          <option value="" disabled>
            Select Room Type
          </option>
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
        />
        <input
          className={styles.inputField}
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <input
          className={styles.inputField}
          type="file"
          name="images"
          accept="image/*"
          onChange={handleChange}
          multiple
          required
        />
        <input
          className={styles.inputField}
          type="text"
          name="contactNo"
          placeholder="Contact No. (10 digits)"
          value={formData.contactNo}
          onChange={handleChange}
          required
          pattern="\d{10}"
          title="Contact number must be exactly 10 digits."
        />
        <select className={styles.forRoom} name="forRoom" value={formData.forRoom} onChange={handleChange} required>
          <option value="" disabled>
            Select Room For
          </option>
          <option value="For Girls">For Girls</option>
          <option value="For Boys">For Boys</option>
          <option value="For Others">For Others</option>
        </select>

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

        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <p>{popupMessage}</p>
            <button onClick={closePopup}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsertRoomPage;