import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const OpportunityEditForm = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    contactInfo: '',
    externalLink: ''
  });
  const [logo, setLogo] = useState(null);
  const [pic, setPic] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/opportunities/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch');
        
        setOpportunity(data);
        setFormData({
          companyName: data.companyName || '',
          companyAddress: data.companyAddress || '',
          contactInfo: data.contactInfo || '',
          externalLink: data.externalLink || ''
        });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOpportunity();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (logo) {
        formDataToSend.append('logo', logo);
      }
      if (pic) {
        formDataToSend.append('pic', pic);
      }

      const res = await fetch(`http://localhost:5000/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update opportunity');
      
      navigate(`/opportunity/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handlePicChange = (e) => {
    setPic(e.target.files[0]);
  };

  // Helper to get logo URL or default
  const getLogoUrl = (opportunity) => {
    if (opportunity && opportunity.logo) {
      const filename = opportunity.logo.split(/[/\\]/).pop();
      return `http://localhost:5000/public/logos/${filename}`;
    }
    return '/public/pics/codelogo.png';
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!opportunity) return <Typography>Loading...</Typography>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, width: 500 }}>
        <Typography variant="h5" mb={2}>Edit Opportunity</Typography>
        
        {/* Current Logo Display */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <img
            src={getLogoUrl(opportunity)}
            alt="Current Logo"
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%', marginRight: 16 }}
            onError={e => { e.target.src = '/default-logo.png'; }}
          />
          <Box>
            <Typography variant="h6">{opportunity.companyName || 'N/A'}</Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Address:</strong> {opportunity.companyAddress || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Contact:</strong> {opportunity.contactInfo || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Opportunity Info */}
        <Typography variant="h6" mb={1}>
          {opportunity.title}
        </Typography>
        <Typography variant="body2" mb={2}>
          {opportunity.description}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={opportunity.title}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={opportunity.description}
            disabled
            multiline
            rows={4}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Domain"
            value={opportunity.domain}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            label="Tags"
            value={(opportunity.tags || []).join(', ')}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            label="Date"
            value={opportunity.date?.slice(0, 10)}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            label="Salary"
            value={opportunity.salary}
            disabled
            margin="normal"
          />
          <TextField
            fullWidth
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Company Address"
            name="companyAddress"
            value={formData.companyAddress}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contact Info"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            required
            margin="normal"
          />
          {/* Application Deadline for jobs */}
          {opportunity.type === 'job' && (
            <TextField
              fullWidth
              label="Application Deadline"
              name="applicationDeadline"
              type="datetime-local"
              value={formData.applicationDeadline || ''}
              onChange={handleChange}
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
              helperText="Last date and time to apply for this job."
            />
          )}
          <TextField
            fullWidth
            label="External Link"
            name="externalLink"
            value={formData.externalLink}
            onChange={handleChange}
            margin="normal"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            style={{ margin: '16px 0' }}
          />
          {/* Main Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handlePicChange}
            style={{ margin: '16px 0' }}
          />
          {(pic || opportunity.pic) && (
            <Box mb={2}>
              <Typography variant="body2">Image Preview:</Typography>
              <img
                src={pic ? URL.createObjectURL(pic) : `http://localhost:5000/public/pics/${(opportunity.pic || '').split(/[/\\]/).pop()}`}
                alt="Preview"
                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
              />
            </Box>
          )}
          <Box mt={2}>
            <Button type="submit" variant="contained" sx={{ mr: 1 }}>
              Update Opportunity
            </Button>
            <Button variant="outlined" onClick={() => navigate(`/opportunity/${id}`)}>
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default OpportunityEditForm;