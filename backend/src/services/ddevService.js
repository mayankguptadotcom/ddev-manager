const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const execAsync = promisify(exec);

class DDEVService {
  constructor() {
    this.projectCache = new Map();
    this.cacheTimeout = 5000; // 5 seconds cache
  }

  async executeCommand(command, options = {}) {
    try {
      console.log(`Executing DDEV command: ${command}`);
      const { stdout, stderr } = await execAsync(command, {
        timeout: 60000, // 60 seconds timeout
        ...options
      });
      
      if (stderr && !stderr.includes('Warning')) {
        console.warn(`DDEV command warning: ${stderr}`);
      }
      
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error(`DDEV command failed: ${command}`, error);
      throw new Error(`DDEV command failed: ${error.message}`);
    }
  }

  async listProjects() {
    try {
      const { stdout } = await this.executeCommand('ddev list --json-output');
      
      if (!stdout || stdout.trim() === '') {
        console.log('No DDEV projects found or empty response');
        return [];
      }

      let ddevOutput;
      try {
        ddevOutput = JSON.parse(stdout);
      } catch (parseError) {
        console.error('Failed to parse DDEV list output:', parseError);
        return [];
      }

      // DDEV returns an object with a 'raw' property containing the projects array
      let projects = ddevOutput.raw || ddevOutput;
      
      // Handle case where projects might be null or not an array
      if (!Array.isArray(projects)) {
        console.log('DDEV list returned non-array result:', projects);
        return [];
      }
      
      // Enhance projects with additional information
      const enhancedProjects = await Promise.all(
        projects.map(async (project) => {
          try {
            const config = await this.getProjectConfig(project.name);
            return {
              ...project,
              config: {
                php_version: config.php_version || '8.3',
                database: config.database || 'mariadb:10.11',
                webserver_type: config.webserver_type || 'nginx-fpm',
                type: config.type || 'php',
                docroot: config.docroot || '',
                router_http_port: config.router_http_port || 80,
                router_https_port: config.router_https_port || 443
              }
            };
          } catch (error) {
            console.warn(`Could not load config for project ${project.name}:`, error.message);
            return {
              ...project,
              config: {
                php_version: 'Unknown',
                database: 'Unknown',
                webserver_type: 'Unknown',
                type: 'Unknown',
                docroot: '',
                router_http_port: 80,
                router_https_port: 443
              }
            };
          }
        })
      );

      return enhancedProjects;
    } catch (error) {
      console.error('Failed to list projects:', error);
      
      // Check if DDEV is available
      if (error.message.includes('command not found') || error.message.includes('not recognized')) {
        throw new Error('DDEV is not installed or not available in PATH. Please install DDEV first.');
      }
      
      // Return empty array for other errors to prevent complete failure
      console.warn('Returning empty project list due to error:', error.message);
      return [];
    }
  }

  async getProjectStatus(projectName) {
    try {
      const { stdout } = await this.executeCommand(`ddev describe ${projectName} --json-output`);
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`Failed to get project status for ${projectName}: ${error.message}`);
    }
  }

  async getProjectConfig(projectName) {
    const cacheKey = `config_${projectName}`;
    const cached = this.projectCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // First try to get the project info to find its location
      const projects = await this.executeCommand('ddev list --json-output');
      const ddevOutput = JSON.parse(projects.stdout);
      const projectList = ddevOutput.raw || ddevOutput;
      const project = projectList.find(p => p.name === projectName);
      
      if (!project) {
        throw new Error(`Project ${projectName} not found`);
      }

      const configPath = path.join(project.approot, '.ddev', 'config.yaml');
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = yaml.load(configContent);
      
      // Cache the result
      this.projectCache.set(cacheKey, {
        data: config,
        timestamp: Date.now()
      });
      
      return config;
    } catch (error) {
      throw new Error(`Failed to read config for ${projectName}: ${error.message}`);
    }
  }

  async updateProjectConfig(projectName, configUpdates) {
    try {
      // Get current config
      const currentConfig = await this.getProjectConfig(projectName);
      
      // Merge updates
      const updatedConfig = { ...currentConfig, ...configUpdates };
      
      // Get project info to find location
      const projects = await this.executeCommand('ddev list --json-output');
      const ddevOutput = JSON.parse(projects.stdout);
      const projectList = ddevOutput.raw || ddevOutput;
      const project = projectList.find(p => p.name === projectName);
      
      if (!project) {
        throw new Error(`Project ${projectName} not found`);
      }

      const configPath = path.join(project.approot, '.ddev', 'config.yaml');
      const yamlContent = yaml.dump(updatedConfig, { 
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });
      
      await fs.writeFile(configPath, yamlContent, 'utf8');
      
      // Clear cache
      this.projectCache.delete(`config_${projectName}`);
      
      // Broadcast update to connected clients
      if (global.broadcast) {
        global.broadcast({
          type: 'project_config_updated',
          project: projectName,
          config: updatedConfig
        });
      }
      
      return updatedConfig;
    } catch (error) {
      throw new Error(`Failed to update config for ${projectName}: ${error.message}`);
    }
  }

  async startProject(projectName) {
    try {
      const result = await this.executeCommand(`ddev start ${projectName}`);
      
      // Broadcast update
      if (global.broadcast) {
        global.broadcast({
          type: 'project_status_changed',
          project: projectName,
          status: 'starting'
        });
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to start project ${projectName}: ${error.message}`);
    }
  }

  async stopProject(projectName) {
    try {
      const result = await this.executeCommand(`ddev stop ${projectName}`);
      
      // Broadcast update
      if (global.broadcast) {
        global.broadcast({
          type: 'project_status_changed',
          project: projectName,
          status: 'stopped'
        });
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to stop project ${projectName}: ${error.message}`);
    }
  }

  async restartProject(projectName) {
    try {
      const result = await this.executeCommand(`ddev restart ${projectName}`);
      
      // Broadcast update
      if (global.broadcast) {
        global.broadcast({
          type: 'project_status_changed',
          project: projectName,
          status: 'restarting'
        });
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to restart project ${projectName}: ${error.message}`);
    }
  }

  async createProject(projectData) {
    const { name, type, phpVersion, docroot, directory, database, webserverType } = projectData;
    
    try {
      // Build the config command
      let configCmd = `cd "${directory}" && ddev config --project-name="${name}" --project-type="${type}" --auto`;
      
      if (phpVersion) {
        configCmd += ` --php-version="${phpVersion}"`;
      }
      
      if (docroot) {
        configCmd += ` --docroot="${docroot}"`;
      }
      
      if (database) {
        configCmd += ` --database="${database}"`;
      }
      
      if (webserverType) {
        configCmd += ` --webserver-type="${webserverType}"`;
      }
      
      const result = await this.executeCommand(configCmd);
      
      // Broadcast update
      if (global.broadcast) {
        global.broadcast({
          type: 'project_created',
          project: name
        });
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to create project ${name}: ${error.message}`);
    }
  }

  async deleteProject(projectName) {
    try {
      const result = await this.executeCommand(`ddev delete ${projectName} --omit-snapshot --yes`);
      
      // Clear cache
      this.projectCache.delete(`config_${projectName}`);
      
      // Broadcast update
      if (global.broadcast) {
        global.broadcast({
          type: 'project_deleted',
          project: projectName
        });
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to delete project ${projectName}: ${error.message}`);
    }
  }

  async importDatabase(projectName, filePath) {
    try {
      const result = await this.executeCommand(`ddev import-db ${projectName} --file="${filePath}"`);
      
      // Broadcast update
      if (global.broadcast) {
        global.broadcast({
          type: 'database_imported',
          project: projectName
        });
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to import database for ${projectName}: ${error.message}`);
    }
  }

  async exportDatabase(projectName, outputPath) {
    try {
      const result = await this.executeCommand(`ddev export-db ${projectName} --file="${outputPath}"`);
      return result;
    } catch (error) {
      throw new Error(`Failed to export database for ${projectName}: ${error.message}`);
    }
  }

  async getProjectLogs(projectName, service = 'web', lines = 100) {
    try {
      const result = await this.executeCommand(`ddev logs ${projectName} --service=${service} --tail=${lines}`);
      return result.stdout;
    } catch (error) {
      throw new Error(`Failed to get logs for ${projectName}: ${error.message}`);
    }
  }

  // Get available PHP versions
  getAvailablePhpVersions() {
    return ['5.6', '7.0', '7.1', '7.2', '7.3', '7.4', '8.0', '8.1', '8.2', '8.3', '8.4'];
  }

  // Get available database types
  getAvailableDatabases() {
    return [
      'mariadb:5.5', 'mariadb:10.0', 'mariadb:10.1', 'mariadb:10.2', 'mariadb:10.3', 
      'mariadb:10.4', 'mariadb:10.5', 'mariadb:10.6', 'mariadb:10.7', 'mariadb:10.8', 
      'mariadb:10.11', 'mariadb:11.4',
      'mysql:5.5', 'mysql:5.6', 'mysql:5.7', 'mysql:8.0',
      'postgres:9', 'postgres:10', 'postgres:11', 'postgres:12', 'postgres:13', 
      'postgres:14', 'postgres:15'
    ];
  }

  // Get available project types
  getAvailableProjectTypes() {
    return [
      'backdrop', 'cakephp', 'craftcms', 'drupal', 'drupal6', 'drupal7', 'drupal8', 
      'drupal9', 'drupal10', 'drupal11', 'generic', 'laravel', 'magento', 'magento2', 
      'php', 'shopware6', 'silverstripe', 'symfony', 'typo3', 'wordpress'
    ];
  }

  // Get available webserver types
  getAvailableWebserverTypes() {
    return ['nginx-fpm', 'apache-fpm', 'generic'];
  }
}

module.exports = new DDEVService();
