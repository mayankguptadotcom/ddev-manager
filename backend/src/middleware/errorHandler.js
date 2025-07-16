const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error',
    status: 500
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.status = 400;
    error.details = err.details;
  }

  // DDEV command errors
  if (err.message.includes('DDEV command failed')) {
    error.message = 'DDEV Operation Failed';
    error.status = 500;
    error.details = err.message;
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File too large';
    error.status = 400;
  }

  if (err.message.includes('Invalid file type')) {
    error.message = err.message;
    error.status = 400;
  }

  // Project not found errors
  if (err.message.includes('not found')) {
    error.message = 'Resource not found';
    error.status = 404;
  }

  // Permission errors
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    error.message = 'Permission denied';
    error.status = 403;
  }

  // Timeout errors
  if (err.code === 'ETIMEDOUT') {
    error.message = 'Operation timed out';
    error.status = 408;
  }

  // Send error response
  res.status(error.status).json({
    success: false,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.message 
    })
  });
};

module.exports = errorHandler;
