import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const OpportunityForm = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'job',
    jobType: 'full-time',
    title: '',
    description: '',
    domain: '',
    tags: '',
    date: '',
    externalLink: '',
    salary: '',
    companyName: '',
    companyAddress: '',
    contactInfo: '',
    organizer: '',
    prize: '',
    speaker: '',
    platform: '',
    registrationFee: 0,
    contestDateTime: '',
    webinarDateTime: '',
    applicationDeadline: ''
  });
  const [logo, setLogo] = useState(null);
  const [pic, setPic] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      const dataToSend = { ...formData };
      if (dataToSend.type === 'contest') {
        dataToSend.registrationFee = Number(dataToSend.registrationFee) || 0;
      }
      Object.keys(dataToSend).forEach(key => {
        formDataToSend.append(key, dataToSend[key]);
      });
      if (logo) {
        formDataToSend.append('logo', logo);
      }
      if (pic) {
        formDataToSend.append('pic', pic);
      }

      const res = await fetch('http://localhost:5000/api/opportunities', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add opportunity');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' && value !== 'job' ? { jobType: '' } : {})
    }));
  };

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handlePicChange = (e) => {
    setPic(e.target.files[0]);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, width: 500 }}>
        <Typography variant="h5" mb={2}>Add Opportunity</Typography>
        {error && <Alert severity="error" mb={2}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Opportunity Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              label="Opportunity Type"
              onChange={handleChange}
              required
            >
              <MenuItem value="job">Job</MenuItem>
              <MenuItem value="contest">Contest</MenuItem>
              <MenuItem value="webinar">Webinar</MenuItem>
            </Select>
          </FormControl>
          {formData.type === 'job' && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="jobType"
                  value={formData.jobType}
                  label="Job Type"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="full-time">Full-Time</MenuItem>
                  <MenuItem value="part-time">Part-Time</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Salary" name="salary" value={formData.salary} onChange={handleChange} margin="normal" />
              <TextField fullWidth label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required margin="normal" />
              <TextField fullWidth label="Company Address" name="companyAddress" value={formData.companyAddress} onChange={handleChange} required margin="normal" />
              <TextField fullWidth label="Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleChange} required margin="normal" />
              <TextField
                fullWidth
                label="Application Deadline"
                name="applicationDeadline"
                type="datetime-local"
                value={formData.applicationDeadline}
                onChange={handleChange}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
                helperText="Last date and time to apply for this job."
              />
            </>
          )}
          {formData.type === 'contest' && (
            <>
              <TextField fullWidth label="Organizer" name="organizer" value={formData.organizer} onChange={handleChange} required margin="normal" />
              <TextField fullWidth label="Prize" name="prize" value={formData.prize} onChange={handleChange} margin="normal" />
              <TextField
                fullWidth
                label="Registration Fee (₹)"
                name="registrationFee"
                type="number"
                value={formData.registrationFee || 0}
                onChange={handleChange}
                required
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                helperText="Set 0 for free contests, or enter an amount for paid contests."
              />
              <TextField
                fullWidth
                label="Contest Date and Time"
                name="contestDateTime"
                type="datetime-local"
                value={formData.contestDateTime}
                onChange={handleChange}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
          {formData.type === 'webinar' && (
            <>
              <TextField fullWidth label="Speaker" name="speaker" value={formData.speaker} onChange={handleChange} required margin="normal" />
              <TextField fullWidth label="Platform" name="platform" value={formData.platform} onChange={handleChange} required margin="normal" />
              <TextField
                fullWidth
                label="Registration Fee (₹)"
                name="registrationFee"
                type="number"
                value={formData.registrationFee || 0}
                onChange={handleChange}
                required
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                helperText="Set 0 for free webinars, or enter an amount for paid webinars."
              />
              <TextField
                fullWidth
                label="Webinar Date and Time"
                name="webinarDateTime"
                type="datetime-local"
                value={formData.webinarDateTime}
                onChange={handleChange}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
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
          {pic && (
            <Box mb={2}>
              <Typography variant="body2">Image Preview:</Typography>
              <img
                src={URL.createObjectURL(pic)}
                alt="Preview"
                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
              />
            </Box>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Add Opportunity
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default OpportunityForm;