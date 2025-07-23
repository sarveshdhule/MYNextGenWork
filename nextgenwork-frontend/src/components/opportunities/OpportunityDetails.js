import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Button, Typography, Box, Paper, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Divider, Chip, Tooltip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LinkIcon from '@mui/icons-material/Link';
import TagIcon from '@mui/icons-material/Tag';
import DomainIcon from '@mui/icons-material/Domain';
import PersonIcon from '@mui/icons-material/Person';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import loadRazorpayScript from '../../utils/loadRazorpay';
import RequestForm from './RequestForm';
import Comments from './Comments';

const OpportunityDetails = () => {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const [opportunity, setOpportunity] = useState(null);
  const [error, setError] = useState('');
  const [bookmarkMsg, setBookmarkMsg] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', college: '', mobile: '' });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [jobRequests, setJobRequests] = useState([]);
  const [loadingJobRequests, setLoadingJobRequests] = useState(false);
  const navigate = useNavigate();

  const fetchOpportunity = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setOpportunity(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch registrations if user is poster
  const fetchRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      const res = await fetch(`http://localhost:5000/api/registrations/${id}/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = await res.json();
      // Ensure registrations is always an array
      if (!Array.isArray(data)) data = [];
      setRegistrations(data);
    } catch (err) {
      setRegistrations([]); // fallback to empty array on error
    }
    setLoadingRegistrations(false);
  };

  const fetchJobRequests = async () => {
    setLoadingJobRequests(true);
    try {
      console.log('Fetching job requests for opportunity:', id);
      const res = await fetch(`http://localhost:5000/api/requests/opportunity/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Fetched job requests:', data);
      setJobRequests(data);
    } catch (err) {
      console.error('Error fetching job requests:', err);
    }
    setLoadingJobRequests(false);
  };

  useEffect(() => {
    fetchOpportunity();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (
      opportunity &&
      user &&
      opportunity.postedBy?._id?.toString() === user._id?.toString() &&
      opportunity.type === 'job'
    ) {
      fetchJobRequests();
    }
    // eslint-disable-next-line
  }, [opportunity, user]);

  useEffect(() => {
    if (
      opportunity &&
      user &&
      (opportunity.type === 'contest' || opportunity.type === 'webinar')
    ) {
      fetchRegistrations();
    }
    // eslint-disable-next-line
  }, [opportunity, user]);

  const handleBookmark = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/bookmark/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to bookmark');
      setBookmarkMsg('Bookmarked!');
      setTimeout(() => setBookmarkMsg(''), 2000);
    } catch (err) {
      setBookmarkMsg('Failed to bookmark');
      setTimeout(() => setBookmarkMsg(''), 2000);
    }
  };

  const handleRegisterOpen = () => {
    setShowRegister(true);
    setRegisterForm({ name: '', college: '', mobile: '' });
    setRegisterError('');
    setRegisterSuccess('');
  };

  const handleRegisterClose = () => {
    setShowRegister(false);
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  // Razorpay payment and registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    if (!registerForm.name || !registerForm.college || !registerForm.mobile) {
      setRegisterError('All fields are required.');
      return;
    }

    // Always get the latest user from localStorage to ensure email is present
    const latestUser = JSON.parse(localStorage.getItem('user') || '{}');
    const emailToSend = latestUser.email || user.email || '';

    if (opportunity.registrationFee > 0) {
      setIsPaying(true);
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setRegisterError('Failed to load payment gateway.');
        setIsPaying(false);
        return;
      }
      // Create order on backend
      const orderRes = await fetch('http://localhost:5000/api/registrations/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: opportunity.registrationFee })
      });
      const order = await orderRes.json();
      if (!order.id) {
        setRegisterError('Failed to create payment order.');
        setIsPaying(false);
        return;
      }
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Set in your .env
        amount: order.amount,
        currency: order.currency,
        name: opportunity.title,
        description: 'Contest Registration Fee',
        order_id: order.id,
        handler: async function (response) {
          // Register after payment
          const regRes = await fetch(`http://localhost:5000/api/registrations/${id}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              ...registerForm,
              paymentId: response.razorpay_payment_id,
              paid: true
            })
          });
          const regData = await regRes.json();
          if (regRes.ok) {
            setRegisterSuccess('Registration successful!');
            fetchRegistrations(); // <-- Add this line
            setTimeout(() => setShowRegister(false), 1500);
          } else {
            setRegisterError(regData.message || 'Registration failed');
          }
          setIsPaying(false);
        },
        prefill: {
          name: registerForm.name,
          email: user.email || '', // Use logged-in user's email
          contact: registerForm.mobile
        },
        theme: { color: '#1976d2' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setIsPaying(false);
    } else {
      // Free registration
      const regRes = await fetch(`http://localhost:5000/api/registrations/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...registerForm,
          email: emailToSend,
          paid: false
        })
      });
      const regData = await regRes.json();
      if (regRes.ok) {
        setRegisterSuccess('Registration successful!');
        fetchRegistrations(); // <-- Add this line
        setTimeout(() => setShowRegister(false), 1500);
      } else {
        setRegisterError(regData.message || 'Registration failed');
      }
    }
  };

  // Helper to get logo URL or default
  const getLogoUrl = (opp) => {
    if (opp && opp.logo) {
      // Use only the filename, serve from /public/logos/
      const filename = opp.logo.split(/[/\\]/).pop();
      return `http://localhost:5000/public/logos/${filename}`;
    }
    return '/default-logo.png';
  };

  // Helper to get user ID from registration (handles string or object)
  const getRegUserId = (r) => {
    if (!r.user) return '';
    if (typeof r.user === 'string') return r.user;
    if (typeof r.user === 'object' && r.user._id) return r.user._id.toString();
    return r.user.toString();
  };

  // Helper to get status tag for contests, webinars, and jobs
  const getStatusTag = (opp) => {
    let eventDate = null;
    if (opp.type === 'contest' && opp.contestDateTime) {
      eventDate = new Date(opp.contestDateTime);
    } else if (opp.type === 'webinar' && opp.webinarDateTime) {
      eventDate = new Date(opp.webinarDateTime);
    } else if (opp.type === 'job' && opp.applicationDeadline) {
      eventDate = new Date(opp.applicationDeadline);
    }
    if (eventDate && eventDate < new Date()) {
      return (
        <span style={{
          background: '#e57373',
          color: 'white',
          borderRadius: 8,
          padding: '2px 10px',
          fontSize: 12,
          position: 'absolute',
          top: 16,
          right: 16,
          fontWeight: 600,
          zIndex: 2
        }}>
          {opp.type === 'contest' ? 'Completed' : 'Expired'}
        </span>
      );
    }
    return null;
  };

  // Helper to check if event is expired/completed (jobs, contests, webinars)
  const isEventExpired = (opp) => {
    let eventDate = null;
    if (opp.type === 'contest' && opp.contestDateTime) {
      eventDate = new Date(opp.contestDateTime);
    } else if (opp.type === 'webinar' && opp.webinarDateTime) {
      eventDate = new Date(opp.webinarDateTime);
    } else if (opp.type === 'job' && opp.applicationDeadline) {
      eventDate = new Date(opp.applicationDeadline);
    }
    return eventDate && eventDate < new Date();
  };

  const handleDeleteOpportunity = async () => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await fetch(`http://localhost:5000/api/opportunities/${opportunity._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      alert('Failed to delete opportunity');
    }
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!opportunity) return <Typography>Loading...</Typography>;

  // Render fields only if present, else N/A
  const renderField = (label, value) => (
    <Typography variant="body2" color="text.secondary" mb={1}><strong>{label}:</strong> {value || 'N/A'}</Typography>
  );

  const userId = user._id?.toString();
  const alreadyRegistered = Array.isArray(registrations) && registrations.some(
    r => getRegUserId(r) === userId
  );

  const myReg = Array.isArray(registrations) && registrations.find(
    r => getRegUserId(r) === userId
  );

  const isPoster = opportunity.postedBy?._id?.toString() === user._id?.toString();

  // Helper to get a color for the type
  const typeColor = {
    job: 'primary',
    contest: 'secondary',
    webinar: 'info',
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" sx={{
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
      py: 6,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* BG Image for contest, job, webinar (fixed, full screen) */}
      {(opportunity.type === 'contest' || opportunity.type === 'job' || opportunity.type === 'webinar') && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            background:
              opportunity.type === 'contest'
                ? `url('http://localhost:5000/public/pics/contest.jpg') center/cover no-repeat`
                : opportunity.type === 'job'
                  ? `url('http://localhost:5000/public/pics/job.jpg') center/cover no-repeat`
                  : `url('http://localhost:5000/public/pics/webinar.jpg') center/cover no-repeat`,
            filter: 'brightness(0.6)',
            opacity: 0.7,
            pointerEvents: 'none',
            transition: 'opacity 0.3s'
          }}
        />
      )}
      <Paper
        elevation={12}
        sx={{
          p: 0,
          width: 580,
          borderRadius: 5,
          overflow: 'hidden',
          boxShadow: '0 8px 40px #0002',
          backdropFilter: 'blur(8px)',
          background: 'rgba(255,255,255,0.85)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header with type chip */}
        <Box sx={{ bgcolor: `${typeColor[opportunity.type]}.main`, color: 'white', p: 3, display: 'flex', alignItems: 'center', position: 'relative', minHeight: 70 }}>
          {getStatusTag(opportunity)}
          <Chip
            label={opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
            color={typeColor[opportunity.type]}
            sx={{ fontWeight: 700, fontSize: 18, mr: 2, px: 2, py: 1, letterSpacing: 1, boxShadow: '0 2px 8px #0002' }}
          />
          <Typography variant="h4" fontWeight={800} flex={1} sx={{ letterSpacing: 1 }}>
            {opportunity.title}
          </Typography>
        </Box>
        {/* Main Image Display */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', bgcolor: '#f8fafc' }}>
          <img
            src={opportunity.pic ? `http://localhost:5000/public/pics/${(opportunity.pic || '').split(/[/\\]/).pop()}` : '/public/pics/codelogo.png'}
            alt="Main"
            style={{ width: 440, height: 240, objectFit: 'cover', borderRadius: 20, boxShadow: '0 4px 32px #0002', marginTop: -36, border: '5px solid #fff' }}
            onError={e => {
              // Prevent infinite loop: only set fallback if not already set
              if (!e.target.dataset.fallback) {
                e.target.onerror = null;
                e.target.src = '/public/pics/codelogo.png';
                e.target.dataset.fallback = 'true';
              }
            }}
          />
        </Box>
        <Box sx={{ p: 4 }}>
          <Typography variant="subtitle1" color="text.secondary" mb={2} sx={{ fontSize: 18, fontWeight: 500 }}>
            {opportunity.description}
            </Typography>
          <Divider sx={{ mb: 2 }} />
          {/* Fields Section */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              <DomainIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary"><strong>Domain:</strong> {opportunity.domain}</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <CalendarMonthIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="body2" color="text.secondary"><strong>Posted Date:</strong> {opportunity.date?.slice(0,10) || 'N/A'}</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <TagIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="body2" color="text.secondary"><strong>Tags:</strong> {(opportunity.tags || []).join(', ') || 'N/A'}</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <LinkIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body2" color="text.secondary"><strong>External Link:</strong> {opportunity.externalLink ? <a href={opportunity.externalLink} target="_blank" rel="noopener noreferrer">{opportunity.externalLink}</a> : 'N/A'}</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {/* Type-specific UI */}
          {opportunity.type === 'job' && (
            <Box mt={2}>
              {renderField('Salary', opportunity.salary)}
              {renderField('Company Name', opportunity.companyName)}
              {renderField('Company Address', opportunity.companyAddress)}
              {renderField('Contact Info', opportunity.contactInfo)}
              {opportunity.applicationDeadline && (
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarMonthIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Application Deadline:</strong> {new Date(opportunity.applicationDeadline).toLocaleString()}
                  </Typography>
        </Box>
              )}

              {/* Show RequestForm if user is not the poster and job is not expired */}
              {!isPoster && !isEventExpired(opportunity) && (
                <RequestForm opportunityId={opportunity._id} onRequestAdded={fetchJobRequests} />
              )}

              {/* Show job requests if user is the poster */}
              {isPoster && (
                <Box mt={3}>
                  <Typography variant="h6" mb={1}>
                    Job Requests ({jobRequests.length})
                  </Typography>
                  {console.log('Rendering jobRequests:', jobRequests)}
                  {loadingJobRequests ? <CircularProgress size={24} /> : (
                    jobRequests.length === 0
                      ? <Typography color="text.secondary">No requests yet.</Typography>
                      : (
                        <Box>
                          {jobRequests.map((r, idx) => (
                            <Paper key={r._id} sx={{ p: 2, mb: 1 }}>
                              <Typography><strong>Requested by:</strong> {r.requestedBy?.username || 'User'}</Typography>
                              <Typography><strong>Description:</strong> {r.description}</Typography>
                  {r.resumePath && (
                    <a
                      href={`http://localhost:5000/${r.resumePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Resume
                    </a>
                  )}
                            </Paper>
                          ))}
                        </Box>
                      )
                  )}
                </Box>
              )}
              {/* Edit and Delete buttons for job poster */}
              {isPoster && (
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button variant="outlined" color="primary" onClick={() => navigate(`/opportunity/${opportunity._id}/edit`)}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleDeleteOpportunity}>
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          )}
          {opportunity.type === 'contest' && (
            <Box mt={2}>
              {renderField('Organizer', opportunity.organizer)}
              {renderField('Prize', opportunity.prize)}
              {renderField('Registration Fee', opportunity.registrationFee > 0 ? `₹${opportunity.registrationFee}` : 'Free of cost')}
              {renderField('Contest Date & Time', opportunity.contestDateTime
                ? new Date(opportunity.contestDateTime).toLocaleString()
                : undefined)}
              {/* Registration logic for all users */}
              {!isEventExpired(opportunity) && !alreadyRegistered && (
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleRegisterOpen}>
                  Register
                </Button>
              )}
              {alreadyRegistered && myReg && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You have already registered with:<br />
                  <strong>Name:</strong> {myReg.name} <br />
                  <strong>Email:</strong> {myReg.email} <br />
                  <strong>Contact No:</strong> {myReg.mobile}
                </Alert>
              )}
              {/* Poster view: show registrations */}
              {opportunity.postedBy?._id?.toString() === userId && (
                <Box mt={3}>
                  <Typography variant="h6" mb={1}>
                    Registrations ({registrations.length})
                  </Typography>
                  {loadingRegistrations ? <CircularProgress size={24} /> : (
                    registrations.length === 0
                      ? <Typography color="text.secondary">No registrations yet.</Typography>
                      : (
                        <Box>
                          {registrations.map((r, idx) => (
                            <Paper key={idx} sx={{ p: 2, mb: 1 }}>
                              <Typography><strong>Name:</strong> {r.name}</Typography>
                              <Typography><strong>College:</strong> {r.college}</Typography>
                              <Typography><strong>Email:</strong> {r.email}</Typography>
                              <Typography><strong>Mobile:</strong> {r.mobile}</Typography>
                              <Typography><strong>Paid:</strong> {r.paid ? 'Yes' : 'No'}</Typography>
                            </Paper>
                          ))}
                        </Box>
                      )
                  )}
                </Box>
              )}
            </Box>
          )}
          {opportunity.type === 'webinar' && (
            <Box mt={2}>
              {renderField('Speaker', opportunity.speaker)}
              {renderField('Platform', opportunity.platform)}
              {renderField('Webinar Date & Time', opportunity.webinarDateTime
                ? new Date(opportunity.webinarDateTime).toLocaleString()
                : undefined)}
              {renderField('Registration Fee', opportunity.registrationFee > 0 ? `₹${opportunity.registrationFee}` : 'Free of cost')}
              {/* Registration logic for all users */}
              {!isEventExpired(opportunity) && !alreadyRegistered && (
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleRegisterOpen}>
                  Register
                </Button>
              )}
              {alreadyRegistered && myReg && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You have already registered with:<br />
                  <strong>Name:</strong> {myReg.name} <br />
                  <strong>Email:</strong> {myReg.email} <br />
                  <strong>Contact No:</strong> {myReg.mobile}
                </Alert>
              )}
              {/* Poster view: show registrations */}
              {opportunity.postedBy?._id?.toString() === userId && (
                <Box mt={3}>
                  <Typography variant="h6" mb={1}>
                    Registrations ({registrations.length})
                  </Typography>
                  {loadingRegistrations ? <CircularProgress size={24} /> : (
                    registrations.length === 0
                      ? <Typography color="text.secondary">No registrations yet.</Typography>
                      : (
                        <Box>
                          {registrations.map((r, idx) => (
                            <Paper key={idx} sx={{ p: 2, mb: 1 }}>
                              <Typography><strong>Name:</strong> {r.name}</Typography>
                              <Typography><strong>College:</strong> {r.college}</Typography>
                              <Typography><strong>Email:</strong> {r.email}</Typography>
                              <Typography><strong>Mobile:</strong> {r.mobile}</Typography>
                              <Typography><strong>Paid:</strong> {r.paid ? 'Yes' : 'No'}</Typography>
                            </Paper>
                          ))}
                        </Box>
                      )
                  )}
                </Box>
              )}
            </Box>
          )}
          {/* Delete button for contest/webinar poster */}
          {(opportunity.type === 'contest' || opportunity.type === 'webinar') && isPoster && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button variant="outlined" color="error" onClick={handleDeleteOpportunity}>
                Delete
              </Button>
            </Box>
          )}
          <Button variant="outlined" size="small" onClick={handleBookmark} sx={{ mt: 2, mr: 1 }}>
            Bookmark
          </Button>
          {bookmarkMsg && <Typography color="success.main" variant="body2">{bookmarkMsg}</Typography>}
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2, ml: 1 }}>Back</Button>
        </Box>
        {/* Contest Registration Dialog */}
        <Dialog open={showRegister} onClose={handleRegisterClose}>
          <DialogTitle>Contest Registration</DialogTitle>
          <form onSubmit={handleRegisterSubmit}>
            <DialogContent>
              {registerError && <Alert severity="error" sx={{ mb: 2 }}>{registerError}</Alert>}
              {registerSuccess && <Alert severity="success" sx={{ mb: 2 }}>{registerSuccess}</Alert>}
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="College Name"
                name="college"
                value={registerForm.college}
                onChange={handleRegisterChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile"
                value={registerForm.mobile}
                onChange={handleRegisterChange}
                margin="normal"
                required
                type="tel"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRegisterClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isPaying}>
                {opportunity && opportunity.registrationFee > 0 ? (isPaying ? <CircularProgress size={20} /> : 'Pay & Register') : 'Register'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        {/* Comments/Discussion Section */}
        <Box width="100%" maxWidth={500} mx="auto" mb={4}>
          <Comments opportunityId={opportunity._id} />
        </Box>
      </Paper>
    </Box>
  );
};

export default OpportunityDetails;