import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box, VStack } from '@chakra-ui/react';
import { useAppDispatch } from './hooks/redux';
import { fetchJobApplications } from './store/slices/jobApplicationsSlice';
import { Navbar } from './components';
import { Dashboard, JobList, JobForm, NotFound } from './pages';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  // Fetch job applications on initial load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('App: Initializing database');
        await window.api.db.init();
        console.log('App: Database initialized, fetching job applications');
        dispatch(fetchJobApplications());
      } catch (error) {
        console.error('App: Error initializing:', error);
      }
    };

    initializeApp();
  }, [dispatch]);

  return (
    <Box className="app-container">
      <Navbar />
      <VStack spacing={4} align="stretch" p={4}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/new" element={<JobForm />} />
          <Route path="/jobs/:id" element={<JobForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </VStack>
    </Box>
  );
};

export default App; 