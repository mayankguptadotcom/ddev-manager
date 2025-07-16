import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onSidebarToggle={handleSidebarToggle} />
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Account for header height
          ml: sidebarOpen ? '240px' : '60px',
          transition: 'margin-left 0.3s ease',
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:name" element={<ProjectDetails />} />
          <Route path="/create-project" element={<CreateProject />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
