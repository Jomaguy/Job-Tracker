# Job Tracker

A minimalist, elegant desktop application to track and manage job applications.

## Features

- **Dashboard**: See an overview of your job application statistics.
- **Job List**: View, filter, and sort all your job applications.
- **Application Management**: Add, edit, and delete job applications with detailed information.
- **Status Tracking**: Track the progress of each job application through various stages.
- **Local Storage**: All data is stored locally on your computer.

## Technology Stack

- **Frontend**: React 18 with TypeScript for type safety and component-based architecture
- **State Management**: Redux Toolkit for predictable state management with async thunks
- **UI Components**: Chakra UI for a consistent, accessible component library
- **Styling**: Tailwind CSS for utility-first styling
- **Desktop Runtime**: Electron for cross-platform desktop applications
- **Local Storage**: JSON file-based storage via Node.js fs module
- **Build Tools**: Vite for fast development and optimized builds

## Architecture Overview

### Electron Architecture

The application follows the Electron architecture with three main components:

1. **Main Process** (`electron/main.js`)
   - Controls the application lifecycle
   - Creates browser windows
   - Manages file system access
   - Handles IPC (Inter-Process Communication) with the renderer

2. **Preload Script** (`electron/preload.js`)
   - Acts as a secure bridge between renderer and main processes
   - Exposes limited API to the renderer process
   - Uses Electron's contextBridge to expose IPC communication

3. **Renderer Process** (`src/renderer/*`)
   - React application rendered in Electron's browser window
   - User interface implementation
   - Communicates with main process through the exposed API

### Data Flow Architecture

The application uses a unidirectional data flow:

1. **User Interaction** → Triggers action in React components
2. **Redux Action** → Dispatched from components 
3. **Async Thunk** → Makes IPC calls to main process
4. **Main Process** → Performs file system operations
5. **Database API** → Reads/writes to the JSON file
6. **Redux Store Update** → Updates state based on the operation result
7. **UI Update** → React components re-render with new state

## Project Structure

```
job-tracker/
├── electron/                    # Electron-specific code
│   ├── main.js                  # Electron main process
│   └── preload.js               # Preload script for IPC bridge
├── src/
│   ├── main/                    # Main process TypeScript code
│   ├── renderer/                # React application (renderer process)
│   │   ├── components/          # UI components
│   │   │   ├── dashboard/       # Dashboard-specific components
│   │   │   ├── job-form/        # Job application form components
│   │   │   └── job-list/        # Job listing components
│   │   ├── pages/               # Application pages
│   │   ├── store/               # Redux state management
│   │   │   └── slices/          # Redux Toolkit slices
│   │   ├── hooks/               # Custom React hooks
│   │   ├── styles.css           # Global styles with Tailwind
│   │   └── App.tsx              # Main React component
│   └── shared/                  # Shared code between processes
│       └── database.ts          # Database interface and types
├── public/                      # Static assets
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project dependencies and scripts
```

## IPC Communication

The application uses Electron's IPC (Inter-Process Communication) to securely communicate between the renderer and main processes:

1. **Main Process** (`electron/main.js`) registers IPC handlers:
   ```javascript
   ipcMain.handle('db-operation', async (event, { operation, data }) => {
     // Handler implementation for database operations
   });
   ```

2. **Preload Script** (`electron/preload.js`) exposes a safe API:
   ```javascript
   contextBridge.exposeInMainWorld('api', {
     db: {
       init: () => ipcRenderer.invoke('db-operation', { operation: 'init' }),
       getAll: () => ipcRenderer.invoke('db-operation', { operation: 'getAll' }),
       // Other operations...
     }
   });
   ```

3. **Renderer Process** accesses the API through the `window.api` object:
   ```typescript
   // In Redux thunks
   const jobs = await window.api.db.getAll();
   ```

## Database Implementation

The application uses a simple JSON file-based storage system:

1. **Data Location**: Stored in the Electron user data directory (`app.getPath('userData')`)
2. **File Format**: JSON file containing an array of job application objects
3. **Database Operations**:
   - `initDatabase()`: Initializes the database file
   - `getJobApplications()`: Retrieves all job applications
   - `getJobApplicationById(id)`: Retrieves a specific job application
   - `addJobApplication(job)`: Adds a new job application
   - `updateJobApplication(job)`: Updates an existing job application
   - `deleteJobApplication(id)`: Deletes a job application

## State Management

The application uses Redux Toolkit for state management:

1. **Store**: Central state container (`src/renderer/store/index.ts`)
2. **Slices**: Feature-based state and logic (`src/renderer/store/slices/jobApplicationsSlice.ts`)
3. **Async Thunks**: Handle asynchronous operations and IPC communication
4. **Hooks**: Custom hooks for accessing the store (`src/renderer/hooks/redux.ts`)

Redux state updates follow this pattern:
```
User Action → Dispatch Thunk → IPC Call → Database Operation → 
State Update → Component Re-render
```

## Job Status Tracking

The application tracks job applications through various statuses:

1. **Interview Stages**:
   - Phone Screen
   - Technical Interview
   - Onsite Interview
   - Final Round

2. **Rejection Stages**:
   - Application Rejected
   - Resume Screening Rejected
   - Phone Screen Rejected
   - Technical Interview Rejected
   - Onsite Rejected
   - Final Round Rejected
   - Offer Negotiation Rejected

3. **Offer Stages**:
   - Offer Received
   - Offer Accepted
   - Offer Declined

4. **Other**:
   - Ghosted

## Development

### Requirements

- Node.js 14+ and npm 6+
- Basic knowledge of React, TypeScript, and Electron

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/job-tracker.git
   cd job-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev:electron
   ```

### Development Process

1. **Vite Development Server**: Serves the React application on http://localhost:3000
2. **Electron Process**: Loads the React application from the development server
3. **Hot Reload**: Changes to React components are automatically reflected
4. **DevTools**: Chrome DevTools available for debugging

### Building for Production

```
npm run build:electron
```

This creates:
1. A bundled and optimized React application
2. A packaged Electron application ready for distribution

## Implementation Details

### React Components

The application is built with modular React components:

1. **Layout Components**: Provide structure (Navbar, Layout)
2. **Page Components**: High-level pages (Dashboard, JobList, JobForm)
3. **Feature Components**: Specific functionality (JobCard, StatusBadge)
4. **Form Components**: Input and form handling

### Styling

The application uses a combination of:

1. **Chakra UI**: For consistent, accessible components
2. **Tailwind CSS**: For utility-based styling
3. **Custom CSS**: For specific styling needs

### Error Handling

Error handling is implemented at multiple levels:

1. **Component Level**: Try/catch blocks in React components
2. **Redux Level**: Error handling in async thunks
3. **IPC Level**: Error handling in IPC communication
4. **Database Level**: Error handling in database operations

### Security Considerations

1. **Context Isolation**: Enabled for renderer process security
2. **Preload Script**: Limited exposed API 
3. **IPC Communication**: Secure channel between processes

## License

This project is licensed under the ISC License.

## Contributors

- Your Name - Initial work 