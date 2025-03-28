import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  IconButton,
  Flex,
  Text,
  Select,
  HStack,
  useToast
} from '@chakra-ui/react';
import { ChevronDownIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { deleteJobApplication, selectJob } from '../store/slices/jobApplicationsSlice';
import { JobApplication, JobStatus } from '../../shared/database';

// Get color for status badges
const getStatusColor = (status: JobStatus): string => {
  if (status.startsWith('rejected_')) return 'red';
  if (status.startsWith('interviewing_')) return 'blue';
  if (status === 'offer_received' || status === 'offer_accepted') return 'green';
  if (status === 'offer_declined') return 'yellow';
  if (status === 'ghosted') return 'gray';
  return 'purple';
};

// Format status for display
const formatStatus = (status: JobStatus): string => {
  return status.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
};

const JobList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { items: jobs, status, error } = useAppSelector(state => state.jobApplications);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Sort state
  const [sortField, setSortField] = useState<keyof JobApplication>('dateApplied');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Handle sorting
  const handleSort = (field: keyof JobApplication) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filtered and sorted jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => {
        // Apply search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          job.companyName.toLowerCase().includes(searchLower) ||
          job.jobTitle.toLowerCase().includes(searchLower) ||
          (job.location && job.location.toLowerCase().includes(searchLower)) ||
          (job.notes && job.notes.toLowerCase().includes(searchLower));
        
        // Apply status filter
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'rejected' && job.status.startsWith('rejected_')) ||
          (statusFilter === 'interviewing' && job.status.startsWith('interviewing_')) ||
          (statusFilter === 'offers' && (
            job.status === 'offer_received' || 
            job.status === 'offer_accepted' || 
            job.status === 'offer_declined'
          )) ||
          job.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Handle date fields differently
        if (sortField === 'dateApplied' || sortField === 'createdAt' || sortField === 'updatedAt') {
          const dateA = new Date(a[sortField]).getTime();
          const dateB = new Date(b[sortField]).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        // Handle string fields
        const valueA = (a[sortField] || '').toString().toLowerCase();
        const valueB = (b[sortField] || '').toString().toLowerCase();
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [jobs, searchQuery, statusFilter, sortField, sortDirection]);
  
  // Handle job deletion
  const handleDeleteJob = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await dispatch(deleteJobApplication(id)).unwrap();
        toast({
          title: 'Job deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error deleting job',
          description: 'An error occurred while deleting the job application.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };
  
  // Handle job edit
  const handleEditJob = (job: JobApplication) => {
    dispatch(selectJob(job.id));
    navigate(`/jobs/${job.id}`);
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg">Job Applications</Heading>
        <Button
          as={Link}
          to="/jobs/new"
          colorScheme="blue"
        >
          + Add New Job
        </Button>
      </Flex>
      
      {/* Filters */}
      <Flex mb={4} wrap="wrap" gap={4}>
        <Input
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          width={{ base: 'full', md: '300px' }}
        />
        
        <Select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          width={{ base: 'full', md: '200px' }}
        >
          <option value="all">All Statuses</option>
          <option value="interviewing">Interviewing</option>
          <option value="rejected">Rejected</option>
          <option value="offers">Offers</option>
          <option value="ghosted">Ghosted</option>
        </Select>
      </Flex>
      
      {status === 'loading' && <Text>Loading job applications...</Text>}
      {error && <Text color="red.500">Error: {error}</Text>}
      
      {status !== 'loading' && filteredJobs.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text fontSize="lg" mb={4}>No job applications found.</Text>
          <Button as={Link} to="/jobs/new" colorScheme="blue">
            Add Your First Job Application
          </Button>
        </Box>
      )}
      
      {filteredJobs.length > 0 && (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSort('companyName')}
                >
                  Company
                  {sortField === 'companyName' && (
                    <span> {sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Th>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSort('jobTitle')}
                >
                  Job Title
                  {sortField === 'jobTitle' && (
                    <span> {sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Th>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSort('dateApplied')}
                >
                  Date Applied
                  {sortField === 'dateApplied' && (
                    <span> {sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Th>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' && (
                    <span> {sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredJobs.map(job => (
                <Tr key={job.id} _hover={{ bg: 'gray.50', dark: { bg: 'gray.700' } }}>
                  <Td>{job.companyName}</Td>
                  <Td>{job.jobTitle}</Td>
                  <Td>{new Date(job.dateApplied).toLocaleDateString()}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(job.status)}>
                      {formatStatus(job.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit job"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      />
                      <IconButton
                        aria-label="Delete job"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteJob(job.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default JobList; 