# DDEV Manager

A modern GUI application for managing DDEV projects, built with React and Node.js.

## Features

### Phase 1 (Current)
- **Project Dashboard**: View all DDEV projects with status indicators
- **Project Management**: Start, stop, restart, and delete projects
- **Project Creation**: Create new DDEV projects with customizable settings
- **Project Details**: View detailed project information and configuration
- **Real-time Status**: Auto-refreshing project status and health monitoring
- **Modern UI**: Clean, responsive interface built with Material-UI

### Planned Features (Future Phases)
- Advanced configuration management
- Database import/export functionality
- Log viewing and monitoring
- Add-on management
- Multi-environment support
- Project templates
- Backup and restore functionality

## Prerequisites

- **DDEV**: Must be installed and accessible via command line
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mayankguptadotcom/ddev-manager.git
cd ddev-manager
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:3001

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```
The frontend will run on http://localhost:3000

### Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend in production mode:
```bash
cd backend
npm start
```

The application will be available at http://localhost:3001

## Project Structure

```
ddev-manager/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic and DDEV integration
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── server.js           # Entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/
│   └── package.json
├── database/               # Database files (if needed)
└── README.md
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:name` - Get project details
- `POST /api/projects` - Create new project
- `POST /api/projects/:name/start` - Start project
- `POST /api/projects/:name/stop` - Stop project
- `POST /api/projects/:name/restart` - Restart project
- `DELETE /api/projects/:name` - Delete project

### Configuration
- `GET /api/projects/:name/config` - Get project configuration
- `PUT /api/projects/:name/config` - Update project configuration
- `GET /api/projects/options` - Get available options (PHP versions, databases, etc.)

### Health
- `GET /api/health` - API health check

## Configuration

### Environment Variables

Backend (`.env` file in backend directory):
```
NODE_ENV=development
PORT=3001
DDEV_TIMEOUT=60000
```

Frontend (`.env` file in frontend directory):
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Troubleshooting

### Common Issues

1. **DDEV not found**: Ensure DDEV is installed and in your PATH
2. **Permission errors**: Make sure you have proper permissions to run DDEV commands
3. **Port conflicts**: Change the port in the environment variables if needed
4. **API connection issues**: Check that the backend is running and accessible

### Logs

Backend logs are displayed in the console when running in development mode.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the DDEV documentation: https://ddev.readthedocs.io/

## Roadmap

### Phase 2
- Database management (import/export)
- Log viewer
- Configuration editor
- Add-on management

### Phase 3
- Project templates
- Backup/restore functionality
- Multi-environment support
- Advanced monitoring

### Phase 4
- Team collaboration features
- Cloud integration
- Performance monitoring
- Advanced automation
