import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import projectService from '../services/projectService';

const CreateProject = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'php',
      phpVersion: '8.3',
      docroot: '',
      directory: '',
      database: 'mariadb:10.11',
      webserverType: 'nginx-fpm'
    }
  });

  // Fetch available options
  const { data: optionsData, isLoading: optionsLoading } = useQuery(
    'project-options',
    projectService.getAvailableOptions
  );

  // Create project mutation
  const createMutation = useMutation(projectService.createProject, {
    onSuccess: (data) => {
      toast.success('Project created successfully!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const onSubmit = (data) => {
    if (!data.directory) {
      toast.error('Please specify the project directory');
      return;
    }
    createMutation.mutate(data);
  };

  const options = optionsData?.data || {};

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={3}>
        Create New DDEV Project
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ 
                    required: 'Project name is required',
                    pattern: {
                      value: /^[a-zA-Z0-9-_]+$/,
                      message: 'Only letters, numbers, hyphens, and underscores allowed'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Project Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="my-awesome-project"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Project Type</InputLabel>
                      <Select {...field} label="Project Type">
                        {(options.projectTypes || []).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="directory"
                  control={control}
                  rules={{ required: 'Project directory is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Project Directory"
                      fullWidth
                      error={!!errors.directory}
                      helperText={errors.directory?.message || 'Full path to your project directory'}
                      placeholder="/Users/username/Sites/my-project"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="docroot"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Document Root"
                      fullWidth
                      helperText="Relative path to document root (leave empty for project root)"
                      placeholder="web, public, or leave empty"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="phpVersion"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>PHP Version</InputLabel>
                      <Select {...field} label="PHP Version">
                        {(options.phpVersions || []).map((version) => (
                          <MenuItem key={version} value={version}>
                            PHP {version}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="database"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Database</InputLabel>
                      <Select {...field} label="Database">
                        {(options.databases || []).map((db) => (
                          <MenuItem key={db} value={db}>
                            {db}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="webserverType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Web Server</InputLabel>
                      <Select {...field} label="Web Server">
                        {(options.webserverTypes || []).map((server) => (
                          <MenuItem key={server} value={server}>
                            {server}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                {createMutation.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {createMutation.error.message}
                  </Alert>
                )}
                
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    disabled={createMutation.isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createMutation.isLoading || optionsLoading}
                    startIcon={createMutation.isLoading ? <CircularProgress size={20} /> : null}
                  >
                    {createMutation.isLoading ? 'Creating...' : 'Create Project'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Setup Tips
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Make sure the project directory exists and contains your code
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • For WordPress projects, use 'wordpress' as the project type
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • For Drupal projects, use 'drupal' as the project type
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • Document root is typically 'web' for Drupal, 'public' for Laravel, or empty for most others
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateProject;
