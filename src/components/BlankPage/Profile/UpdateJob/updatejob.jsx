import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './updatejob.module.css';

const UpdateJob = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
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
  });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      const email = localStorage.getItem('userEmail');
      const password = localStorage.getItem('userPassword');

      if (!email || !password) {
        setModalMessage('You must be logged in to view your jobs.');
        setShowModal(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/search-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, query: '' }),
        });
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setModalMessage('Error fetching your jobs');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      salary: job.salary,
      vacancies: job.vacancies,
      experience: job.experience,
      skills: job.skills.join(', '),
      qualification: job.qualification,
      industryType: job.industryType,
      employmentType: job.employmentType,
      education: job.education,
      contactEmail: job.contactEmail || '',
    });
    setLogo(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      setModalMessage('You must be logged in to update a job.');
      setShowModal(true);
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    data.append('jobId', selectedJob?._id);
    data.append('email', email);
    data.append('password', password);
    if (logo) {
      data.append('logo', logo);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/update-job', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      setModalMessage(result.error || 'Job updated successfully!');
      setShowModal(true);
      if (!result.error) {
        setJobs(jobs.map(job => 
          job._id === selectedJob._id ? { ...job, ...formData, skills: formData.skills.split(','), logo: result.job.logo, contactEmail: formData.contactEmail } : job
        ));
      }
    } catch (err) {
      setModalMessage('Error updating job');
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    setModalMessage('Are you sure you want to delete this job?');
    setConfirmDelete(true);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      setModalMessage('You must be logged in to delete a job.');
      setShowModal(true);
      setConfirmDelete(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/delete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJob._id, email, password }),
      });
      const data = await response.json();
      setModalMessage(data.error || 'Job deleted successfully!');
      setShowModal(true);
      if (!data.error) {
        setSelectedJob(null);
        setJobs(jobs.filter(job => job._id !== selectedJob._id));
      }
    } catch (err) {
      setModalMessage('Error deleting job');
      setShowModal(true);
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setConfirmDelete(false);
  };

  const closeModal = () => {
    setShowModal(false);
    if (modalMessage.includes('successfully') && !confirmDelete) {
      navigate('/profile');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  const industryTypes = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Transportation', 'Hospitality', 'Media',
    'Energy', 'Agriculture', 'Government', 'Non-profit', 'Other',
  ];

  return (
    <div className={styles.jobWrapper}>
      <h1 className={styles.pageTitle}>Modify Your Job Details</h1>

      {!selectedJob ? (
        <div className={styles.jobList}>
          <h2 className={styles.sectionTitle}>Your Jobs</h2>
          {jobs.length > 0 ? (
            <ul className={styles.jobGrid}>
              {jobs.map((job) => (
                <li
                  key={job._id}
                  className={styles.jobItem}
                  onClick={() => handleSelectJob(job)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectJob(job)}
                >
                  <div className={styles.jobItemContent}>
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                    {job.logo && (
                      <img
                        src={`http://127.0.0.1:8000/${job.logo}`}
                        alt={`${job.company} logo`}
                        className={styles.jobThumbnail}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noItems}>You haven’t inserted any jobs yet.</p>
          )}
          <div className={styles.buttonGroup}>
            <button className={styles.insertButton} onClick={() => navigate('/insert-job')}>
              Insert New Job
            </button>
            <button className={styles.backButton} onClick={() => navigate('/profile')}>
              Back to Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Job Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.jobInputField}
              placeholder="Job Title"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.jobTextareaField}
              placeholder="Job Description"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="company">Company *</label>
            <input
              id="company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={styles.jobInputField}
              placeholder="Company"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="location">Location *</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={styles.jobInputField}
              placeholder="Location"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="salary">Salary (INR) *</label>
            <div className={styles.salaryInputContainer}>
              <span className={styles.rupeeSymbol}>₹</span>
              <input
                id="salary"
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className={styles.jobInputField}
                placeholder="Salary in INR"
                min="0"
                required
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="vacancies">Vacancies *</label>
            <input
              id="vacancies"
              type="number"
              name="vacancies"
              value={formData.vacancies}
              onChange={handleChange}
              className={styles.jobInputField}
              placeholder="Number of Vacancies"
              min="1"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="experience">Experience *</label>
            <input
              id="experience"
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className={styles.jobInputField}
              placeholder="Experience (e.g., 2-5 years)"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="skills">Skills (comma-separated) *</label>
            <input
              id="skills"
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className={styles.jobInputField}
              placeholder="Skills"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="qualification">Qualification *</label>
            <input
              id="qualification"
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className={styles.jobInputField}
              placeholder="Qualification"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="industryType">Industry Type *</label>
            <select
              id="industryType"
              name="industryType"
              value={formData.industryType}
              onChange={handleChange}
              className={styles.jobInputField}
              required
            >
              <option value="">Select Industry Type</option>
              {industryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="employmentType">Employment Type *</label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className={styles.jobInputField}
              required
            >
              <option value="">Select Employment Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="education">Education *</label>
            <select
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className={styles.jobInputField}
              required
            >
              <option value="">Select Education</option>
              <option value="High School">High School</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="contactEmail">Contact Email *</label>
            <input
              id="contactEmail"
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className={styles.jobInputField}
              placeholder="Contact Email (e.g., example@gmail.com)"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="logo">Company Logo</label>
            {selectedJob.logo && (
              <div className={styles.imagePreview}>
                <img
                  src={`http://127.0.0.1:8000/${selectedJob.logo}`}
                  alt="Current job logo"
                  className={styles.currentLogo}
                />
              </div>
            )}
            <input
              id="logo"
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.jobSubmitButton}>
              Save Changes
            </button>
            <button
              type="button"
              className={styles.jobDeleteButton}
              onClick={handleDelete}
            >
              Delete Job
            </button>
            <button
              type="button"
              className={styles.jobCancelButton}
              onClick={() => setSelectedJob(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {showModal && (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="modalTitle">
          <div
            className={`${styles.modalContent} ${
              confirmDelete ? '' : modalMessage.includes('Error') ? styles.modalError : styles.modalSuccess
            }`}
          >
            <h2 id="modalTitle" className={styles.modalTitle}>
              {confirmDelete ? 'Confirm Deletion' : modalMessage.includes('Error') ? 'Error' : 'Success'}
            </h2>
            <p>{modalMessage}</p>
            {confirmDelete ? (
              <div className={styles.modalButtonContainer}>
                <button
                  className={styles.modalButton}
                  onClick={handleConfirmDelete}
                  aria-label="Confirm deletion"
                >
                  Confirm
                </button>
                <button
                  className={`${styles.modalButton} ${styles.cancelButton}`}
                  onClick={handleCancelDelete}
                  aria-label="Cancel deletion"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className={styles.modalButton}
                onClick={closeModal}
                aria-label="Close modal"
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateJob;