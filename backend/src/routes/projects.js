const express = require('express');
const multer = require('multer');
const path = require('path');
const projectController = require('../controllers/projectController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for database files
  },
  fileFilter: (req, file, cb) => {
    // Allow common database file extensions
    const allowedExtensions = ['.sql', '.gz', '.zip', '.tar', '.bz2', '.xz'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension) || 
        file.originalname.includes('.sql.') || 
        file.originalname.includes('.tar.')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only database files are allowed.'), false);
    }
  }
});

// Project routes
router.get('/', projectController.getAllProjects);
router.get('/options', projectController.getAvailableOptions);
router.get('/:name', projectController.getProject);
router.get('/:name/config', projectController.getProjectConfig);
router.get('/:name/logs', projectController.getProjectLogs);

router.post('/', projectController.createProject);
router.put('/:name/config', projectController.updateProjectConfig);

// Project lifecycle operations
router.post('/:name/start', projectController.startProject);
router.post('/:name/stop', projectController.stopProject);
router.post('/:name/restart', projectController.restartProject);
router.delete('/:name', projectController.deleteProject);

// Database operations
router.post('/:name/database/import', upload.single('database'), projectController.importDatabase);
router.get('/:name/database/export', projectController.exportDatabase);

module.exports = router;
