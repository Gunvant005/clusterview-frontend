import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaArrowLeft } from 'react-icons/fa';
import styles from './Food.module.css';

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [error, setError] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalImages, setModalImages] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchFoods = async () => {
    setLoading(true);
    setError(null);

    try {
     const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
     const response = await fetch(`${API_URL}/fetch-all-foods?email=Admin@gmail.com&password=123`, {   
           method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch foods');
      }

      const data = await response.json();
      setFoods(data);
      setFilteredFoods(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setFormData({
      foodname: food.foodname || '',
      shopname: food.shopname || '',
      description: food.description || '',
      price: food.price || '',
      category: food.category || '',
      address: food.address || '',
      images: food.image || [],
    });
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, images: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(e.target.value);
    const filtered = foods.filter(
      (food) =>
        (food.foodname && food.foodname.toLowerCase().includes(query)) ||
        (food.shopname && food.shopname.toLowerCase().includes(query)) ||
        (food.category && food.category.toLowerCase().includes(query)) ||
        (food.price && food.price.toString().includes(query)) ||
        (food.address && food.address.toLowerCase().includes(query)) ||
        (food.description && food.description.toLowerCase().includes(query))
    );
    setFilteredFoods(query ? filtered : foods);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredFoods(foods);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('foodId', selectedFood._id);
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
      const response = await fetch('http://127.0.0.1:8000/update-food', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      setModalMessage(data.error || 'Food updated successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
      if (!data.error) {
        fetchFoods();
      }
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
    try {
      const response = await fetch('http://127.0.0.1:8000/delete-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: selectedFood._id, email: 'Admin@gmail.com', password: '123' }),
      });
      const data = await response.json();
      setModalMessage(data.error || 'Food deleted successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
      if (!data.error) {
        setSelectedFood(null);
        fetchFoods();
      }
    } catch (err) {
      setModalMessage('Error deleting food: ' + err.message);
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
      setSelectedFood(null);
    }
  };

  const handleImageClick = (images) => {
    setModalImages(Array.isArray(images) ? images : [images]);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setModalImages([]);
    setIsImageModalOpen(false);
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    fetchFoods();
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
        <h1>Manage Foods</h1>
      </header>

      <main className={styles.main}>
        {!selectedFood ? (
          <>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by food name, shop, category, price, address..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search foods"
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
                  aria-label="Retry fetching foods"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className={styles.loader}>Loading...</div>
            ) : filteredFoods.length === 0 ? (
              <p className={styles.noFoods}>No foods found.</p>
            ) : (
              <div className={styles.foodGrid}>
                {filteredFoods.map((food) => (
                  <div
                    className={styles.foodCard}
                    key={food._id}
                    onClick={() => handleSelectFood(food)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectFood(food)}
                  >
                    <img
                      src={`http://127.0.0.1:8000/${food.image[0]}`}
                      alt={`${food.foodname} preview`}
                      className={styles.foodImage}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(food.image);
                      }}
                    />
                    <div className={styles.foodDetails}>
                      <p><strong>Food Name:</strong> {food.foodname}</p>
                      <p><strong>Shop Name:</strong> {food.shopname}</p>
                      <p><strong>Category:</strong> {food.category}</p>
                      <p><strong>Price:</strong> ₹{food.price}</p>
                      <p><strong>Address:</strong> {food.address}</p>
                      <p><strong>Description:</strong> {food.description}</p>
                      <p><strong>Inserted By:</strong> {food.userId?.username || 'Unknown'}</p>
                      <p><strong>Email:</strong> {food.userId?.email || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.formContainer}>
            <input
              className={styles.inputField}
              type="text"
              name="foodname"
              placeholder="Food Name"
              value={formData.foodname}
              onChange={handleChange}
              required
              aria-label="Food name"
            />
            <input
              className={styles.inputField}
              type="text"
              name="shopname"
              placeholder="Shop Name"
              value={formData.shopname}
              onChange={handleChange}
              required
              aria-label="Shop name"
            />
            <textarea
              className={styles.textareaField}
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              required
              aria-label="Food description"
            />
            <input
              className={styles.inputField}
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
              aria-label="Food price"
            />
            <select
              className={styles.inputField}
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              aria-label="Food category"
            >
              <option value="" disabled>Select Category</option>
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
              value={formData.address}
              onChange={handleChange}
              required
              aria-label="Shop address"
            />
            <input
              className={styles.fileInput}
              type="file"
              name="images"
              accept="image/*"
              onChange={handleChange}
              multiple
              aria-label="Upload food images"
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
                alt={`Food ${index + 1}`}
                className={styles.modalImage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;