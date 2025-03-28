import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// We need to use the require syntax for electron to avoid TypeScript issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const electron = require('electron');

// Define JobApplication type
export type RejectionStage = 
  | 'rejected_application' 
  | 'rejected_resume_screening'
  | 'rejected_phone_screen'
  | 'rejected_technical_interview'
  | 'rejected_onsite'
  | 'rejected_final_round'
  | 'rejected_offer_negotiation';

export type JobStatus = 
  | RejectionStage
  | 'interviewing_phone_screen'
  | 'interviewing_technical'
  | 'interviewing_onsite'
  | 'interviewing_final_round'
  | 'ghosted'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined';

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  dateApplied: string; // ISO format date string
  jobLink: string;
  status: JobStatus;
  notes?: string;
  industry?: string;
  location?: string;
  salary?: string;
  createdAt: string;
  updatedAt: string;
}

// Use electron's app.getPath to get the user data directory instead of os.homedir
let userDataPath: string;
try {
  // Try to use electron's app.getPath
  const app = electron.app || (electron.remote && electron.remote.app);
  if (app) {
    userDataPath = path.join(app.getPath('userData'), 'database');
    console.log('Using Electron userData path:', userDataPath);
  } else {
    // Fallback for when we can't access electron.app
    userDataPath = path.join(os.homedir(), '.job-tracker');
    console.log('Using fallback path:', userDataPath);
  }
} catch (error) {
  // Final fallback
  userDataPath = path.join(os.homedir(), '.job-tracker');
  console.log('Error getting userData path, using fallback:', userDataPath, error);
}

const dbPath = path.join(userDataPath, 'job-tracker.json');
console.log('Database file path:', dbPath);

// Create user data directory if it doesn't exist
try {
  if (!fs.existsSync(userDataPath)) {
    console.log('Creating directory:', userDataPath);
    fs.mkdirSync(userDataPath, { recursive: true });
    console.log('Directory created successfully');
  } else {
    console.log('Directory already exists');
  }
} catch (error) {
  console.error('Error creating directory:', error);
  throw error;
}

// In-memory job applications array
let jobApplications: JobApplication[] = [];

// Initialize database
export function initDatabase(): void {
  try {
    // Check if database file exists
    if (fs.existsSync(dbPath)) {
      // Read from file
      const data = fs.readFileSync(dbPath, 'utf8');
      jobApplications = JSON.parse(data);
    } else {
      // Create new database file
      fs.writeFileSync(dbPath, JSON.stringify([]));
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Save data to file
function saveToFile(): void {
  try {
    console.log('Saving data to:', dbPath);
    fs.writeFileSync(dbPath, JSON.stringify(jobApplications, null, 2));
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving database:', error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
}

// Database operations
export function getJobApplications(): JobApplication[] {
  return jobApplications;
}

export function getJobApplicationById(id: string): JobApplication | null {
  return jobApplications.find(job => job.id === id) || null;
}

export function addJobApplication(jobApp: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): string {
  try {
    console.log('Adding job application:', jobApp);
    const id = generateId();
    const now = new Date().toISOString();
    
    const newJob: JobApplication = {
      id,
      ...jobApp,
      createdAt: now,
      updatedAt: now
    };
    
    console.log('New job object:', newJob);
    jobApplications.unshift(newJob);
    saveToFile();
    
    return id;
  } catch (error) {
    console.error('Error adding job application:', error);
    throw error;
  }
}

export function updateJobApplication(jobApp: Partial<JobApplication> & { id: string }): boolean {
  try {
    const index = jobApplications.findIndex(job => job.id === jobApp.id);
    
    if (index === -1) {
      return false;
    }
    
    const now = new Date().toISOString();
    jobApplications[index] = {
      ...jobApplications[index],
      ...jobApp,
      updatedAt: now
    };
    
    saveToFile();
    return true;
  } catch (error) {
    console.error(`Error updating job application with ID ${jobApp.id}:`, error);
    return false;
  }
}

export function deleteJobApplication(id: string): boolean {
  try {
    const initialLength = jobApplications.length;
    jobApplications = jobApplications.filter(job => job.id !== id);
    
    if (jobApplications.length < initialLength) {
      saveToFile();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error deleting job application with ID ${id}:`, error);
    return false;
  }
}

// Helper function to generate a random ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 