import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  FormErrorMessage,
  VStack,
  HStack,
  useToast,
  Divider
} from '@chakra-ui/react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { 
  addJobApplication, 
  updateJobApplication,
  selectJob
} from '../store/slices/jobApplicationsSlice';
import { JobStatus } from '../../shared/database';

interface FormValues {
  companyName: string;
  jobTitle: string;
  dateApplied: string;
  jobLink: string;
  status: JobStatus;
  notes: string;
  industry: string;
  location: string;
  salary: string;
}

interface FormErrors {
  companyName?: string;
  jobTitle?: string;
  dateApplied?: string;
  status?: string;
}

// Format date to YYYY-MM-DD for input type="date"
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const JobForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  const isEditing = !!id;
  const { items: jobs } = useAppSelector(state => state.jobApplications);
  const jobToEdit = isEditing ? jobs.find(job => job.id === id) : null;
  
  // Form values
  const [values, setValues] = useState<FormValues>({
    companyName: '',
    jobTitle: '',
    dateApplied: formatDateForInput(new Date().toISOString()),
    jobLink: '',
    status: 'interviewing_phone_screen',
    notes: '',
    industry: '',
    location: '',
    salary: ''
  });
  
  // Form errors
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Initialize form with job data if editing
  useEffect(() => {
    if (isEditing && jobToEdit) {
      setValues({
        companyName: jobToEdit.companyName,
        jobTitle: jobToEdit.jobTitle,
        dateApplied: formatDateForInput(jobToEdit.dateApplied),
        jobLink: jobToEdit.jobLink,
        status: jobToEdit.status,
        notes: jobToEdit.notes || '',
        industry: jobToEdit.industry || '',
        location: jobToEdit.location || '',
        salary: jobToEdit.salary || ''
      });
      
      // Select job in store
      dispatch(selectJob(id));
    }
  }, [isEditing, jobToEdit, id, dispatch]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!values.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!values.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    
    if (!values.dateApplied) {
      newErrors.dateApplied = 'Date applied is required';
    }
    
    if (!values.status) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }
    
    try {
      console.log('Submitting form with values:', values);
      
      if (isEditing && id) {
        // Update existing job
        await dispatch(updateJobApplication({
          id,
          ...values,
          dateApplied: new Date(values.dateApplied).toISOString()
        })).unwrap();
        
        toast({
          title: 'Job updated',
          description: 'Job application updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new job
        console.log('Adding new job with data:', {
          ...values,
          dateApplied: new Date(values.dateApplied).toISOString()
        });
        
        await dispatch(addJobApplication({
          ...values,
          dateApplied: new Date(values.dateApplied).toISOString()
        })).unwrap();
        
        toast({
          title: 'Job added',
          description: 'New job application added successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Navigate back to job list
      navigate('/jobs');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} job application.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Box maxW="800px" mx="auto">
      <Heading as="h1" size="lg" mb={6}>
        {isEditing ? 'Edit Job Application' : 'Add New Job Application'}
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* Basic Information */}
          <Box>
            <Heading as="h2" size="md" mb={4}>Basic Information</Heading>
            
            <FormControl isRequired isInvalid={!!errors.companyName} mb={4}>
              <FormLabel>Company Name</FormLabel>
              <Input 
                name="companyName" 
                value={values.companyName} 
                onChange={handleChange} 
                placeholder="Company Name"
              />
              <FormErrorMessage>{errors.companyName}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.jobTitle} mb={4}>
              <FormLabel>Job Title</FormLabel>
              <Input 
                name="jobTitle" 
                value={values.jobTitle} 
                onChange={handleChange} 
                placeholder="Job Title"
              />
              <FormErrorMessage>{errors.jobTitle}</FormErrorMessage>
            </FormControl>
            
            <HStack spacing={4} mb={4}>
              <FormControl isRequired isInvalid={!!errors.dateApplied}>
                <FormLabel>Date Applied</FormLabel>
                <Input 
                  name="dateApplied" 
                  type="date" 
                  value={values.dateApplied} 
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.dateApplied}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input 
                  name="location" 
                  value={values.location} 
                  onChange={handleChange} 
                  placeholder="City, State or Remote"
                />
              </FormControl>
            </HStack>
            
            <FormControl mb={4}>
              <FormLabel>Job Posting URL</FormLabel>
              <Input 
                name="jobLink" 
                value={values.jobLink} 
                onChange={handleChange} 
                placeholder="https://example.com/job-posting"
              />
            </FormControl>
          </Box>
          
          <Divider />
          
          {/* Additional Information */}
          <Box>
            <Heading as="h2" size="md" mb={4}>Additional Information</Heading>
            
            <HStack spacing={4} mb={4}>
              <FormControl isRequired isInvalid={!!errors.status}>
                <FormLabel>Application Status</FormLabel>
                <Select 
                  name="status" 
                  value={values.status} 
                  onChange={handleChange}
                >
                  <option value="interviewing_phone_screen">Interviewing - Phone Screen</option>
                  <option value="interviewing_technical">Interviewing - Technical</option>
                  <option value="interviewing_onsite">Interviewing - Onsite</option>
                  <option value="interviewing_final_round">Interviewing - Final Round</option>
                  <option value="offer_received">Offer Received</option>
                  <option value="offer_accepted">Offer Accepted</option>
                  <option value="offer_declined">Offer Declined</option>
                  <option value="rejected_application">Rejected - Application</option>
                  <option value="rejected_resume_screening">Rejected - Resume Screening</option>
                  <option value="rejected_phone_screen">Rejected - Phone Screen</option>
                  <option value="rejected_technical_interview">Rejected - Technical Interview</option>
                  <option value="rejected_onsite">Rejected - Onsite</option>
                  <option value="rejected_final_round">Rejected - Final Round</option>
                  <option value="rejected_offer_negotiation">Rejected - Offer Negotiation</option>
                  <option value="ghosted">Ghosted</option>
                </Select>
                <FormErrorMessage>{errors.status}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Industry</FormLabel>
                <Input 
                  name="industry" 
                  value={values.industry} 
                  onChange={handleChange} 
                  placeholder="e.g., Tech, Finance, Healthcare"
                />
              </FormControl>
            </HStack>
            
            <FormControl mb={4}>
              <FormLabel>Salary Information</FormLabel>
              <Input 
                name="salary" 
                value={values.salary} 
                onChange={handleChange} 
                placeholder="e.g., $80,000 - $100,000"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Notes</FormLabel>
              <Textarea 
                name="notes" 
                value={values.notes} 
                onChange={handleChange} 
                placeholder="Add any notes about the application, interview process, etc."
                rows={5}
              />
            </FormControl>
          </Box>
          
          <HStack spacing={4} justify="flex-end">
            <Button
              onClick={() => navigate('/jobs')}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
            >
              {isEditing ? 'Update Job' : 'Add Job'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default JobForm; 