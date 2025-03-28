import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { JobApplication } from '../../../shared/database';

// Define global window with our API
declare global {
  interface Window {
    api: {
      db: {
        init: () => Promise<any>;
        getAll: () => Promise<JobApplication[]>;
        getById: (id: string) => Promise<JobApplication | null>;
        add: (jobApp: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<JobApplication | null>;
        update: (jobApp: Partial<JobApplication> & { id: string }) => Promise<JobApplication | null>;
        delete: (id: string) => Promise<boolean>;
      }
    }
  }
}

// Define the initial state
interface JobApplicationsState {
  items: JobApplication[];
  selectedJobId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: JobApplicationsState = {
  items: [],
  selectedJobId: null,
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchJobApplications = createAsyncThunk(
  'jobApplications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching all job applications');
      const jobs = await window.api.db.getAll();
      console.log('Redux: Fetched jobs:', jobs);
      return jobs;
    } catch (error) {
      console.error('Redux: Error fetching job applications:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addJobApplication = createAsyncThunk(
  'jobApplications/add',
  async (jobApp: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      console.log('Redux: Adding job application:', jobApp);
      const newJob = await window.api.db.add(jobApp);
      console.log('Redux: New job added:', newJob);
      
      if (!newJob || (newJob as any).error) {
        throw new Error((newJob as any).message || 'Failed to add job application');
      }
      
      return newJob;
    } catch (error) {
      console.error('Redux: Error in addJobApplication thunk:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateJobApplication = createAsyncThunk(
  'jobApplications/update',
  async (jobApp: Partial<JobApplication> & { id: string }, { rejectWithValue }) => {
    try {
      console.log('Redux: Updating job application:', jobApp);
      const updatedJob = await window.api.db.update(jobApp);
      console.log('Redux: Job updated:', updatedJob);
      
      if (!updatedJob) {
        throw new Error(`Failed to update job application with ID ${jobApp.id}`);
      }
      
      return updatedJob;
    } catch (error) {
      console.error('Redux: Error updating job:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteJobApplication = createAsyncThunk(
  'jobApplications/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Redux: Deleting job application with ID:', id);
      const success = await window.api.db.delete(id);
      console.log('Redux: Delete result:', success);
      
      if (!success) {
        throw new Error(`Failed to delete job application with ID ${id}`);
      }
      
      return id;
    } catch (error) {
      console.error('Redux: Error deleting job:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Create slice
const jobApplicationsSlice = createSlice({
  name: 'jobApplications',
  initialState,
  reducers: {
    selectJob: (state, action: PayloadAction<string | null>) => {
      state.selectedJobId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all jobs
      .addCase(fetchJobApplications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch job applications';
      })
      
      // Add job
      .addCase(addJobApplication.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(addJobApplication.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add job application';
      })
      
      // Update job
      .addCase(updateJobApplication.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex(item => item.id === action.payload?.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      })
      .addCase(updateJobApplication.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update job application';
      })
      
      // Delete job
      .addCase(deleteJobApplication.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedJobId === action.payload) {
          state.selectedJobId = null;
        }
      })
      .addCase(deleteJobApplication.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete job application';
      });
  },
});

export const { selectJob, clearError } = jobApplicationsSlice.actions;
export default jobApplicationsSlice.reducer; 