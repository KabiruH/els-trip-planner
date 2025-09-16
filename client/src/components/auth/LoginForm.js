// src/components/auth/LoginForm.js
import React, { useState } from 'react';

const LoginForm = ({ onLogin, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    email: '',  // Changed from driverId to email
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const styles = {
    formContainer: {
      padding: '32px',
      width: '100%',
      maxWidth: '400px',
      borderRadius: '12px',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1976d2',
      textAlign: 'center',
      marginBottom: '24px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    inputGroup: {
      marginBottom: '16px',
      position: 'relative'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#555',
      marginBottom: '8px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    input: {
      width: '100%',
      padding: '12px 16px 12px 48px',
      fontSize: '1rem',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#1976d2'
    },
    inputIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#1976d2',
      fontSize: '20px'
    },
    passwordToggle: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      background: 'none',
      border: 'none',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#666',
      fontSize: '18px'
    },
    loginButton: {
      width: '100%',
      padding: '12px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: 'white',
      background: loading ? '#ccc' : 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
      border: 'none',
      borderRadius: '8px',
      cursor: loading ? 'not-allowed' : 'pointer',
      marginTop: '16px',
      marginBottom: '16px',
      boxShadow: '0 3px 15px 2px rgba(255, 107, 53, .3)',
      transition: 'all 0.2s ease',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    loginButtonHover: {
      background: 'linear-gradient(45deg, #E55A2B 30%, #E8821A 90%)',
      boxShadow: '0 4px 20px 2px rgba(255, 107, 53, .4)',
      transform: 'translateY(-1px)'
    },
    errorAlert: {
      padding: '12px',
      backgroundColor: '#ffebee',
      color: '#c62828',
      border: '1px solid #ffcdd2',
      borderRadius: '8px',
      marginBottom: '16px',
      fontSize: '0.875rem'
    },
    demoInfo: {
      textAlign: 'center',
      marginTop: '16px'
    },
    demoText: {
      fontSize: '0.875rem',
      color: '#666',
      marginBottom: '4px'
    },
    demoAccounts: {
      fontSize: '0.875rem',
      color: '#1976d2',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.formContainer}>
      <form onSubmit={handleSubmit}>
        <h1 style={styles.title}>Driver Login</h1>

        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label} htmlFor="email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <span style={styles.inputIcon}>📧</span>
            <input
              style={styles.input}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="driver@company.com"
              required
              autoFocus
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label} htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              style={styles.input}
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              type="button"
              style={styles.passwordToggle}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          style={styles.loginButton}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = 'linear-gradient(45deg, #E55A2B 30%, #E8821A 90%)';
              e.target.style.boxShadow = '0 4px 20px 2px rgba(255, 107, 53, .4)';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.background = 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)';
              e.target.style.boxShadow = '0 3px 15px 2px rgba(255, 107, 53, .3)';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? 'Logging in...' : 'LOG IN'}
        </button>

        <div style={styles.demoInfo}>
          <div style={styles.demoText}>For testing, create an account first or</div>
          <div style={styles.demoAccounts}>use the register option</div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
