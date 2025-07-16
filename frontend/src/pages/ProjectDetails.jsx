import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  ArrowBack,
  Launch
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import projectService from '../services/projectService';

const ProjectDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch project details
  const { data: projectData, isLoading, error, refetch } = useQuery(
    ['project', name],
    () => projectService.getProject(name),
    {
      refetchInterval: 30000,
    }
  );

  // Project mutations
  const startMutation = useMutation(projectService.startProject, {
    onSuccess: () => {
      toast.success(`Project ${name} started successfully`);
      queryClient.invalidateQueries(['project', name]);
    },
    onError: (error) => {
      toast.error(`Failed to start ${name}: ${error.message}`);
    },
  });

  const stopMutation = useMutation(projectService.stopProject, {
    onSuccess: () => {
      toast.success(`Project ${name} stopped successfully`);
      queryClient.invalidateQueries(['project', name]);
    },
    onError: (error) => {
      toast.error(`Failed to stop ${name}: ${error.message}`);
    },
  });

  const restartMutation = useMutation(projectService.restartProject, {
    onSuccess: () => {
      toast.success(`Project ${name} restarted successfully`);
      queryClient.invalidateQueries(['project', name]);
    },
    onError: (error) => {
      toast.error(`Failed to restart ${name}: ${error.message}`);
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const isLoading_any = startMutation.isLoading || stopMutation.isLoading || restartMutation.isLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load project details: {error.message}
        </Alert>
        <Button variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  const project = projectData?.data;
  if (!project) {
    return (
      <Alert severity="error">
        Project not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {project.name}
        </Typography>
        <Box ml="auto">
          <Chip
            label={project.status}
            color={getStatusColor(project.status)}
            sx={{ mr: 2 }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {project.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {project.status}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {project.config?.type || 'Unknown'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    PHP Version
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {project.config?.php_version || 'Unknown'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Database
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {
                      typeof project.config?.database === 'object' 
                        ? `${project.config.database.type}:${project.config.database.version}`
                        : project.config?.database || 'Unknown'
                    }
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Web Server
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {project.config?.webserver_type || 'Unknown'}
                  </Typography>
                </Grid>

                {project.config?.docroot && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Document Root
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {project.config.docroot}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {project.status === 'running' && project.primary_url && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    URLs
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {project.primary_url}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Launch />}
                      onClick={() => window.open(project.primary_url, '_blank')}
                    >
                      Open
                    </Button>
                  </Box>
                  {project.httpurl && project.httpurl !== project.primary_url && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {project.httpurl}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Launch />}
                        onClick={() => window.open(project.httpurl, '_blank')}
                      >
                        Open
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" flexDirection="column" gap={2}>
                {project.status === 'running' ? (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Stop />}
                    onClick={() => stopMutation.mutate(name)}
                    disabled={isLoading_any}
                    fullWidth
                  >
                    Stop Project
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrow />}
                    onClick={() => startMutation.mutate(name)}
                    disabled={isLoading_any}
                    fullWidth
                  >
                    Start Project
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => restartMutation.mutate(name)}
                  disabled={isLoading_any}
                  fullWidth
                >
                  Restart Project
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => refetch()}
                  fullWidth
                >
                  Refresh Status
                </Button>

                {project.status === 'running' && project.primary_url && (
                  <Button
                    variant="outlined"
                    startIcon={<Launch />}
                    onClick={() => window.open(project.primary_url, '_blank')}
                    fullWidth
                  >
                    Open in Browser
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetails;
