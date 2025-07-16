import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  MoreVert,
  Launch,
  Settings,
  Delete,
  Storage
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import projectService from '../services/projectService';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedProject, setSelectedProject] = React.useState(null);

  // Fetch projects
  const { data: projectsData, isLoading, error, refetch } = useQuery(
    'projects',
    projectService.getAllProjects,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Project mutations
  const startMutation = useMutation(projectService.startProject, {
    onSuccess: (data, projectName) => {
      toast.success(`Project ${projectName} started successfully`);
      queryClient.invalidateQueries('projects');
    },
    onError: (error, projectName) => {
      toast.error(`Failed to start ${projectName}: ${error.message}`);
    },
  });

  const stopMutation = useMutation(projectService.stopProject, {
    onSuccess: (data, projectName) => {
      toast.success(`Project ${projectName} stopped successfully`);
      queryClient.invalidateQueries('projects');
    },
    onError: (error, projectName) => {
      toast.error(`Failed to stop ${projectName}: ${error.message}`);
    },
  });

  const restartMutation = useMutation(projectService.restartProject, {
    onSuccess: (data, projectName) => {
      toast.success(`Project ${projectName} restarted successfully`);
      queryClient.invalidateQueries('projects');
    },
    onError: (error, projectName) => {
      toast.error(`Failed to restart ${projectName}: ${error.message}`);
    },
  });

  const deleteMutation = useMutation(projectService.deleteProject, {
    onSuccess: (data, projectName) => {
      toast.success(`Project ${projectName} deleted successfully`);
      queryClient.invalidateQueries('projects');
    },
    onError: (error, projectName) => {
      toast.error(`Failed to delete ${projectName}: ${error.message}`);
    },
  });

  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleProjectAction = async (action, projectName) => {
    handleMenuClose();
    
    switch (action) {
      case 'start':
        startMutation.mutate(projectName);
        break;
      case 'stop':
        stopMutation.mutate(projectName);
        break;
      case 'restart':
        restartMutation.mutate(projectName);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete project "${projectName}"?`)) {
          deleteMutation.mutate(projectName);
        }
        break;
      case 'details':
        navigate(`/projects/${projectName}`);
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const isLoading_any = startMutation.isLoading || stopMutation.isLoading || 
                       restartMutation.isLoading || deleteMutation.isLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const isDdevNotInstalled = error.message.includes('DDEV is not installed') || 
                              error.message.includes('not available');
    
    return (
      <Box>
        <Alert 
          severity={isDdevNotInstalled ? "warning" : "error"} 
          sx={{ mb: 2 }}
        >
          {isDdevNotInstalled ? (
            <>
              <strong>DDEV Not Found</strong><br />
              DDEV is not installed or not available in your PATH. 
              Please install DDEV first to manage your projects.
              <br /><br />
              <a 
                href="https://ddev.readthedocs.io/en/stable/#installation" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                → Install DDEV Documentation
              </a>
            </>
          ) : (
            `Failed to load projects: ${error.message}`
          )}
        </Alert>
        <Button variant="contained" onClick={() => refetch()}>
          {isDdevNotInstalled ? 'Check Again' : 'Retry'}
        </Button>
      </Box>
    );
  }

  const projects = projectsData?.data || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          DDEV Projects
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={() => navigate('/create-project')}
          >
            Create Project
          </Button>
        </Box>
      </Box>

      {projects.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No DDEV projects found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your first DDEV project to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => navigate('/create-project')}
            >
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.name}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div" noWrap>
                      {project.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, project)}
                      disabled={isLoading_any}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                    {project.status === 'running' && (
                      <Chip label="Active" color="success" variant="outlined" size="small" />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type: {project.config?.type || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    PHP: {project.config?.php_version || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Database: {
                      typeof project.config?.database === 'object' 
                        ? `${project.config.database.type}:${project.config.database.version}`
                        : project.config?.database || 'Unknown'
                    }
                  </Typography>

                  {project.status === 'running' && project.primary_url && (
                    <Box mt={2}>
                      <Typography variant="caption" display="block" gutterBottom>
                        URLs:
                      </Typography>
                      <Typography variant="caption" display="block">
                        <a
                          href={project.primary_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {project.primary_url}
                        </a>
                      </Typography>
                      {project.httpurl && project.httpurl !== project.primary_url && (
                        <Typography variant="caption" display="block">
                          <a
                            href={project.httpurl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {project.httpurl}
                          </a>
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  {project.status === 'running' ? (
                    <Button
                      size="small"
                      startIcon={<Stop />}
                      onClick={() => handleProjectAction('stop', project.name)}
                      disabled={isLoading_any}
                      color="error"
                    >
                      Stop
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleProjectAction('start', project.name)}
                      disabled={isLoading_any}
                      color="success"
                    >
                      Start
                    </Button>
                  )}
                  
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={() => handleProjectAction('restart', project.name)}
                    disabled={isLoading_any}
                  >
                    Restart
                  </Button>

                  {project.status === 'running' && project.primary_url && (
                    <IconButton
                      size="small"
                      onClick={() => window.open(project.primary_url, '_blank')}
                      title="Open in browser"
                    >
                      <Launch />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleProjectAction('details', selectedProject?.name)}>
          <Settings sx={{ mr: 1 }} />
          Details & Config
        </MenuItem>
        {selectedProject?.status === 'running' && selectedProject?.primary_url && (
          <MenuItem onClick={() => window.open(selectedProject.primary_url, '_blank')}>
            <Launch sx={{ mr: 1 }} />
            Open in Browser
          </MenuItem>
        )}
        <MenuItem onClick={() => handleProjectAction('delete', selectedProject?.name)}>
          <Delete sx={{ mr: 1 }} />
          Delete Project
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Dashboard;
