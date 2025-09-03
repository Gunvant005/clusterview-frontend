import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPowerOff } from "react-icons/fa"; // Import FaPowerOff icon
import styles from "./AdminPage.module.css";
import { FaUserCheck } from "react-icons/fa";

const AdminPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleLogout = () => {
    navigate("/"); // Redirect to home on logout
  };

  const handleJobsClick = () => {
    navigate("/admin/jobs"); // Navigate to AdminJobs
  };

  const handleRoomsClick = () => {
    navigate("/admin/rooms"); // Navigate to AdminRooms
  };

  const handleFoodsClick = () => {
    navigate("/admin/foods"); // Navigate to AdminFoods
  };

  const handleUsersClick = () => {
    navigate("/admin/users"); // Navigate to AdminUsers
  };

  const handleHelpClick = () => {
    navigate("/admin/help"); // Navigate to AdminHelp (new route)
  };

  return (
    <div className={styles.adminContainer}>
      {/* Top Bar with Menu */}
      <div className={styles.topBar}>
        Admin Panel
        <div className={styles.adminEmail}>
          <FaUserCheck className={styles.userIcon} />
          Admin@gmail.com
          <FaPowerOff className={styles.powerIcon} onClick={togglePopup} />
        </div>

        {menuOpen && (
          <div className={styles.dropdownMenu}>
            <div className={styles.menuItem} onClick={togglePopup}>Logout</div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className={styles.buttonContainer}>
        <button className={styles.adminButton} onClick={handleJobsClick}>Jobs</button>
        <button className={styles.adminButton} onClick={handleFoodsClick}>Foods</button>
        <button className={styles.adminButton} onClick={handleRoomsClick}>Rooms</button>
        <button className={styles.adminButton} onClick={handleUsersClick}>Users</button>
        <button className={styles.adminButton} onClick={handleHelpClick}>Help</button> {/* New Help Button */}
      </div>

      {/* Logout Confirmation Popup */}
      {showPopup && (
        <div className={styles.customPopup}>
          <div className={styles.popupContent}>
            <p>Are you sure you want to logout?</p>
            <div className={styles.popupActions}>
              <button className={styles.popupButton + ' ' + styles.confirm} onClick={handleLogout}>
                Yes, Logout
              </button>
              <button className={styles.popupButton + ' ' + styles.cancel} onClick={togglePopup}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={styles.AdminFooter}>
        © 2025 ClusterView. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminPage;