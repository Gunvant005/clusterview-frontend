import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsCartCheckFill, BsBookmarkPlusFill } from "react-icons/bs";
import styles from "./SearchFoodPage.module.css";
import { FaArrowLeft } from "react-icons/fa";

const SearchFoodPage = () => {
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      setError(null);

      const email = localStorage.getItem("userEmail");
      const password = localStorage.getItem("userPassword");

      if (!email || !password) {
        setError("You must be logged in to view food data.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/search-food", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch food data");
        }

        const data = await response.json();
        console.log("Fetched All Foods (SearchFoodPage):", data); // Debug: Check all foods
        setFoods(data);
      } catch (error) {
        console.error("Fetch Error:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  const filteredFoods = foods.filter((food) =>
    (food.foodname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (food.shopname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (food.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (food.address?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (food.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleFoodClick = (food) => {
    const shopFoods = foods.filter((item) => item.shopname === food.shopname);
    navigate("/food-details", { state: { food, shopFoods } });
  };

  const ImageSlideshow = ({ images, onClick }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }, [images.length]);

    return (
      <div className={styles.slideshowContainer} onClick={onClick}>
        <img
          src={`http://127.0.0.1:8000/${images[currentImageIndex]}`}
          alt={`Slide ${currentImageIndex + 1}`}
          className={styles.slideshowImage}
        />
      </div>
    );
  };

  const handleSaveFood = async (food) => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("You must be logged in to save food items.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/save-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          food,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save food");
      }

      alert(result.message);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button className={styles.cartButton} onClick={() => navigate("/foodcart")}>
          <BsCartCheckFill />
        </button>
        <button className={styles.backArrowButton} onClick={() => navigate("/blank")}>
            <FaArrowLeft />
        </button>
        <div className={styles.headerContent}>
          <h1>Search Food</h1>
          <input
            type="text"
            placeholder="Search for food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchBar}
          />
        </div>
      </header>
      <div className={styles.content}>
        {loading ? (
          <p>Loading food data...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.foodGrid}>
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <div key={food._id} className={styles.foodCard}>
                  {food.image.length > 0 && (
                    <ImageSlideshow
                      images={food.image}
                      onClick={() => handleFoodClick(food)}
                    />
                  )}
                  <div className={styles.foodDetails}>
                    <div className={styles.saveButtonContainer}>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleSaveFood(food)}
                      >
                        <BsBookmarkPlusFill />
                      </button>
                    </div>
                    <h3 className={styles.shopName}>{food.shopname}</h3>
                    <div className={styles.foodRow}>
                      <p className={styles.foodAddress}>{food.address}</p>
                      <p className={styles.foodName}>{food.foodname}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No food items match your search.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFoodPage;
