const ddevService = require('../services/ddevService');
const Joi = require('joi');

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().required().pattern(/^[a-zA-Z0-9-_]+$/).min(1).max(50),
  type: Joi.string().required().valid(...ddevService.getAvailableProjectTypes()),
  phpVersion: Joi.string().valid(...ddevService.getAvailablePhpVersions()),
  docroot: Joi.string().allow(''),
  directory: Joi.string().required(),
  database: Joi.string().valid(...ddevService.getAvailableDatabases()),
  webserverType: Joi.string().valid(...ddevService.getAvailableWebserverTypes())
});

const updateConfigSchema = Joi.object({
  php_version: Joi.string().valid(...ddevService.getAvailablePhpVersions()),
  database: Joi.string().valid(...ddevService.getAvailableDatabases()),
  webserver_type: Joi.string().valid(...ddevService.getAvailableWebserverTypes()),
  type: Joi.string().valid(...ddevService.getAvailableProjectTypes()),
  docroot: Joi.string().allow(''),
  router_http_port: Joi.number().integer().min(1).max(65535),
  router_https_port: Joi.number().integer().min(1).max(65535),
  additional_hostnames: Joi.array().items(Joi.string()),
  additional_fqdns: Joi.array().items(Joi.string()),
  web_environment: Joi.array().items(Joi.string()),
  upload_dirs: Joi.array().items(Joi.string()),
  nodejs_version: Joi.string(),
  composer_version: Joi.string(),
  xdebug_enabled: Joi.boolean(),
  use_dns_when_possible: Joi.boolean(),
  bind_all_interfaces: Joi.boolean()
});

class ProjectController {
  async getAllProjects(req, res, next) {
    try {
      console.log('Fetching all DDEV projects...');
      const projects = await ddevService.listProjects();
      
      res.json({
        success: true,
        data: projects || [],
        count: (projects || []).length,
        message: projects.length === 0 ? 'No DDEV projects found. Create your first project to get started!' : undefined
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      // If DDEV is not available, return a more user-friendly error
      if (error.message.includes('DDEV is not installed')) {
        return res.status(503).json({
          success: false,
          message: 'DDEV is not installed or not available. Please install DDEV first.',
          data: [],
          count: 0
        });
      }
      
      next(error);
    }
  }

  async getProject(req, res, next) {
    try {
      const { name } = req.params;
      console.log(`Fetching project details for: ${name}`);
      
      const [status, config] = await Promise.all([
        ddevService.getProjectStatus(name),
        ddevService.getProjectConfig(name)
      ]);
      
      res.json({
        success: true,
        data: {
          ...status,
          config
        }
      });
    } catch (error) {
      console.error(`Error fetching project ${req.params.name}:`, error);
      next(error);
    }
  }

  async createProject(req, res, next) {
    try {
      // Validate input
      const { error, value } = createProjectSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(d => d.message)
        });
      }

      console.log(`Creating new project: ${value.name}`);
      const result = await ddevService.createProject(value);
      
      res.status(201).json({
        success: true,
        message: `Project ${value.name} created successfully`,
        data: result
      });
    } catch (error) {
      console.error('Error creating project:', error);
      next(error);
    }
  }

  async startProject(req, res, next) {
    try {
      const { name } = req.params;
      console.log(`Starting project: ${name}`);
      
      const result = await ddevService.startProject(name);
      
      res.json({
        success: true,
        message: `Project ${name} started successfully`,
        data: result
      });
    } catch (error) {
      console.error(`Error starting project ${req.params.name}:`, error);
      next(error);
    }
  }

  async stopProject(req, res, next) {
    try {
      const { name } = req.params;
      console.log(`Stopping project: ${name}`);
      
      const result = await ddevService.stopProject(name);
      
      res.json({
        success: true,
        message: `Project ${name} stopped successfully`,
        data: result
      });
    } catch (error) {
      console.error(`Error stopping project ${req.params.name}:`, error);
      next(error);
    }
  }

  async restartProject(req, res, next) {
    try {
      const { name } = req.params;
      console.log(`Restarting project: ${name}`);
      
      const result = await ddevService.restartProject(name);
      
      res.json({
        success: true,
        message: `Project ${name} restarted successfully`,
        data: result
      });
    } catch (error) {
      console.error(`Error restarting project ${req.params.name}:`, error);
      next(error);
    }
  }

  async deleteProject(req, res, next) {
    try {
      const { name } = req.params;
      const { confirm } = req.query;
      
      if (confirm !== 'true') {
        return res.status(400).json({
          success: false,
          message: 'Project deletion requires confirmation. Add ?confirm=true to the request.'
        });
      }

      console.log(`Deleting project: ${name}`);
      const result = await ddevService.deleteProject(name);
      
      res.json({
        success: true,
        message: `Project ${name} deleted successfully`,
        data: result
      });
    } catch (error) {
      console.error(`Error deleting project ${req.params.name}:`, error);
      next(error);
    }
  }

  async getProjectConfig(req, res, next) {
    try {
      const { name } = req.params;
      console.log(`Fetching config for project: ${name}`);
      
      const config = await ddevService.getProjectConfig(name);
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error(`Error fetching config for ${req.params.name}:`, error);
      next(error);
    }
  }

  async updateProjectConfig(req, res, next) {
    try {
      const { name } = req.params;
      
      // Validate input
      const { error, value } = updateConfigSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details.map(d => d.message)
        });
      }

      console.log(`Updating config for project: ${name}`);
      const updatedConfig = await ddevService.updateProjectConfig(name, value);
      
      res.json({
        success: true,
        message: `Configuration updated for project ${name}`,
        data: updatedConfig
      });
    } catch (error) {
      console.error(`Error updating config for ${req.params.name}:`, error);
      next(error);
    }
  }

  async getProjectLogs(req, res, next) {
    try {
      const { name } = req.params;
      const { service = 'web', lines = 100 } = req.query;
      
      console.log(`Fetching logs for project: ${name}, service: ${service}`);
      const logs = await ddevService.getProjectLogs(name, service, parseInt(lines));
      
      res.json({
        success: true,
        data: {
          project: name,
          service,
          lines: parseInt(lines),
          logs
        }
      });
    } catch (error) {
      console.error(`Error fetching logs for ${req.params.name}:`, error);
      next(error);
    }
  }

  async getAvailableOptions(req, res, next) {
    try {
      res.json({
        success: true,
        data: {
          phpVersions: ddevService.getAvailablePhpVersions(),
          databases: ddevService.getAvailableDatabases(),
          projectTypes: ddevService.getAvailableProjectTypes(),
          webserverTypes: ddevService.getAvailableWebserverTypes()
        }
      });
    } catch (error) {
      console.error('Error fetching available options:', error);
      next(error);
    }
  }

  async importDatabase(req, res, next) {
    try {
      const { name } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No database file provided'
        });
      }

      console.log(`Importing database for project: ${name}`);
      const result = await ddevService.importDatabase(name, req.file.path);
      
      res.json({
        success: true,
        message: `Database imported successfully for project ${name}`,
        data: result
      });
    } catch (error) {
      console.error(`Error importing database for ${req.params.name}:`, error);
      next(error);
    }
  }

  async exportDatabase(req, res, next) {
    try {
      const { name } = req.params;
      const outputPath = `/tmp/${name}_database_${Date.now()}.sql.gz`;
      
      console.log(`Exporting database for project: ${name}`);
      await ddevService.exportDatabase(name, outputPath);
      
      // Send the file
      res.download(outputPath, `${name}_database.sql.gz`, (err) => {
        if (err) {
          console.error('Error sending database export:', err);
        }
        // Clean up the temporary file
        require('fs').unlink(outputPath, () => {});
      });
    } catch (error) {
      console.error(`Error exporting database for ${req.params.name}:`, error);
      next(error);
    }
  }
}

module.exports = new ProjectController();
