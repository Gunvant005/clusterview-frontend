import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaArrowLeft } from 'react-icons/fa';
import styles from './Job.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', company: '', location: '', salary: '',
    vacancies: '', experience: '', skills: '', qualification: '',
    industryType: '', employmentType: '', education: '', contactEmail: '', logo: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('info');
  const navigate = useNavigate();

  const industryTypes = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Transportation', 'Hospitality', 'Media',
    'Energy', 'Agriculture', 'Government', 'Non-profit', 'Other',
  ];

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/fetch-all-jobs?email=Admin@gmail.com&password=123`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      company: job.company || '',
      location: job.location || '',
      salary: job.salary || '',
      vacancies: job.vacancies || '',
      experience: job.experience || '',
      skills: job.skills ? job.skills.join(', ') : '',
      qualification: job.qualification || '',
      industryType: job.industryType || '',
      employmentType: job.employmentType || '',
      education: job.education || '',
      contactEmail: job.contactEmail || '',
      logo: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, logo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(e.target.value);
    const filtered = jobs.filter(job =>
      [job.title, job.company, job.location, job.salary?.toString(), job.description,
       job.experience, job.skills?.join(', '), job.qualification, job.industryType,
       job.employmentType, job.education, job.contactEmail,
       job.userId?.username, job.userId?.email]
        .some(field => field?.toLowerCase().includes(query))
    );
    setFilteredJobs(query ? filtered : jobs);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredJobs(jobs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('jobId', selectedJob._id);
    formDataToSend.append('email', 'Admin@gmail.com');
    formDataToSend.append('password', '123');
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'logo' && value !== null && value !== '') {
        formDataToSend.append(key, value);
      }
    });
    if (formData.logo) formDataToSend.append('logo', formData.logo);

    try {
      const response = await fetch(`${API_URL}/update-job`, {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      setModalMessage(data.error || 'Job updated successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
      if (!data.error) fetchJobs();
    } catch (err) {
      setModalMessage('Update failed: ' + err.message);
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    setModalMessage('Are you sure you want to delete this job?');
    setModalType('confirm');
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/delete-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId: selectedJob._id, 
          email: 'Admin@gmail.com', 
          password: '123' 
        }),
      });
      const data = await response.json();
      setModalMessage(data.error || 'Job deleted successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
      if (!data.error) {
        setSelectedJob(null);
        fetchJobs();
      }
    } catch (err) {
      setModalMessage('Delete failed: ' + err.message);
      setModalType('error');
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (modalType === 'success') setSelectedJob(null);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/admin')}>
          <FaArrowLeft />
        </button>
        <h1>Manage Jobs</h1>
      </header>

      <main className={styles.main}>
        {!selectedJob ? (
          <>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button className={styles.clearButton} onClick={clearSearch}>
                  <FaTimes />
                </button>
              )}
              <FaSearch className={styles.searchIcon} />
            </div>

            {error ? (
              <div className={styles.errorContainer}>
                <p className={styles.error}>{error}</p>
                <button className={styles.retryButton} onClick={fetchJobs}>
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className={styles.loader}>
                <div className={styles.spinner}></div>
                Loading jobs...
              </div>
            ) : filteredJobs.length === 0 ? (
              <p className={styles.noJobs}>No jobs found.</p>
            ) : (
              <div className={styles.jobGrid}>
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className={styles.jobCard}
                    onClick={() => handleSelectJob(job)}
                  >
                    <div className={styles.jobCardContent}>
                      {job.logo && (
                        <img
                          src={`${API_URL}/${job.logo}`}
                          alt={`${job.company} logo`}
                          className={styles.jobImage}
                        />
                      )}
                      <div className={styles.jobDetails}>
                        <p><strong>{job.title}</strong></p>
                        <p><strong>Company:</strong> {job.company}</p>
                        <p><strong>Location:</strong> {job.location}</p>
                        <p><strong>Salary:</strong> ₹{job.salary}</p>
                        <p><strong>Posted by:</strong> {job.userId?.username || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            {/* ALL YOUR INPUT FIELDS - SAME AS BEFORE */}
            <input name="title" value={formData.title} onChange={handleChange} required className={styles.inputField} placeholder="Job Title" />
            <textarea name="description" value={formData.description} onChange={handleChange} required className={styles.textareaField} placeholder="Description" />
            <input name="company" value={formData.company} onChange={handleChange} required className={styles.inputField} placeholder="Company" />
            <input name="location" value={formData.location} onChange={handleChange} required className={styles.inputField} placeholder="Location" />
            <input name="salary" type="number" value={formData.salary} onChange={handleChange} required className={styles.inputField} placeholder="Salary" />
            <input name="vacancies" type="number" value={formData.vacancies} onChange={handleChange} required className={styles.inputField} placeholder="Vacancies" />
            <input name="experience" value={formData.experience} onChange={handleChange} required className={styles.inputField} placeholder="Experience" />
            <input name="skills" value={formData.skills} onChange={handleChange} required className={styles.inputField} placeholder="Skills (comma separated)" />
            <input name="qualification" value={formData.qualification} onChange={handleChange} required className={styles.inputField} placeholder="Qualification" />
            <select name="industryType" value={formData.industryType} onChange={handleChange} required className={styles.inputField}>
              <option value="">Industry Type</option>
              {industryTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select name="employmentType" value={formData.employmentType} onChange={handleChange} required className={styles.inputField}>
              <option value="">Employment Type</option>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
            </select>
            <select name="education" value={formData.education} onChange={handleChange} required className={styles.inputField}>
              <option value="">Education</option>
              <option>High School</option><option>Diploma</option><option>Bachelor's</option><option>Master's</option><option>PhD</option>
            </select>
            <input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} required className={styles.inputField} placeholder="Contact Email" />
            <input type="file" accept="image/*" onChange={handleChange} className={styles.fileInput} />

            {selectedJob.logo && !formData.logo && (
              <div className={styles.thumbnailContainer}>
                <p>Current Logo:</p>
                <img src={`${API_URL}/${selectedJob.logo}`} alt="Current" className={styles.thumbnail} />
              </div>
            )}

            <div className={styles.formButtons}>
              <button type="submit" className={styles.submitButton}>Save Changes</button>
              <button type="button" className={styles.deleteButton} onClick={handleDelete}>Delete Job</button>
              <button type="button" className={styles.cancelButton} onClick={() => setSelectedJob(null)}>Cancel</button>
            </div>
          </form>
        )}
      </main>

      <footer className={styles.footer}>
        © 2025 ClusterView. All rights reserved.
      </footer>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${modalType === 'error' ? styles.modalError : modalType === 'success' ? styles.modalSuccess : ''}`}>
            <p>{modalMessage}</p>
            {modalType === 'confirm' ? (
              <div className={styles.modalButtonContainer}>
                <button className={styles.modalButton} onClick={handleConfirmDelete}>Yes, Delete</button>
                <button className={`${styles.modalButton} ${styles.cancelButton}`} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            ) : (
              <button className={styles.modalButton} onClick={closeModal}>OK</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;