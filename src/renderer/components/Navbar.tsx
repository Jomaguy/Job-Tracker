import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Input, 
  InputGroup, 
  InputLeftElement,
  Stack,
  useColorMode,
  IconButton
} from '@chakra-ui/react';
import { SearchIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };

  return (
    <Box className="navbar" py={4} px={6} bg={colorMode === 'dark' ? 'gray.800' : 'white'} boxShadow="sm">
      <Flex justify="space-between" align="center">
        <Flex align="center">
          <Text fontSize="xl" fontWeight="bold" mr={8}>
            Job Tracker
          </Text>
          <Stack direction="row" spacing={4}>
            <Button
              as={Link}
              to="/"
              variant={isActive('/') ? 'solid' : 'ghost'}
              colorScheme={isActive('/') ? 'blue' : undefined}
            >
              Dashboard
            </Button>
            <Button
              as={Link}
              to="/jobs"
              variant={isActive('/jobs') ? 'solid' : 'ghost'}
              colorScheme={isActive('/jobs') ? 'blue' : undefined}
            >
              Job List
            </Button>
            <Button
              as={Link}
              to="/jobs/new"
              variant="outline"
              colorScheme="blue"
            >
              + Add Job
            </Button>
          </Stack>
        </Flex>

        <Flex align="center">
          <form onSubmit={handleSearch}>
            <InputGroup size="md" width="300px" mr={4}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                _focus={{ borderColor: 'blue.500' }}
                variant="filled"
              />
            </InputGroup>
          </form>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            ml={2}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 