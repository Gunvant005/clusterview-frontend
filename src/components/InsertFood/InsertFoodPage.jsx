import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InsertFoodPage.module.css';
import { FaArrowLeft } from "react-icons/fa";

const InsertFoodPage = () => {
  const [formData, setFormData] = useState({
    foodname: '',
    shopname: '',
    price: '',
    category: '',
    address: '',
    description: '',
    images: [],
  });
  const [popupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'shopname') {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFormData({ ...formData, images: selectedFiles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      alert('You must be logged in to insert food.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('email', email);
    formDataToSend.append('password', password);
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'images') {
        formDataToSend.append(key, value);
      }
    });
    formData.images.forEach((image) => {
      formDataToSend.append('images', image);
    });

    try {
      const response = await fetch('http://127.0.0.1:8000/insert-food', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setPopupVisible(true);
      } else {
        const result = await response.json();
        alert(result.error || 'An error occurred');
      }
    } catch (error) {
      alert('Error: Could not connect to the server');
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
    navigate('/blank');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Insert Food</h1>
        <button className={styles.backArrowButton} onClick={() => navigate("/blank")}>
               <FaArrowLeft />
        </button>

      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          className={styles.inputField}
          type="text"
          name="foodname"
          placeholder="Food Name"
          onChange={handleChange}
          required
          aria-label="Food Name"
        />
        <input
          className={styles.inputField}
          type="text"
          name="shopname"
          placeholder="Shop Name"
          onChange={handleChange}
          required
          aria-label="Shop Name"
        />
        <input
          className={styles.inputField}
          type="number"
          name="price"
          placeholder="Price"
          onChange={handleChange}
          required
          aria-label="Price"
        />
        <select
          className={styles.selectField}
          name="category"
          onChange={handleChange}
          required
          aria-label="Category"
        >
          <option value="" disabled selected>
            Select a category
          </option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Non-Vegetarian">Non-Vegetarian</option>
          <option value="Vegan">Vegan</option>
          <option value="Dessert">Dessert</option>
        </select>
        <input
          className={styles.inputField}
          type="text"
          name="address"
          placeholder="Address"
          onChange={handleChange}
          required
          aria-label="Address"
        />
        <textarea
          className={styles.textareaField}
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
          aria-label="Description"
        />
        <input
          className={styles.fileInput}
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          multiple
          required
        />
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>

      {popupVisible && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2>Food Item Inserted Successfully!</h2>
            <button onClick={closePopup} className={styles.popupButton}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsertFoodPage;