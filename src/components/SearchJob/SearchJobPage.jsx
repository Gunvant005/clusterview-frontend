import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsCartCheckFill, BsBookmarkPlusFill } from "react-icons/bs";
import styles from './SearchJobPage.module.css';
import { FaArrowLeft } from "react-icons/fa";

const SearchJobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchJobs = async (query = '') => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/search-job?query=${query}`);
      if (!response.ok) throw new Error(`Failed to fetch jobs, status: ${response.status}`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      alert('Error fetching jobs: ' + error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchJobs(e.target.value);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveJob = async (job) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        alert('You must be logged in to save jobs.');
        return;
      }
  
      const response = await fetch('http://127.0.0.1:8000/save-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          job,
        }),
      });
  
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save job');
      }
  
      alert(result.message);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  
  

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button className={styles.cartButton} onClick={() => navigate('/jobcart')}>
        <BsCartCheckFill />
        </button>
        <h1>Search Job</h1>
        <input
          type="text"
          placeholder="Search for jobs..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchBar}
        />
        <button className={styles.backArrowButton} onClick={() => navigate("/blank")}>
            <FaArrowLeft />
        </button>
      </div>

      <div className={styles.jobList}>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job._id} className={styles.jobCard}>
              <div className={styles.jobCardContent}>
                <div className={styles.saveButtonContainer}>
                  <button
                    className={styles.saveButton}
                    onClick={() => handleSaveJob(job)}
                  >
                    <BsBookmarkPlusFill />
                  </button>
                </div>

                <div className={styles.jobHeader}>
                  {job.logo && (
                    <img
                      src={`http://127.0.0.1:8000/${job.logo}`}
                      alt={`${job.company} logo`}
                      className={styles.jobLogo}
                    />
                  )}
                  <h2>{job.title}</h2>
                </div>
                <div className={styles.jobInfo}>
                  <p><strong>Company:</strong> {job.company}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Salary:</strong> ₹{job.salary}</p>
                  <p><strong>Vacancies:</strong> {job.vacancies}</p>
                  <p><strong>Experience:</strong> {job.experience}</p>
                  <p><strong>Skills:</strong> {job.skills.join(', ')}</p>
                  <p><strong>Qualification:</strong> {job.qualification}</p>
                  <p><strong>Industry Type:</strong> {job.industryType}</p>
                  <p><strong>Employment Type:</strong> {job.employmentType}</p>
                  <p><strong>Education:</strong> {job.education}</p>
                  <p><strong>Contact Email:</strong> {job.contactEmail}</p>                 
                  <p>{job.description}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchJobPage;