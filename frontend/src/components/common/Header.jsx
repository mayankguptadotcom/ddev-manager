import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import projectService from '../../services/projectService';

const Header = ({ onSidebarToggle }) => {
  const navigate = useNavigate();

  // Health check query
  const { data: healthData, isError: healthError } = useQuery(
    'health',
    projectService.healthCheck,
    {
      refetchInterval: 30000, // Check every 30 seconds
      retry: 1,
    }
  );

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'primary.main',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={onSidebarToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold' }}
        >
          DDEV Manager
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* API Status Indicator */}
          <Chip
            label={healthError ? 'API Offline' : 'API Online'}
            color={healthError ? 'error' : 'success'}
            size="small"
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '& .MuiChip-label': {
                color: 'white',
              },
            }}
          />

          <IconButton
            color="inherit"
            aria-label="refresh"
            onClick={handleRefresh}
            title="Refresh Application"
          >
            <RefreshIcon />
          </IconButton>

          <IconButton
            color="inherit"
            aria-label="create project"
            onClick={handleCreateProject}
            title="Create New Project"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
