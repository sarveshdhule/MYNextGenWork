import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Button, TextField, Typography, Box, Alert, Paper } from '@mui/material';

const RequestForm = ({ opportunityId, onRequestAdded }) => {
  const { token } = useContext(AuthContext);
  const [description, setDescription] = useState('');
  const [resume, setResume] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!description.trim()) {
      setError('Please provide a description for your request.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('description', description);
      if (resume) {
        formData.append('resume', resume);
      }

      const res = await fetch(`http://localhost:5000/api/requests/${opportunityId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send request');
      setSuccess('Request sent!');
      setDescription('');
      setResume(null);
      if (onRequestAdded) onRequestAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" mb={2}>Request this Opportunity</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Request Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
          required
          sx={{ mb: 2 }}
        />
        
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResume(e.target.files[0])}
          style={{ marginBottom: 16 }}
        />
        
        <Button type="submit" variant="contained" color="primary">
          Send Request
        </Button>
      </form>
    </Paper>
  );
};

export default RequestForm;