import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <Box textAlign="center" py={10} px={6}>
      <VStack spacing={6}>
        <Heading
          display="inline-block"
          as="h1"
          size="4xl"
          bgGradient="linear(to-r, blue.400, blue.600)"
          backgroundClip="text"
        >
          404
        </Heading>
        
        <Heading as="h2" size="xl" mt={6} mb={2}>
          Page Not Found
        </Heading>
        
        <Text color="gray.500" mb={6}>
          The page you're looking for doesn't seem to exist.
        </Text>
        
        <Button
          as={Link}
          to="/"
          colorScheme="blue"
          bgGradient="linear(to-r, blue.400, blue.600)"
          _hover={{
            bgGradient: 'linear(to-r, blue.500, blue.700)',
          }}
        >
          Go to Dashboard
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound; 