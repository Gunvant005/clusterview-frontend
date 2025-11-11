import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaArrowLeft } from 'react-icons/fa';
import styles from './User.module.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/fetch-all-users?email=Admin@gmail.com&password=123`, {       
         method: 'GET',
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(e.target.value);
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.password.toLowerCase().includes(query) ||
        (user.favoriteAnimal && user.favoriteAnimal.toLowerCase().includes(query))
    );
    setFilteredUsers(query ? filtered : users);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredUsers(users);
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    fetchUsers();
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
        <h1>Users List</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by username, email, password, or favorite animal..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search users"
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
              aria-label="Retry fetching users"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <p className={styles.noUsers}>No users found.</p>
        ) : (
          <div className={styles.userGrid}>
            {filteredUsers.map((user) => (
              <div className={styles.userCard} key={user._id}>
                <div className={styles.userDetails}>
                  <p>
                    <strong>Username:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Password:</strong> {user.password}
                  </p>
                  <p>
                    <strong>Favorite Animal:</strong> {user.favoriteAnimal || 'Not specified'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        © 2025 ClusterView. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminUsers;