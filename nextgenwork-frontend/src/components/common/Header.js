import React, { useContext, useState } from 'react';
import { Box, Typography, Avatar, Menu, MenuItem, IconButton, Tooltip, Stack, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const navItems = [
  { label: 'Opportunities', path: '/', icon: <HomeIcon /> },
  { label: 'Learning Hub', path: '/resources', icon: <SchoolIcon /> },
  { label: 'Go To Profile', path: '/profile', icon: <PersonIcon /> },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };
  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1200,
      bgcolor: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      py: 2,
      overflowX: 'hidden',
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        bgcolor: 'white',
        borderRadius: 5,
        boxShadow: '0 4px 24px #0001',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 4 },
        py: 1.2,
        mt: 1.5,
        overflowX: 'hidden',
      }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }} onClick={() => navigate('/')}> 
          <Typography
            variant="h4"
            fontWeight={900}
            letterSpacing={1}
            color="#1976d2"
            sx={{ fontFamily: 'Montserrat, Poppins, sans-serif', fontSize: { xs: 22, sm: 28 }, mr: 1 }}
          >
            NextGenWork
          </Typography>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#1976d2', ml: 0.5 }} />
        </Box>
        {/* Hamburger menu for mobile/tablet */}
        <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
          <IconButton onClick={handleDrawerToggle} size="large">
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>
        {/* Navigation for desktop only */}
        <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: 'none', lg: 'flex' } }}>
          {navItems.map((item) => (
            <Typography
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 17,
                color: location.pathname === item.path ? '#1976d2' : '#222',
                borderBottom: location.pathname === item.path ? '3px solid #1976d2' : '3px solid transparent',
                pb: 0.5,
                transition: 'all 0.18s',
                '&:hover': {
                  color: '#1976d2',
                  borderBottom: '3px solid #1976d2',
                },
              }}
            >
              {item.label}
            </Typography>
          ))}
          {/* User Avatar & Menu */}
          {user && (
            <Box ml={2}>
              <Tooltip title={user.username || 'Profile'}>
                <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 800, width: 40, height: 40, fontSize: 20, border: '2px solid #e3eafc', boxShadow: '0 2px 8px #1976d122' }}>
                    {user.username ? user.username[0].toUpperCase() : '?'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 6,
                  sx: {
                    mt: 1.5,
                    minWidth: 170,
                    borderRadius: 3,
                    background: 'white',
                    boxShadow: '0 8px 32px #1976d122',
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleProfile} sx={{ fontWeight: 700, fontSize: 16 }}>
                  <PersonIcon sx={{ mr: 1, color: '#1976d2' }} /> Profile
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ fontWeight: 700, fontSize: 16 }}>
                  <LogoutIcon sx={{ mr: 1, color: '#e53935' }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Stack>
        {/* Hamburger Drawer for mobile/tablet */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: 'block', lg: 'none' } }}
          PaperProps={{ sx: { width: 240, pt: 2 } }}
        >
          <Box sx={{ width: 240, pt: 2 }} role="presentation" onClick={handleDrawerToggle}>
            <List>
              {navItems.map((item) => (
                <ListItem button key={item.path} onClick={() => navigate(item.path)} selected={location.pathname === item.path}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1 }} />
            {user && (
              <List>
                <ListItem button onClick={handleProfile}>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon sx={{ color: '#e53935' }} /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            )}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};

export default Header; 