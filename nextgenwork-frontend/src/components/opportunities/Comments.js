import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Avatar, Stack, Divider } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const Comments = ({ opportunityId }) => {
  const { token, user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${opportunityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch comments');
      setComments(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [opportunityId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    setError('');
    setPosting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${opportunityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add comment');
      setComments([...comments, data]);
      setText('');
    } catch (err) {
      setError(err.message);
    }
    setPosting(false);
  };

  return (
    <Box mt={5}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <ChatBubbleOutlineIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>Discussion / Comments</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {loading ? <CircularProgress /> : (
          comments.length === 0 ? (
            <Typography color="text.secondary" mb={2}>No comments yet. Be the first to comment!</Typography>
          ) : (
            <Stack spacing={2} mb={2}>
              {comments.map((c) => (
                <Paper key={c._id} elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', fontSize: 16 }}>
                      {c.user?.username ? c.user.username[0].toUpperCase() : 'U'}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {c.user?.username || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" ml={1}>
                      {new Date(c.createdAt).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Typography sx={{ ml: 5 }}>{c.text}</Typography>
                </Paper>
              ))}
            </Stack>
          )
        )}
        {user && (
          <form onSubmit={handleAddComment}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              fullWidth
              label="Add a comment or question..."
              value={text}
              onChange={e => setText(e.target.value)}
              required
              multiline
              minRows={2}
              sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2 }}
            />
            <Button type="submit" variant="contained" disabled={posting || !text.trim()} sx={{ px: 4, py: 1, fontWeight: 600 }}>
              {posting ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default Comments;
