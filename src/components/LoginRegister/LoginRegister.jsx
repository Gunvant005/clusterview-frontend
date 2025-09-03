import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaDog, FaPhone, FaKey } from 'react-icons/fa';

const LoginRegister = () => {
  const [action, setAction] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    favoriteAnimal: '',
    contactNumber: '',
  });
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotData, setForgotData] = useState({
    email: '',
    favoriteAnimal: '',
  });
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);
  const [nextRoute, setNextRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactNumber' && !/^\d{0,10}$/.test(value)) {
      return;
    }
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
      setErrors({ ...errors, otp: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (action === ' active') {
      if (!formData.username) newErrors.username = 'Username is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (!formData.favoriteAnimal) newErrors.favoriteAnimal = 'Favorite animal is required';
      if (!/^\d{10}$/.test(formData.contactNumber))
        newErrors.contactNumber = 'Contact number must be 10 digits';
    } else if (forgotPassword) {
      if (!forgotData.email) newErrors.email = 'Email is required';
      if (!forgotData.favoriteAnimal) newErrors.favoriteAnimal = 'Favorite animal is required';
    } else {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerLink = () => {
    setAction(' active');
    setFormData({ username: '', email: '', password: '', favoriteAnimal: '', contactNumber: '' });
    setForgotPassword(false);
    setIsOtpSent(false);
    setOtp('');
    setErrors({});
  };

  const loginLink = () => {
    setAction('');
    setFormData({ username: '', email: '', password: '', favoriteAnimal: '', contactNumber: '' });
    setForgotPassword(false);
    setIsOtpSent(false);
    setOtp('');
    setErrors({});
  };

  const forgotPasswordLink = () => {
    setForgotPassword(true);
    setAction('');
    setIsOtpSent(false);
    setOtp('');
    setErrors({});
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotData),
      });
      const result = await response.json();
      if (result.password) {
        showModalWithMessage(`Your password is: ${result.password}`);
        setForgotPassword(false);
        setForgotData({ email: '', favoriteAnimal: '' });
      } else {
        showModalWithMessage(result.error);
      }
    } catch (error) {
      showModalWithMessage('Error: Could not connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const result = await response.json();
      if (response.ok) {
        setIsOtpSent(true);
        showModalWithMessage('OTP sent to your email');
      } else {
        showModalWithMessage(result.error);
      }
    } catch (error) {
      showModalWithMessage('Error: Could not connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ ...errors, otp: 'Please enter the OTP' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const result = await response.json();
      if (response.ok) {
        await handleRegister(e);
      } else {
        showModalWithMessage(result.error);
      }
    } catch (error) {
      showModalWithMessage('Error: Could not connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      showModalWithMessage(result.message || result.error);
      if (response.ok) {
        setAction('');
        setFormData({ username: '', email: '', password: '', favoriteAnimal: '', contactNumber: '' });
        setIsOtpSent(false);
        setOtp('');
      }
    } catch (error) {
      showModalWithMessage('Error: Could not connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    let route = '/blank';

    if (formData.email === 'Admin@gmail.com' && formData.password === '123') {
      route = '/admin';
    } else {
      try {
        const response = await fetch('http://127.0.0.1:8000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const result = await response.json();
        if (result.message === 'Login Successful') {
          localStorage.setItem('userEmail', formData.email);
          localStorage.setItem('userPassword', formData.password);
          setIsLoginSuccessful(true);
          showModalWithMessage(result.message);
        } else {
          setIsLoginSuccessful(false);
          showModalWithMessage(result.error);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        setIsLoginSuccessful(false);
        showModalWithMessage('Error: Could not connect to the server');
        setIsLoading(false);
        return;
      }
    }

    setIsLoginSuccessful(true);
    setNextRoute(route);
    showModalWithMessage('Login Successful');
    setIsLoading(false);
  };

  const showModalWithMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (isLoginSuccessful && nextRoute) {
      navigate(nextRoute);
    }
  };

  return (
    <>
       <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', 'Inter', 'Arial', sans-serif;
          }

          body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 3px; /* Further reduced padding */
            background: linear-gradient(45deg, #4a00e0, #8e2de2);
            animation: gradient 15s ease infinite;
            background-size: 200% 200%;
          }

          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @media (prefers-reduced-motion: reduce) {
            body {
              background: #f5f7fa;
              animation: none;
            }
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.3rem; /* Further reduced gap */
            margin-bottom: 0.8rem; /* Further reduced margin */
            padding: 0.4rem 0.8rem; /* Further reduced padding */
            border-radius: 8px; /* Slightly reduced */
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            transition: transform 0.4s ease;
          }

          .header img {
            width: clamp(50px, 35vw, 90px); /* Further reduced size */
            height: clamp(50px, 35vw, 90px);
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.3); /* Further reduced shadow */
            display: block;
          }

          .header h1 {
            font-size: clamp(0.9rem, 1.8vw, 1.3rem); /* Further reduced font size */
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 0.8px; /* Further reduced spacing */
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
          }

          .header:hover {
            transform: scale(1.03);
          }

          .wrapper {
            position: relative;
            width: clamp(260px, 80vw, 380px); /* Further reduced width */
            min-height: 420px; /* Further reduced height */
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px; /* Further reduced */
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Further reduced shadow */
            backdrop-filter: blur(10px);
            color: #1f2937;
            display: flex;
            align-items: center;
            overflow: hidden;
            transition: all 0.4s ease-in-out;
          }

          .wrapper:hover {
            transform: scale(1.02);
          }

          .wrapper.active {
            min-height: 540px; /* Further reduced height */
          }

          .wrapper .form-box {
            width: 100%;
            padding: clamp(15px, 3vw, 30px); /* Further reduced padding */
            opacity: 1;
            visibility: visible;
            transition: opacity 0.4s ease-in-out, visibility 0.4s ease-in-out;
          }

          .wrapper .form-box.hidden {
            opacity: 0;
            visibility: hidden;
            position: absolute;
            width: 0;
            height: 0;
            overflow: hidden;
          }

          .wrapper .form-box.login {
            transition: transform 0.4s ease-in-out;
            transform: translateX(0);
          }

          .wrapper.active .form-box.login {
            transform: translateX(-100vw);
          }

          .wrapper .form-box.register {
            position: absolute;
            transition: none;
            transform: translateX(100vw);
          }

          .wrapper.active .form-box.register {
            transition: transform 0.4s ease-in-out;
            transform: translateX(0);
            position: relative;
          }

          form h1 {
            font-size: clamp(1.3rem, 3.5vw, 1.8rem); /* Further reduced font size */
            text-align: center;
            color: #1f2937;
            margin-bottom: clamp(8px, 1vw, 12px); /* Further reduced margin */
            opacity: 1;
          }

          form .input-box {
            position: relative;
            width: 100%;
            height: clamp(38px, 7vw, 48px); /* Further reduced height */
            margin: clamp(8px, 1.5vw, 12px) 0; /* Further reduced margin */
            border: 1px solid #d1d5db;
            border-radius: 5px; /* Further reduced */
            background: #f9fafb;
            transition: border-color 0.3s ease;
          }

          .input-box input {
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
            outline: none;
            font-size: clamp(0.85rem, 1.8vw, 0.95rem); /* Further reduced font size */
            color: #1f2937;
            padding: clamp(6px, 1vw, 10px) clamp(25px, 3vw, 35px) clamp(6px, 1vw, 10px) clamp(10px, 1vw, 12px); /* Further reduced padding */
          }

          .input-box input:focus {
            border-color: #4a00e0;
          }

          .input-box input::placeholder {
            color: #6b7280;
          }

          .input-box .icon {
            position: absolute;
            right: clamp(8px, 1vw, 10px); /* Further reduced */
            top: 50%;
            transform: translateY(-50%);
            font-size: clamp(0.85rem, 1.8vw, 1rem); /* Further reduced size */
            color: #4a00e0;
          }

          form .remember-forgot {
            display: flex;
            justify-content: space-between;
            font-size: clamp(0.75rem, 1.5vw, 0.85rem); /* Further reduced font size */
            margin: 0 0 8px; /* Further reduced margin */
            flex-wrap: wrap;
            gap: 5px; /* Further reduced gap */
          }

          .remember-forgot label input {
            accent-color: #4a00e0;
            margin-right: 4px; /* Further reduced margin */
          }

          .remember-forgot button {
            color: #4a00e0;
            text-decoration: none;
            font-weight: 600;
            background: none;
            border: none;
            cursor: pointer;
            transition: color 0.3s ease;
          }

          .remember-forgot button:hover {
            color: #8e2de2;
            text-decoration: underline;
          }

          form button {
            width: 100%;
            height: clamp(32px, 6vw, 42px); /* Further reduced height */
            background: linear-gradient(45deg, #4a00e0, #8e2de2);
            border: none;
            outline: none;
            border-radius: 5px; /* Further reduced */
            box-shadow: 0 2px 8px rgba(74, 0, 224, 0.3); /* Further reduced shadow */
            cursor: pointer;
            font-size: clamp(0.85rem, 1.8vw, 0.95rem); /* Further reduced font size */
            color: #ffffff;
            font-weight: 600;
            margin-top: clamp(8px, 1vw, 12px); /* Further reduced margin */
            transition: all 0.3s ease;
          }

          form button:disabled {
            background: #d1d5db;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          form button:hover:not(:disabled) {
            background: linear-gradient(45deg, #5b0eff, #a044ff);
            transform: scale(1.05);
          }

          form .register-link {
            font-size: clamp(0.75rem, 1.5vw, 0.85rem); /* Further reduced font size */
            text-align: center;
            margin: clamp(8px, 1vw, 12px) 0 clamp(4px, 0.8vw, 8px); /* Further reduced margin */
            opacity: 1;
            visibility: visible;
          }

          .register-link p button {
            color: #4a00e0;
            text-decoration: none;
            font-weight: 600;
            background: none;
            border: none;
            cursor: pointer;
            transition: color 0.3s ease;
          }

          .register-link p button:hover {
            color: #8e2de2;
            text-decoration: underline;
          }

          .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: rgba(255, 255, 255, 0.95);
            padding: clamp(12px, 2vw, 18px); /* Further reduced padding */
            border-radius: 8px; /* Further reduced */
            border: 1px solid #4a00e0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* Further reduced shadow */
            backdrop-filter: blur(10px);
            z-index: 1001;
            width: clamp(160px, 80vw, 300px); /* Further reduced width */
            text-align: center;
            animation: modalEnter 0.3s ease forwards;
          }

          @keyframes modalEnter {
            from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }

          .modal h2 {
            font-size: clamp(0.9rem, 2vw, 1.2rem); /* Further reduced font size */
            color: #1f2937;
            margin-bottom: clamp(6px, 1vw, 10px); /* Further reduced margin */
          }

          .modal button {
            margin-top: clamp(8px, 1vw, 12px); /* Further reduced margin */
            padding: clamp(6px, 1vw, 8px) clamp(12px, 2vw, 18px); /* Further reduced padding */
            background: linear-gradient(45deg, #4a00e0, #8e2de2);
            color: #ffffff;
            border: none;
            border-radius: 5px; /* Further reduced */
            cursor: pointer;
            font-size: clamp(0.8rem, 1.5vw, 0.95rem); /* Further reduced font size */
            font-weight: 600;
            transition: all 0.3s ease;
          }

          .modal button:hover {
            background: linear-gradient(45deg, #5b0eff, #a044ff);
            transform: scale(1.05);
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 1000;
          }

          .error-message {
            color: #dc2626;
            font-size: clamp(0.7rem, 1.5vw, 0.8rem); /* Further reduced font size */
            margin-top: 3px; /* Further reduced margin */
            text-align: left;
          }

          .input-box input:focus-visible,
          form button:focus-visible,
          .remember-forgot button:focus-visible,
          .register-link button:focus-visible,
          .modal button:focus-visible {
            outline: 2px solid #4a00e0;
            outline-offset: 2px;
          }

          @media (max-width: 768px) {
            .wrapper {
              min-height: 400px; /* Further reduced height */
            }

            .wrapper.active {
              min-height: 520px; /* Further reduced height */
            }

            .header {
              flex-direction: column;
              gap: 0.3rem; /* Further reduced gap */
            }

            .remember-forgot {
              flex-direction: column;
              align-items: flex-start;
            }

            form .input-box {
              margin: clamp(6px, 1vw, 10px) 0; /* Further reduced margin */
            }
          }

          @media (max-width: 480px) {
            .wrapper {
              min-height: 380px; /* Further reduced height */
            }

            .wrapper.active {
              min-height: 500px; /* Further reduced height */
            }

            form h1 {
              font-size: clamp(1.2rem, 3vw, 1.5rem); /* Further reduced font size */
            }

            .input-box input {
              padding: 6px 20px 6px 10px; /* Further reduced padding */
            }

            form button {
              height: 32px; /* Further reduced height */
            }

            form .input-box {
              margin: clamp(6px, 1vw, 10px) 0; /* Further reduced margin */
            }
          }
        `}
      </style>



      <div className="header">
        <img
          src="/logo.png"
          alt="ClusterView Logo"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/100?text=Logo')} /* Adjusted fallback size */
        />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{modalMessage}</h2>
            <button onClick={handleModalClose} aria-label="Close Modal">
              OK
            </button>
          </div>
        </div>
      )}

      <div className={`wrapper${action}`}>
        {forgotPassword ? (
          <div className="form-box forgot-password">
            <form onSubmit={handleForgotPassword}>
              <h1>Forgot Password</h1>
              <div className="input-box">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={forgotData.email}
                  onChange={handleForgotChange}
                  required
                  aria-label="Email Address"
                />
                <FaEnvelope className="icon" />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              <div className="input-box">
                <input
                  type="text"
                  name="favoriteAnimal"
                  placeholder="Your Favorite Animal"
                  value={forgotData.favoriteAnimal}
                  onChange={handleForgotChange}
                  required
                  aria-label="Favorite Animal"
                />
                <FaDog className="icon" />
                {errors.favoriteAnimal && <div className="error-message">{errors.favoriteAnimal}</div>}
              </div>
              <button type="submit" disabled={isLoading} aria-label="Retrieve Password">
                {isLoading ? 'Loading...' : 'Retrieve Password'}
              </button>
              <div className="register-link">
                <p>
                  Back to{' '}
                  <button type="button" onClick={loginLink} aria-label="Back to Login">
                    Login
                  </button>
                </p>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className={`form-box login${action === '' ? '' : ' hidden'}`}>
              <form onSubmit={handleLogin}>
                <h1>Login</h1>
                <div className="input-box">
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    aria-label="Email Address"
                  />
                  <FaEnvelope className="icon" />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="input-box">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    aria-label="Password"
                  />
                  <FaLock className="icon" />
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                <div className="remember-forgot">
                  <button type="button" onClick={forgotPasswordLink} aria-label="Forgot Password">
                    Forgot password?
                  </button>
                </div>
                <button type="submit" disabled={isLoading} aria-label="Login">
                  {isLoading ? 'Loading...' : 'Login'}
                </button>
                <div className="register-link">
                  <p>
                    Don't have an account?{' '}
                    <button type="button" onClick={registerLink} aria-label="Register">
                      Register
                    </button>
                  </p>
                </div>
              </form>
            </div>

            <div className={`form-box register${action === ' active' ? '' : ' hidden'}`}>
              <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
                <h1>Registration</h1>
                <div className="input-box">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isOtpSent}
                    aria-label="Username"
                  />
                  <FaUser className="icon" />
                  {errors.username && <div className="error-message">{errors.username}</div>}
                </div>
                <div className="input-box">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isOtpSent}
                    aria-label="Email Address"
                  />
                  <FaEnvelope className="icon" />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="input-box">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isOtpSent}
                    aria-label="Password"
                  />
                  <FaLock className="icon" />
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                <div className="input-box">
                  <input
                    type="text"
                    name="favoriteAnimal"
                    placeholder="Favorite Animal?"
                    value={formData.favoriteAnimal}
                    onChange={handleChange}
                    required
                    disabled={isOtpSent}
                    aria-label="Favorite Animal"
                  />
                  <FaDog className="icon" />
                  {errors.favoriteAnimal && <div className="error-message">{errors.favoriteAnimal}</div>}
                </div>
                <div className="input-box">
                  <input
                    type="tel"
                    name="contactNumber"
                    placeholder="Contact Number"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    title="Contact number must be exactly 10 digits"
                    required
                    disabled={isOtpSent}
                    aria-label="Contact Number"
                  />
                  <FaPhone className="icon" />
                  {errors.contactNumber && <div className="error-message">{errors.contactNumber}</div>}
                </div>
                {isOtpSent && (
                  <div className="input-box">
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={handleOtpChange}
                      required
                      aria-label="OTP"
                    />
                    <FaKey className="icon" />
                    {errors.otp && <div className="error-message">{errors.otp}</div>}
                  </div>
                )}
                <div className="remember-forgot">
                  <label>
                    <input type="checkbox" required aria-label="Agree to terms and conditions" />
                    I agree to the terms & conditions
                  </label>
                </div>
                <button type="submit" disabled={isLoading} aria-label={isOtpSent ? 'Verify OTP' : 'Send OTP'}>
                  {isLoading ? 'Loading...' : isOtpSent ? 'Verify OTP' : 'Send OTP'}
                </button>
                <div className="register-link">
                  <p>
                    Already have an account?{' '}
                    <button type="button" onClick={loginLink} aria-label="Login">
                      Login
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LoginRegister;