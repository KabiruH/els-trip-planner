import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo account validation
      const validAccounts = {
        '001': { password: 'demo123', name: 'John Smith' },
        '002': { password: 'demo123', name: 'Sarah Johnson' }
      };

      const account = validAccounts[formData.driverId];
      
      if (!account || account.password !== formData.password) {
        throw new Error('Invalid Driver ID or password');
      }

      // Success - call parent's onLogin function
      onLogin({
        driverId: formData.driverId,
        name: account.name,
        isAuthenticated: true
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '500px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px',
      color: 'white'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '8px',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    subtitle: {
      fontSize: '1.25rem',
      opacity: '0.9',
      fontWeight: '300'
    },
    footer: {
      marginTop: '32px',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.875rem'
    },
    truckIcon: {
      fontSize: '4rem',
      marginBottom: '16px',
      display: 'block'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.truckIcon}>🚛</div>
          <h1 style={styles.title}>ELD Trip Planner</h1>
          <p style={styles.subtitle}>
            Smart route planning with HOS compliance
          </p>
        </div>

        <LoginForm 
          onLogin={handleLogin}
          loading={loading}
          error={error}
        />

        <div style={styles.footer}>
          <p>Professional Electronic Logging Device Solution</p>
          <p>© 2025 ELD Trip Planner</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;