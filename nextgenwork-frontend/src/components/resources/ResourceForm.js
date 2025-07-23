import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Stack, Dialog, DialogTitle, DialogContent, Chip, MenuItem, Typography, IconButton } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';

const domains = [
  'Web Dev', 'Mobile App Development', 'Computer Science Core', 'DSA', 'Python', 'C++', 'Java',
  'Machine Learning & AI', 'Data Science', 'Cloud Computing', 'DevOps', 'Blockchain Development'
];
const types = ['Blog', 'Playlist', 'Repo', 'Doc'];

const ResourceForm = ({ open, onClose, setResources, editResource }) => {
  const { token } = useContext(AuthContext);
  const isEdit = !!editResource;
  const [domain, setDomain] = useState(editResource ? editResource.domain : '');
  const [resourceLinks, setResourceLinks] = useState(editResource ? editResource.resourceLinks : []);
  const [typeInput, setTypeInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [title, setTitle] = useState(editResource ? editResource.title : '');
  const [description, setDescription] = useState(editResource ? editResource.description : '');
  const [tags, setTags] = useState(editResource ? (editResource.tags ? editResource.tags.join(', ') : '') : '');

  React.useEffect(() => {
    if (editResource) {
      setDomain(editResource.domain || '');
      setResourceLinks(editResource.resourceLinks || []);
      setTitle(editResource.title || '');
      setDescription(editResource.description || '');
      setTags(editResource.tags ? editResource.tags.join(', ') : '');
    } else {
      setDomain('');
      setResourceLinks([]);
      setTitle('');
      setDescription('');
      setTags('');
    }
  }, [editResource, open]);

  const handleAddLink = () => {
    if (typeInput && linkInput && !resourceLinks.some(rl => rl.type === typeInput)) {
      setResourceLinks([...resourceLinks, { type: typeInput, link: linkInput }]);
      setTypeInput('');
      setLinkInput('');
    }
  };

  const handleRemoveLink = (type) => {
    setResourceLinks(resourceLinks.filter(rl => rl.type !== type));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isEdit) {
      // Edit mode: PUT
      const res = await fetch(`http://localhost:5000/api/resources/${editResource._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          description,
          domain,
          resourceLinks,
          tags: tags.split(',').map(t => t.trim())
        })
      });
      await res.json();
      if (setResources) {
        const res2 = await fetch('http://localhost:5000/api/resources');
        const all = await res2.json();
        setResources(all);
      }
      onClose();
      return;
    }
    // Add mode: POST
    const res = await fetch('http://localhost:5000/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title,
        description,
        domain,
        resourceLinks,
        tags: tags.split(',').map(t => t.trim())
      })
    });
    await res.json();
    if (setResources) {
      const res2 = await fetch('http://localhost:5000/api/resources');
      const all = await res2.json();
      setResources(all);
    }
    setTitle('');
    setDescription('');
    setDomain('');
    setResourceLinks([]);
    setTypeInput('');
    setLinkInput('');
    setTags('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Resource' : 'Add Learning Resource'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack spacing={2}>
            <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required />
            <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={2} />
            <TextField
              select
              label="Domain"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              fullWidth
              required
              disabled={resourceLinks.length > 0}
            >
              {domains.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={1}>
              <TextField
                select
                label="Type"
                value={typeInput}
                onChange={e => setTypeInput(e.target.value)}
                sx={{ minWidth: 120 }}
                disabled={!domain}
              >
                {types.filter(t => !resourceLinks.some(rl => rl.type === t)).map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Resource Link"
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                sx={{ minWidth: 220 }}
                disabled={!domain}
              />
              <Button variant="outlined" onClick={handleAddLink} disabled={!typeInput || !linkInput}>Add</Button>
            </Stack>
            <Box>
              {resourceLinks.map(rl => (
                <Chip
                  key={rl.type}
                  label={`${rl.type}: ${rl.link}`}
                  onDelete={() => handleRemoveLink(rl.type)}
                  sx={{ mr: 1, mb: 1 }}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </Box>
            <TextField label="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} fullWidth />
            <Button type="submit" variant="contained" size="large" sx={{ alignSelf: 'flex-start' }} disabled={!domain || resourceLinks.length === 0}>{isEdit ? 'Update Resource' : 'Add Resource'}</Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceForm;
