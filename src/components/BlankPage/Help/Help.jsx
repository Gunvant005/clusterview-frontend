import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaComment } from 'react-icons/fa';
import styles from './Help.module.css';

const Help = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: localStorage.getItem('userEmail') || '', // Pre-fill email from localStorage
    query: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Show loading state
    try {
      const response = await fetch('http://127.0.0.1:8000/submit-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      setModalMessage(result.message || result.error);
      setShowModal(true);
      if (response.ok) {
        setFormData({ name: '', email: formData.email, query: '' }); // Reset form, keep email
      }
    } catch (error) {
      setModalMessage('Error: Could not connect to the server');
      setShowModal(true);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.contactUsContainer}>
      <header className={styles.contactUsHeader}>
        <button
          className={styles.backButton}
          onClick={() => navigate('/blank')}
          aria-label="Go back to home"
        >
          <FaArrowLeft />
        </button>
        <h1>Help Center</h1>
      </header>

      <main className={styles.contactUsMain}>
        <p>Have a question or need help? Submit your query below, and we'll get back to you soon!</p>
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <div className={styles.inputBox}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              aria-label="Your Name"
            />
            <FaUser className={styles.icon} />
          </div>
          <div className={styles.inputBox}>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              aria-label="Your Email"
            />
            <FaEnvelope className={styles.icon} />
          </div>
          <div className={`${styles.inputBox} ${styles.textareaBox}`}>
            <textarea
              name="query"
              placeholder="Write your query here..."
              value={formData.query}
              onChange={handleChange}
              required
              aria-label="Your Query"
            />
            <FaComment className={styles.icon} />
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Query'}
          </button>
        </form>
      </main>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{modalMessage}</h2>
            <button onClick={handleModalClose}>OK</button>
          </div>
        </div>
      )}

      <footer className={styles.contactUsFooter}>
        © 2025 ClusterView. All rights reserved.
      </footer>
    </div>
  );
};

export default Help;