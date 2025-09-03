import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    favoriteAnimal: '',
    contactNumber: '', // Add this
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const email = localStorage.getItem('userEmail');
      const password = localStorage.getItem('userPassword');

      if (!email || !password) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/get-user-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setUser(data);
          setFormData({
            username: data.username,
            email: data.email,
            favoriteAnimal: data.favoriteAnimal,
            contactNumber: data.contactNumber || '',
          });
        }
      } catch (error) {
        setError('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactNumber' && !/^\d{0,10}$/.test(value)) {
      return; // Only allow up to 10 digits
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');
  
    if (!email || !password) {
      setError('User not logged in');
      return;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:8000/update-user-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username: formData.username,
          favoriteAnimal: formData.favoriteAnimal,
          contactNumber: formData.contactNumber, // Ensure this is included
        }),
      });
  
      const data = await response.json();
  
      if (data.error) {
        setError(data.error);
      } else {
        setUser(data.updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
        window.location.reload();
      }
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleModifyFood = () => {
    navigate('/update-food');
  };

  const handleModifyRoom = () => {
    navigate('/update-room');
  };

  const handleModifyJob = () => {
    navigate('/update-job');
  };

  if (loading) return <div className={styles.centerText}>Loading...</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <h1 className={styles.headerTitle}>Profile</h1>
        <button className={styles.backButton} onClick={() => navigate('/blank')}>
          Back
        </button>
      </div>

      <div className={styles.mainContent}>
        <h2 className={styles.mainContentTitle}>User Profile</h2>
        {error && <p className={`${styles.centerText} ${styles.errorText}`}>{error}</p>}

        {isEditing ? (
          <div className={styles.editForm}>
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={formData.username}
                className={styles.formInput}
                disabled
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                disabled
              />
            </label>
            <label>
              Favorite Animal:
              <input
                type="text"
                name="favoriteAnimal"
                value={formData.favoriteAnimal}
                onChange={handleChange}
                className={styles.formInput}
              />
            </label>
            <label>
              Contact Number:
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={styles.formInput}
                pattern="[0-9]{10}" // Restrict to exactly 10 digits
                title="Contact number must be exactly 10 digits" // Validation message
              />
            </label>
            <button className={styles.saveButton} onClick={handleSave}>
              Save Changes
            </button>
            <button className={styles.cancelButton} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        ) : user ? (
          <div>
            <table className={styles.profileTable}>
              <thead>
              <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Favorite Animal</th>
                  <th>Contact Number</th> {/* Add this */}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.favoriteAnimal}</td>
                  <td>{user.contactNumber || 'Not provided'}</td> {/* Add this */}
                </tr>
              </tbody>
            </table>
            <div className={styles.buttonGroup}>
              <button className={styles.editButton} onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
              <button className={styles.editButton} onClick={handleModifyFood}>
                Modify Food Details
              </button>
              <button className={styles.editButton} onClick={handleModifyRoom}>
                Modify Room Details
              </button>
              <button className={styles.editButton} onClick={handleModifyJob}>
                Modify Job Details
              </button>
            </div>
          </div>
        ) : (
          <p className={`${styles.centerText} ${styles.greyText}`}>No user details found.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;