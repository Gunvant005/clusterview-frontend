import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./FoodDetailsPage.module.css"; // Updated to CSS Module

const FoodDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { food, shopFoods } = location.state || {}; // Access food and shopFoods passed via state

  if (!food) {
    return <p>No food details available.</p>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* Fixed Header Section */}
      <div className={styles.fixedHeader}>
        {/* Back to Search Button */}
        <button
          className={styles.backButton}
          onClick={() => navigate("/search-food")}
        >
          ← Back to Search
        </button>

        {/* Header with Shop Name, Food Name, and Address */}
        <div className={styles.header}>
          <div className={styles.textInfo}>
            <h1>{food.shopname}</h1>
            {food.foodname && <h2>Food: {food.foodname}</h2>}
            <p>
              <strong>Address:</strong> {food.address}
            </p>
          </div>
          {food.image?.[0] && (
            <img
              src={`http://127.0.0.1:8000/${food.image[0]}`}
              alt={food.foodname}
              className={styles.headerImage}
            />
          )}
        </div>
      </div>

      {/* Food Details */}
      <div className={styles.details}>
        <h2>Food Details</h2>
        <p>
          <strong>Name:</strong> {food.foodname}
        </p>
        <p>
          <strong>Category:</strong> {food.category}
        </p>
        <p>
          <strong>Description:</strong> {food.description}
        </p>
        <p>
          <strong>Price:</strong>{" "}
          <span style={{ color: "green", fontWeight: "bold" }}>
            ₹{food.price}
          </span>
        </p>
      </div>

      {/* Shop's Available Foods */}
      <div className={styles.shopFoods}>
        <h2>Available Foods at {food.shopname}</h2>
        {shopFoods && shopFoods.length > 0 ? (
          <div className={styles.foodGrid}>
            {shopFoods.map((shopFood, index) => (
              <div key={index} className={styles.foodCard}>
                <h3>{shopFood.name}</h3>
                {shopFood.image?.[0] && (
                  <img
                    src={`http://127.0.0.1:8000/${shopFood.image[0]}`}
                    alt={shopFood.name}
                    className={styles.foodImage}
                  />
                )}
                <p>
                  <strong>Name:</strong> {shopFood.foodname}
                </p>
                <p>
                  <strong>Category:</strong> {shopFood.category}
                </p>
                <p>
                  <strong>Description:</strong> {shopFood.description}
                </p>
                <p>
                  <strong>Price:</strong>{" "}
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    ₹{shopFood.price}
                  </span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No other foods available from this shop.</p>
        )}
      </div>
    </div>
  );
};

export default FoodDetailsPage;