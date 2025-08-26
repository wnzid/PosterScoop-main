import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  InputBase
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MenuButton = styled(IconButton)(() => ({
  position: 'relative',
  '& .menu-icon, & .close-icon': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'opacity 0.3s ease',
  },
  '& .close-icon': {
    opacity: 0,
  },
  '&.open .menu-icon': {
    opacity: 0,
  },
  '&.open .close-icon': {
    opacity: 1,
  },
}));

function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { items } = useCart();
  const { user, logout } = useAuth();
  const headerHeight = 64;
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const executeSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MenuButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            className={drawerOpen ? 'open' : ''}
            sx={{ mr: 2 }}
          >
            <MenuIcon className="menu-icon" />
            <CloseIcon className="close-icon" />
          </MenuButton>
          <Box>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '20px',
                px: 2,
                width: 200,
              }}
            >
              <InputBase
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKey}
                sx={{ flexGrow: 1 }}
              />
              <IconButton onClick={executeSearch}>
                <SearchIcon />
              </IconButton>
            </Box>
            {mobileSearchOpen ? (
              <Box
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  px: 1,
                  width: 150,
                }}
              >
                <InputBase
                  autoFocus
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKey}
                  onBlur={() => setMobileSearchOpen(false)}
                  sx={{ flexGrow: 1 }}
                />
                <IconButton
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={executeSearch}
                >
                  <SearchIcon />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={() => setMobileSearchOpen(true)}
                sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: 'inherit' }}
              >
                <SearchIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textDecoration: 'none',
          }}
        >
          PosterScoop
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <IconButton component={RouterLink} to="/cart" color="inherit">
            <Badge badgeContent={items.length} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleMenu}
            aria-controls={anchorEl ? 'profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
          >
            <AccountCircle />
          </IconButton>
        </Box>
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {!user && (
            <MenuItem component={RouterLink} to="/login" onClick={handleClose}>
              Login
            </MenuItem>
          )}
          {!user && (
            <MenuItem component={RouterLink} to="/register" onClick={handleClose}>
              Register
            </MenuItem>
          )}
          {user && user.isAdmin && (
            <MenuItem component={RouterLink} to="/admin" onClick={handleClose}>
              Admin Dashboard
            </MenuItem>
          )}
          {user && (
            <MenuItem component={RouterLink} to="/account" onClick={handleClose}>
              My Account
            </MenuItem>
          )}
          {user && <MenuItem onClick={handleLogout}>Logout</MenuItem>}
        </Menu>
      </Toolbar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            top: headerHeight,
            height: `calc(100% - ${headerHeight}px)`,
            backgroundColor: 'rgba(255,255,255,0.9)',
            width: { xs: '75%', sm: 250 },
          },
          '& .MuiBackdrop-root': {
            top: headerHeight,
            height: `calc(100% - ${headerHeight}px)`,
          },
        }}
      >
        <List sx={{ width: { xs: '100%', sm: 250 } }} onClick={closeDrawer}>
          <ListItem button component={RouterLink} to="/">
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={RouterLink} to="/designs">
            <ListItemText primary="Designs" />
          </ListItem>
          <ListItem button component={RouterLink} to="/customize">
            <ListItemText primary="Customize" />
          </ListItem>
          <ListItem button component={RouterLink} to="/product-info">
            <ListItemText primary="Product Info" />
          </ListItem>
          <ListItem button component={RouterLink} to="/faq">
            <ListItemText primary="FAQ" />
          </ListItem>
          <ListItem button component={RouterLink} to="/refund-policy">
            <ListItemText primary="Refund Policy" />
          </ListItem>
          <ListItem button component={RouterLink} to="/about-us">
            <ListItemText primary="About Us" />
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
}

export default Header;
