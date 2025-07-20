<div align="center">
  <h1 style="font-size: 3em;">SyntaxMap</h1>
  <p style="font-size: 1.5em; font-style: italic;">Linguistic Learning Platform</p>
</div>
<br>
<br/>


[![Documentation](https://img.shields.io/badge/Documentation-📕-blue)](https://syntaxmap.com/docs)
[![Proprietary](https://img.shields.io/badge/License-Proprietary-red)](https://github.com/chandrayee/SyntaxMap-backend)

# SyntaxMap Backend

> A RESTful API backend for linguistic learning and education platform

## Overview

SyntaxMap is a comprehensive platform designed to help users learn languages through interactive quizzes, examples, and personalized dashboards. The backend provides robust API endpoints for course management, user authentication, quiz handling, and educational content management.

## Features

- **User Management**: Complete authentication system with JWT tokens
- **Course Management**: CRUD operations for educational courses
- **Quiz System**: Interactive quizzes with questions and answers
- **Student Dashboard**: Track learning progress and performance
- **Classroom Management**: Tools for teachers to manage student groups
- **Dictionary Functions**: Lookup and translation capabilities
- **User Uploads**: Support for user-generated content
- **Real-time Functionality**: Multi-user interactions via Colyseus

## Technology Stack

- **Node.js** with Express framework
- **PostgreSQL** database for data persistence
- **Colyseus** for real-time multiplayer features
- **JWT** for secure authentication
- **Multer** for file uploads
- **Passport** for authentication strategies
- **SendGrid** for email notifications

## API Endpoints

The API includes endpoints for:

- User authentication and profile management
- Course creation, retrieval, and management
- Quiz questions and submission handling
- Dashboard and progress reporting
- Student/teacher classroom interactions
- Dictionary lookups and translations
- User-generated content uploads

### Student Dashboard Endpoint

**GET `/student/dashboard`**

Fetches comprehensive dashboard data for students, including progress statistics, recent activities, and learning goals.

**Permissions:** Student (role 3) and Admin (role 1) only  
**Authentication:** JWT token required

**Response Format:**
```json
{
  "progress": {
    "completedTenses": 5,
    "totalTenses": 12,
    "vocabLearned": 87,
    "totalVocab": 250,
    "quizzesCompleted": 12,
    "avgScore": 78
  },
  "recentActivities": [
    {
      "id": 1,
      "type": "quiz",
      "name": "Present Perfect Quiz",
      "score": 85,
      "date": "2025-05-01"
    },
    {
      "id": 2,
      "type": "tense",
      "name": "Past Continuous",
      "completed": true,
      "date": "2025-04-28"
    },
    {
      "id": 3,
      "type": "vocab",
      "name": "Added 12 new words",
      "date": "2025-04-27"
    }
  ],
  "goals": [
    {
      "id": "1",
      "name": "Complete Present Tenses",
      "progress": 75,
      "dueDate": "2025-05-15"
    }
  ]
}
```

**Usage Example:**
```javascript
// Using axios
const response = await axios.get('/student/dashboard', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL database
- Environment variables (see `.env.example`)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/chandrayee/SyntaxMap-backend.git
   cd SyntaxMap-backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database
   ```
   node config/init-db.js
   ```

5. Start the server
   ```
   npm start
   ```

### Development

For development with automatic reloading:
```
npm run dev
```

## Project Structure

- `/config` - Database and authentication configuration
- `/modules` - Core business logic organized by resource type
- `/parser` - Syntax parsing utilities
- `/rooms` - Colyseus game rooms for real-time interactions
- `/routes-v2` - API route definitions (v2)
- `/uploads` - User-uploaded files

## Database Schema

The application uses PostgreSQL with tables for:
- Users and user roles
- Courses and course content
- Quizzes and questions
- Dashboard data
- Dictionary entries
- User uploads and examples

## Working with this Private Repository

### Access and Permissions

This is a private repository with restricted access. To work with this codebase:

1. **Client Access**: 
   - Clients who have commissioned this project may request access by contacting Chandrayee directly
   - Access will be granted based on the terms of the service agreement
   - Clients will be added as collaborators with specific permission levels

2. **Contributor Access**:
   - All contributors must sign a Non-Disclosure Agreement (NDA) before being granted access
   - Contributors will receive limited permissions based on their assigned tasks
   - All contributions are subject to review and approval by Chandrayee

3. **Authentication Requirements**:
   - Two-factor authentication is required for all repository users
   - Access tokens must be used for automated processes and CI/CD workflows
   - Personal access tokens should be rotated regularly

### Contribution Guidelines

For authorized contributors and clients:

1. **Branch Structure**:
   - `main` - Production-ready code, protected branch
   - `development` - Integration branch for testing
   - `feature/*` - For new features
   - `bugfix/*` - For bug fixes

2. **Pull Request Process**:
   - Create feature branches from `development`
   - Submit pull requests with detailed descriptions
   - All code must pass automated tests
   - Changes require approval from repository administrator

3. **Code Reviews**:
   - All contributions require a code review
   - Security-sensitive changes require additional review
   - Follow the established coding standards

### Usage Limitations

- The codebase cannot be shared, redistributed, or used in other projects
- Any derivative work created from this codebase belongs to the original copyright holder
- Clients may use the deployed application according to their service agreement terms

## Deployment

This application is configured for deployment on Render with automatic database connection handling.

## License

This project is proprietary software developed by Chandrayee. This is a paid project commissioned by a client and is not free to use, modify, or distribute without explicit permission from the copyright holder.
