import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jwtToken = params.get('token'); // This is the JWT from the backend

    if (jwtToken) {
      // Use the JWT to fetch the user profile
      fetch('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      })
      .then(res => res.json())
      .then(userData => {
        if (userData.message) { // Handle cases where token is valid but user fetch fails
          throw new Error(userData.message);
        }
        // Call login with the correct arguments
        login(userData, jwtToken);
        navigate('/');
      })
      .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <CircularProgress />
    </div>
  );
};

export default GoogleSuccess; 