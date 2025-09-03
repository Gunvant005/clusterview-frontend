import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FoodCart.module.css";

const FoodCart = () => {
  const [savedFoods, setSavedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedFoods = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          setError("You must be logged in to view saved foods.");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://127.0.0.1:8000/get-saved-foods?email=${userEmail}`);
        if (!res.ok) {
          throw new Error("Failed to fetch saved foods");
        }
        const data = await res.json();
        setSavedFoods(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSavedFoods();
  }, []);

  const handleUnsaveFood = async (foodId) => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("You must be logged in to unsave food items.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/unsave-food", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, foodId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to unsave food");
      }

      // Refresh the list by refetching saved foods
      const res = await fetch(`http://127.0.0.1:8000/get-saved-foods?email=${userEmail}`);
      const data = await res.json();
      setSavedFoods(data);
      alert(result.message);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const calculateTotal = () => {
    return savedFoods.reduce((acc, item) => acc + parseFloat(item.food.price), 0).toFixed(2);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.foodCartContainer}>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className={styles.foodCartContainer}>
      <h1>Your Saved Foods</h1>
      {savedFoods.length > 0 ? (
        <div className={styles.foodGrid}>
          {savedFoods.map((item, index) => (
            <div key={index} className={styles.foodCard}>
              {item.food.image.length > 0 && (
                <img
                  src={`http://127.0.0.1:8000/${item.food.image[0]}`}
                  alt={item.food.foodname}
                  className={styles.foodImage}
                />
              )}
              <div className={styles.foodDetails}>
                <h3 className={styles.shopName}>{item.food.shopname}</h3>
                <p className={styles.foodName}>{item.food.foodname}</p>
                <p><strong>Price:</strong> ₹{item.food.price}</p>
                <p><strong>Category:</strong> {item.food.category}</p>
                <p><strong>Address:</strong> {item.food.address}</p>
                <button
                  className={styles.unsaveButton}
                  onClick={() => handleUnsaveFood(item.food._id)}
                >
                  Unsave
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No saved food items found.</p>
      )}
      <button className={styles.backButton} onClick={() => navigate("/search-food")}>
        Back to Search
      </button>

      {savedFoods.length > 0 && (
        <>
          <button className={styles.billButton} onClick={() => setShowBill(true)}>
            Generate Bill
          </button>

          {showBill && (
            <div className={styles.billSection}>
              <h2>Food Bill Summary</h2>
              <table className={styles.billTable}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Shop</th>
                    <th>Category</th>
                    <th>Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {savedFoods.map((item, index) => (
                    <tr key={index}>
                      <td>{item.food.foodname}</td>
                      <td>{item.food.shopname}</td>
                      <td>{item.food.category}</td>
                      <td>{item.food.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3"><strong>Total</strong></td>
                    <td><strong>₹{calculateTotal()}</strong></td>
                  </tr>
                </tfoot>
              </table>
              <button className={styles.printButton} onClick={handlePrint}>
                Print Bill
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FoodCart;  