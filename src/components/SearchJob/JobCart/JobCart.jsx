import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./JobCart.module.css";

const JobCart = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          setError("You must be logged in to view saved jobs.");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://127.0.0.1:8000/get-saved-jobs?email=${userEmail}`);
        if (!res.ok) {
          throw new Error("Failed to fetch saved jobs");
        }
        const data = await res.json();
        setSavedJobs(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleUnsaveJob = async (jobId) => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("You must be logged in to unsave jobs.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/unsave-job", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, jobId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to unsave job");
      }

      // Refresh the list by refetching saved jobs
      const res = await fetch(`http://127.0.0.1:8000/get-saved-jobs?email=${userEmail}`);
      const data = await res.json();
      setSavedJobs(data);
      alert(result.message);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.jobCartContainer}>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className={styles.jobCartContainer}>
      <h1>Your Saved Jobs</h1>
      {savedJobs.length > 0 ? (
        savedJobs.map((item, index) => (
          <div key={index} className={styles.jobCard}>
            <div className={styles.jobCardContent}>
              {item.job.logo && (
                <img
                  src={`http://127.0.0.1:8000/${item.job.logo}`}
                  alt={`${item.job.company} logo`}
                  className={styles.jobLogo}
                />
              )}
              <h2>{item.job.title}</h2>
              <p><strong>Company:</strong> {item.job.company}</p>
              <p><strong>Location:</strong> {item.job.location}</p>
              <p><strong>Salary:</strong> ₹{item.job.salary}</p>
              <p><strong>Description:</strong> {item.job.description}</p>
              <p><strong>Skills:</strong> {item.job.skills.join(", ")}</p>
              <p><strong>Qualification:</strong> {item.job.qualification}</p>
              <p><strong>Employment Type:</strong> {item.job.employmentType}</p>
              <button
                className={styles.unsaveButton}
                onClick={() => handleUnsaveJob(item.job._id)}
              >
                Unsave
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No saved jobs found.</p>
      )}
      <button className={styles.backButton} onClick={() => navigate("/search-job")}>
        Back to Search
      </button>
    </div>
  );
};

export default JobCart;