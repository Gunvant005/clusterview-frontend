import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InsertJobPage.module.css';
import { FaArrowLeft } from "react-icons/fa";


const InsertJobPage = () => {
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
    contactEmail: '', // Add contactEmail to formData
  });
  const [logo, setLogo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

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
      setModalMessage('You must be logged in to insert a job.');
      setShowModal(true);
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    data.append('email', email);
    data.append('password', password);
    if (logo) {
      data.append('logo', logo);
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/insert-job', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setModalMessage(result.message || result.error);
      setShowModal(true);
    } catch (error) {
      setModalMessage('Error: ' + error.message);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/blank');
  };

  const industryTypes = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Transportation', 'Hospitality', 'Media',
    'Energy', 'Agriculture', 'Government', 'Non-profit', 'Other',
  ];

  return (
    <div className={styles.insertJobPageContainer}>
      <div className={styles.jobFormContainer}>
        <h1>Insert Job</h1>
        <form onSubmit={handleSubmit}>
          <input className={styles.jobInputField} type="text" name="title" placeholder="Job Title" onChange={handleChange} required />
          <textarea className={styles.jobTextareaField} name="description" placeholder="Job Description" onChange={handleChange} required />
          <input className={styles.jobInputField} type="text" name="company" placeholder="Company" onChange={handleChange} required />
          <input className={styles.jobInputField} type="text" name="location" placeholder="Location" onChange={handleChange} required />
          <div className={styles.salaryInputContainer}>
            <span className={styles.rupeeSymbol}>₹</span>
            <input className={styles.jobInputField} type="number" name="salary" placeholder="Salary in INR" onChange={handleChange} min="0" required />
          </div>
          <input className={styles.jobInputField} type="number" name="vacancies" placeholder="Number of Vacancies" onChange={handleChange} min="1" required />
          <input className={styles.jobInputField} type="text" name="experience" placeholder="Experience (e.g., 2-5 years)" onChange={handleChange} required />
          <input className={styles.jobInputField} type="text" name="skills" placeholder="Skills (comma-separated)" onChange={handleChange} required />
          <input className={styles.jobInputField} type="text" name="qualification" placeholder="Qualification" onChange={handleChange} required />
          <select className={styles.jobInputField} name="industryType" value={formData.industryType} onChange={handleChange} required>
            <option value="">Select Industry Type</option>
            {industryTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select className={styles.jobInputField} name="employmentType" onChange={handleChange} required>
            <option value="">Select Employment Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
          <select className={styles.jobInputField} name="education" onChange={handleChange} required>
            <option value="">Select Education</option>
            <option value="High School">High School</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Master's Degree">Master's Degree</option>
            <option value="PhD">PhD</option>
            <option value="Other">Other</option>
          </select>
          <input className={styles.jobInputField} type="file" name="logo" accept="image/*" onChange={handleFileChange} />
          <input 
            className={styles.jobInputField} 
            type="email" 
            name="contactEmail" 
            placeholder="Contact Email (e.g., example@gmail.com)" 
            onChange={handleChange} 
            required 
          /> {/* Add contactEmail input */}
          <button type="submit" className={styles.jobSubmitButton}>Submit</button>
        </form>
<button className={styles.backArrowButton} onClick={() => navigate("/blank")}>
               <FaArrowLeft />
        </button>      </div>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>{modalMessage}</p>
            <button className={styles.modalButton} onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsertJobPage;