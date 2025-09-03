import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaArrowLeft } from 'react-icons/fa';
import styles from './Job.module.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    vacancies: '',
    experience: '',
    skills: '',
    qualification: '',
    industryType: '',
    employmentType: '',
    education: '',
    contactEmail: '',
    logo: null,
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
      const response = await fetch('http://127.0.0.1:8000/fetch-all-jobs?email=Admin@gmail.com&password=123', {
        method: 'GET',
      });

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
    const filtered = jobs.filter(
      (job) =>
        (job.title && job.title.toLowerCase().includes(query)) ||
        (job.company && job.company.toLowerCase().includes(query)) ||
        (job.location && job.location.toLowerCase().includes(query)) ||
        (job.salary && job.salary.toString().includes(query)) ||
        (job.description && job.description.toLowerCase().includes(query)) ||
        (job.experience && job.experience.toLowerCase().includes(query)) ||
        (job.skills && job.skills.join(', ').toLowerCase().includes(query)) ||
        (job.qualification && job.qualification.toLowerCase().includes(query)) ||
        (job.industryType && job.industryType.toLowerCase().includes(query)) ||
        (job.employmentType && job.employmentType.toLowerCase().includes(query)) ||
        (job.education && job.education.toLowerCase().includes(query)) ||
        (job.contactEmail && job.contactEmail.toLowerCase().includes(query)) ||
        (job.userId?.username && job.userId.username.toLowerCase().includes(query)) ||
        (job.userId?.email && job.userId.email.toLowerCase().includes(query))
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
      if (key !== 'logo') {
        formDataToSend.append(key, value);
      }
    });
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/update-job', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      setModalMessage(data.error || 'Job updated successfully!');
      setModalType(data.error ? 'error' : 'success');
      setShowModal(true);
      if (!data.error) {
        fetchJobs();
      }
    } catch (err) {
      setModalMessage('Error updating job: ' + err.message);
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
      const response = await fetch('http://127.0.0.1:8000/delete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJob._id, email: 'Admin@gmail.com', password: '123' }),
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
      setModalMessage('Error deleting job: ' + err.message);
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setModalType('info');
  };

  const closeModal = () => {
    setShowModal(false);
    if (modalType === 'success') {
      setSelectedJob(null);
    }
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    fetchJobs();
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
        <h1>Manage Jobs</h1>
      </header>

      <main className={styles.main}>
        {!selectedJob ? (
          <>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by title, company, location, salary, etc..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search jobs"
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
                  aria-label="Retry fetching jobs"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className={styles.loader}>Loading...</div>
            ) : filteredJobs.length === 0 ? (
              <p className={styles.noJobs}>No jobs found.</p>
            ) : (
              <div className={styles.jobGrid}>
                {filteredJobs.map((job) => (
                  <div
                    className={styles.jobCard}
                    key={job._id}
                    onClick={() => handleSelectJob(job)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectJob(job)}
                  >
                    <div className={styles.jobCardContent}>
                      {job.logo && (
                        <img
                          src={`http://127.0.0.1:8000/${job.logo}`}
                          alt={`${job.company} logo`}
                          className={styles.jobImage}
                        />
                      )}
                      <div className={styles.jobDetails}>
                        <p><strong>Title:</strong> {job.title}</p>
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
                        <p><strong>Description:</strong> {job.description}</p>
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.formContainer}>
            <input
              className={styles.inputField}
              type="text"
              name="title"
              placeholder="Job Title"
              value={formData.title}
              onChange={handleChange}
              required
              aria-label="Job title"
            />
            <textarea
              className={styles.textareaField}
              name="description"
              placeholder="Job Description"
              value={formData.description}
              onChange={handleChange}
              required
              aria-label="Job description"
            />
            <input
              className={styles.inputField}
              type="text"
              name="company"
              placeholder="Company"
              value={formData.company}
              onChange={handleChange}
              required
              aria-label="Company name"
            />
            <input
              className={styles.inputField}
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
              aria-label="Job location"
            />
            <input
              className={styles.inputField}
              type="number"
              name="salary"
              placeholder="Salary in INR"
              value={formData.salary}
              onChange={handleChange}
              min="0"
              required
              aria-label="Job salary"
            />
            <input
              className={styles.inputField}
              type="number"
              name="vacancies"
              placeholder="Number of Vacancies"
              value={formData.vacancies}
              onChange={handleChange}
              min="1"
              required
              aria-label="Number of vacancies"
            />
            <input
              className={styles.inputField}
              type="text"
              name="experience"
              placeholder="Experience (e.g., 2-5 years)"
              value={formData.experience}
              onChange={handleChange}
              required
              aria-label="Experience required"
            />
            <input
              className={styles.inputField}
              type="text"
              name="skills"
              placeholder="Skills (comma-separated)"
              value={formData.skills}
              onChange={handleChange}
              required
              aria-label="Required skills"
            />
            <input
              className={styles.inputField}
              type="text"
              name="qualification"
              placeholder="Qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
              aria-label="Qualification required"
            />
            <select
              className={styles.inputField}
              name="industryType"
              value={formData.industryType}
              onChange={handleChange}
              required
              aria-label="Industry type"
            >
              <option value="">Select Industry Type</option>
              {industryTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              className={styles.inputField}
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              required
              aria-label="Employment type"
            >
              <option value="">Select Employment Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <select
              className={styles.inputField}
              name="education"
              value={formData.education}
              onChange={handleChange}
              required
              aria-label="Education required"
            >
              <option value="">Select Education</option>
              <option value="High School">High School</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
            <input
              className={styles.inputField}
              type="email"
              name="contactEmail"
              placeholder="Contact Email"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              aria-label="Contact email"
            />
            <input
              className={styles.fileInput}
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              aria-label="Upload company logo"
            />
            {selectedJob.logo && !formData.logo && (
              <div className={styles.thumbnailContainer}>
                <p>Current Logo:</p>
                <img
                  src={`http://127.0.0.1:8000/${selectedJob.logo}`}
                  alt="Current Logo"
                  className={styles.thumbnail}
                />
              </div>
            )}
            <div className={styles.formButtons}>
              <button type="submit" className={styles.submitButton}>
                Save Changes
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
              >
                Delete Job
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setSelectedJob(null)}
              >
                Cancel
              </button>
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
                <button className={styles.modalButton} onClick={handleConfirmDelete}>
                  OK
                </button>
                <button
                  className={`${styles.modalButton} ${styles.cancelButton}`}
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button className={styles.modalButton} onClick={closeModal}>
                OK
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;