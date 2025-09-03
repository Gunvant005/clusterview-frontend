import React, { useState } from 'react';
import './BlankPage.css';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaQuestionCircle } from 'react-icons/fa'; // Removed FaSun, FaMoon

// Import images from the Assets folder
import searchJobImage from '../Assets/search_job.png';
import searchFoodImage from '../Assets/search_food.png';
import searchRoomImage from '../Assets/search_room.png';
import insertJobImage from '../Assets/insert_job.png';
import insertFoodImage from '../Assets/insert_food.png';
import insertRoomImage from '../Assets/insert_room.png';

const BlankPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleLogout = () => {
    setShowPopup(false);
    navigate('/');
  };

  const handleHelpClick = () => {
    navigate('/Help'); // Navigate to Contact Us page
  };

  return (
    <div className="blank-page-container">
      <header className="blank-page-header">
        <h1>Home</h1>
        <div className="header-buttons">
          <button className="help-button" onClick={handleHelpClick} title="Help">
            <FaQuestionCircle />
          </button>
          <button className="menu-button" onClick={toggleMenu}>
            <FaBars />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="dropdown-menu">
          <button onClick={() => navigate('/profile')}>Profile</button>
          <button onClick={togglePopup}>Logout</button>
        </div>
      )}

      <main className="blank-page-main">
        <div className="button-grid">
          <button className="dashboard-button" onClick={() => navigate('/search-job')}>
            <img src={searchJobImage} alt="Search Job" className="button-icon" />
            Search Job
          </button>
          <button className="dashboard-button" onClick={() => navigate('/search-food')}>
            <img src={searchFoodImage} alt="Search Food" className="button-icon" />
            Search Food
          </button>
          <button className="dashboard-button" onClick={() => navigate('/search-room')}>
            <img src={searchRoomImage} alt="Search Room" className="button-icon" />
            Search Room
          </button>
          <button className="dashboard-button" onClick={() => navigate('/insert-job')}>
            <img src={insertJobImage} alt="Insert Job" className="button-icon" />
            Insert Job
          </button>
          <button className="dashboard-button" onClick={() => navigate('/insert-food')}>
            <img src={insertFoodImage} alt="Insert Food" className="button-icon" />
            Insert Food
          </button>
          <button className="dashboard-button" onClick={() => navigate('/insert-room')}>
            <img src={insertRoomImage} alt="Insert Room" className="button-icon" />
            Insert Room
          </button>
        </div>
      </main>

      {showPopup && (
        <div className="custom-popup">
          <div className="popup-content">
            <p>Are you sure you want to logout?</p>
            <div className="popup-actions">
              <button className="popup-button confirm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button className="popup-button cancel" onClick={togglePopup}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="blank-page-footer">
        © 2025 ClusterView. All rights reserved.
      </footer>
    </div>
  );
};

export default BlankPage;