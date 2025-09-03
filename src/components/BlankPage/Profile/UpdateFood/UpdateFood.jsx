import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UpdateFood.module.css';

const UpdateFood = () => {
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [formData, setFormData] = useState({
    foodname: '',
    shopname: '',
    description: '',
    price: '',
    category: '',
    address: '',
    images: [],
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoods = async () => {
      const email = localStorage.getItem('userEmail');
      const password = localStorage.getItem('userPassword');

      if (!email || !password) {
        setModalMessage('Please log in to view your food items.');
        setModalType('error');
        setShowModal(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/fetch-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Failed to fetch food data');
        const data = await response.json();
        setFoods(data);
      } catch (err) {
        setModalMessage('Error fetching food data: ' + err.message);
        setModalType('error');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setFormData({
      foodname: food.foodname || '',
      shopname: food.shopname,
      description: food.description,
      price: food.price,
      category: food.category,
      address: food.address,
      images: food.image || [],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: selectedFiles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodname || !formData.shopname || !formData.price) {
      setModalMessage('Please fill in all required fields.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      setModalMessage('Please log in to update food.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('foodId', selectedFood._id);
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
      const response = await fetch('http://127.0.0.1:8000/update-food', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      setModalMessage(data.error || 'Food updated successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
    } catch (err) {
      setModalMessage('Error updating food: ' + err.message);
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    setModalMessage('Are you sure you want to delete this food item?');
    setModalType('confirm');
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      setModalMessage('Please log in to delete a food item.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/delete-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: selectedFood._id, email, password }),
      });
      const data = await response.json();
      setModalMessage(data.error || 'Food item deleted successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
      if (!data.error) {
        setSelectedFood(null);
        setFoods(foods.filter((food) => food._id !== selectedFood._id));
      }
    } catch (err) {
      setModalMessage('Error deleting food item: ' + err.message);
      setModalType('error');
      setShowModal(true);
    }
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
    <div className={styles.foodWrapper}>
      <h1 className={styles.pageTitle}>Update Food Details</h1>

      {!selectedFood ? (
        <div className={styles.foodList}>
          <h2 className={styles.sectionTitle}>Select a Food Item to Update</h2>
          {foods.length > 0 ? (
            <ul className={styles.foodGrid}>
              {foods.map((food) => (
                <li
                  key={food._id}
                  className={styles.foodItem}
                  onClick={() => handleSelectFood(food)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectFood(food)}
                >
                  <div className={styles.foodItemContent}>
                    <h3>{food.foodname || 'Unnamed Food'}</h3>
                    <p>{food.shopname}</p>
                    {food.image && food.image[0] && (
                      <img
                        src={`http://127.0.0.1:8000/${food.image[0]}`}
                        alt={food.foodname}
                        className={styles.foodThumbnail}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noItems}>No food items available. Add one now!</p>
          )}
          <div className={styles.buttonGroup}>
            <button
              className={styles.insertButton}
              onClick={() => navigate('/insert-food')}
            >
              Add New Food
            </button>
            <button
              className={styles.backButton}
              onClick={() => navigate('/profile')}
            >
              Back to Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="foodname">Food Name *</label>
            <input
              id="foodname"
              type="text"
              name="foodname"
              value={formData.foodname}
              onChange={handleChange}
              className={styles.inputField}
              required
              aria-required="true"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="shopname">Shop Name *</label>
            <input
              id="shopname"
              type="text"
              name="shopname"
              value={formData.shopname}
              onChange={handleChange}
              className={styles.inputField}
              required
              aria-required="true"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textareaField}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price *</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={styles.inputField}
              required
              aria-required="true"
              min="0"
              step="0.01"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.selectField}
            >
              <option value="">Select a category</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="images">Images</label>
            <input
              id="images"
              type="file"
              name="images"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              className={styles.fileInput}
            />
            {formData.images.length > 0 && (
              <div className={styles.imagePreview}>
                <p>Preview:</p>
                {formData.images.map((img, index) => (
                  <div key={index} className={styles.imageWrapper}>
                    <img
                      src={
                        typeof img === 'string'
                          ? `http://127.0.0.1:8000/${img}`
                          : URL.createObjectURL(img)
                      }
                      alt={`Preview ${index + 1}`}
                      className={styles.thumbnail}
                    />
                  </div>
                ))}
              </div>
            )}
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
              Delete Food
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setSelectedFood(null)}
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
              modalType === 'error'
                ? styles.modalError
                : modalType === 'success'
                ? styles.modalSuccess
                : ''
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
                  onClick={() => setShowModal(false)}
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

export default UpdateFood;