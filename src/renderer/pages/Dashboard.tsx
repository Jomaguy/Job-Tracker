import React from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Flex, Text } from '@chakra-ui/react';
import { useAppSelector } from '../hooks/redux';
import { JobStatus } from '../../shared/database';

// Helper function to get status counts
const getStatusCounts = (jobs: any[]) => {
  const counts = {
    applied: 0,
    interviews: 0,
    offers: 0,
    rejected: 0,
    ghosted: 0
  };

  jobs.forEach(job => {
    if (job.status === 'ghosted') {
      counts.ghosted++;
    } else if (job.status.startsWith('rejected_')) {
      counts.rejected++;
    } else if (job.status === 'offer_received' || job.status === 'offer_accepted' || job.status === 'offer_declined') {
      counts.offers++;
    } else if (job.status.startsWith('interviewing_')) {
      counts.interviews++;
    } else {
      counts.applied++;
    }
  });

  return counts;
};

const Dashboard: React.FC = () => {
  const { items: jobs } = useAppSelector(state => state.jobApplications);
  const statusCounts = getStatusCounts(jobs);

  // Calculate some metrics
  const totalApplications = jobs.length;
  const interviewRate = totalApplications ? Math.round((statusCounts.interviews / totalApplications) * 100) : 0;
  const offerRate = statusCounts.interviews ? Math.round((statusCounts.offers / statusCounts.interviews) * 100) : 0;
  
  // Sort jobs by date applied (most recent first)
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
    .slice(0, 5);

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6}>Dashboard</Heading>
      
      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
        <Box className="dashboard-widget">
          <Stat>
            <StatLabel>Applications</StatLabel>
            <StatNumber>{totalApplications}</StatNumber>
            <StatHelpText>Total job applications</StatHelpText>
          </Stat>
        </Box>
        
        <Box className="dashboard-widget">
          <Stat>
            <StatLabel>Interviews</StatLabel>
            <StatNumber>{statusCounts.interviews}</StatNumber>
            <StatHelpText>{interviewRate}% interview rate</StatHelpText>
          </Stat>
        </Box>
        
        <Box className="dashboard-widget">
          <Stat>
            <StatLabel>Offers</StatLabel>
            <StatNumber>{statusCounts.offers}</StatNumber>
            <StatHelpText>{offerRate}% conversion rate</StatHelpText>
          </Stat>
        </Box>
        
        <Box className="dashboard-widget">
          <Stat>
            <StatLabel>Rejections</StatLabel>
            <StatNumber>{statusCounts.rejected}</StatNumber>
            <StatHelpText>Including {statusCounts.ghosted} ghosted</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>
      
      {/* Recent Applications */}
      <Box className="dashboard-widget" mb={8}>
        <Heading as="h2" size="md" mb={4}>Recent Applications</Heading>
        {recentJobs.length > 0 ? (
          recentJobs.map(job => (
            <Box 
              key={job.id} 
              p={4} 
              mb={2} 
              borderWidth="1px" 
              borderRadius="md"
              _hover={{ bg: 'gray.50', dark: { bg: 'gray.700' } }}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold">{job.jobTitle}</Text>
                  <Text fontSize="sm">{job.companyName}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(job.dateApplied).toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" color="blue.500">
                    {job.status.replace(/_/g, ' ')}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))
        ) : (
          <Text>No applications yet. Start by adding your first job application!</Text>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard; 