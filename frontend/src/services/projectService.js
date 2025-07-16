import api from './api';

export const projectService = {
  // Get all projects
  getAllProjects: () => api.get('/projects'),

  // Get single project
  getProject: (name) => api.get(`/projects/${name}`),

  // Create new project
  createProject: (projectData) => api.post('/projects', projectData),

  // Project lifecycle operations
  startProject: (name) => api.post(`/projects/${name}/start`),
  stopProject: (name) => api.post(`/projects/${name}/stop`),
  restartProject: (name) => api.post(`/projects/${name}/restart`),
  deleteProject: (name) => api.delete(`/projects/${name}?confirm=true`),

  // Configuration operations
  getProjectConfig: (name) => api.get(`/projects/${name}/config`),
  updateProjectConfig: (name, config) => api.put(`/projects/${name}/config`, config),

  // Get project logs
  getProjectLogs: (name, service = 'web', lines = 100) => 
    api.get(`/projects/${name}/logs?service=${service}&lines=${lines}`),

  // Database operations
  importDatabase: (name, file) => {
    const formData = new FormData();
    formData.append('database', file);
    return api.post(`/projects/${name}/database/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  exportDatabase: (name) => api.get(`/projects/${name}/database/export`, {
    responseType: 'blob'
  }),

  // Get available options for dropdowns
  getAvailableOptions: () => api.get('/projects/options'),

  // Health check
  healthCheck: () => api.get('/health')
};

export default projectService;
