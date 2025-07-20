# Student Management API Documentation

![API Status](https://img.shields.io/badge/API-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-v14+-success)
![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-success)

A fully featured REST API for student management with cloud storage integration, robust validation, and comprehensive error handling.

## Table of Contents

-   Features
-   Getting Started
    -   Prerequisites
    -   Installation
    -   Environment Variables
-   API Endpoints
    -   Students
-   Data Models
-   Authentication
-   File Upload
-   Error Handling
-   Performance Optimizations
-   Security Features
-   Development and Testing
-   Deployment
-   Troubleshooting

## Features

-   **Complete CRUD Operations**: Create, Read, Update, and Delete student records
-   **Cloud Storage Integration**: Cloudinary for profile photo storage and optimization
-   **Advanced Filtering**: Search across multiple fields
-   **Pagination**: Optimized data retrieval with pagination
-   **Sorting**: Flexible sorting options
-   **Robust Validation**: Comprehensive data validation and error handling
-   **Security Measures**: Rate limiting, CORS, Helmet HTTP headers
-   **Performance Optimized**: Lean queries, parallel operations, optimized indexes
-   **Well-Documented API**: Self-documenting endpoints

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   MongoDB (v4.4 or higher)
-   Cloudinary account for image storage

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/student-management-api.git
    cd student-management-api
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables (see next section)

4. Start the server:

    ```bash
    # Development mode
    npm run dev

    # Production mode
    npm start
    ```

### Environment Variables

Create a .env file in the root directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/studentdb

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security (if implementing JWT authentication)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
```

## API Endpoints

The API is versioned with all endpoints prefixed with `/api/v1`.

### Students

| Method | Endpoint                             | Description                                                |
| ------ | ------------------------------------ | ---------------------------------------------------------- |
| GET    | `/api/v1/students/getAllStudents`    | Get all students with pagination, filtering, and sorting   |
| GET    | `/api/v1/students/getAStudent/:id`   | Get a specific student by ID                               |
| POST   | `/api/v1/students/addStudent`        | Create a new student (supports file upload)                |
| PUT    | `/api/v1/students/updateStudent/:id` | Update all fields of a student (supports file upload)      |
| PATCH  | `/api/v1/students/updateStudent/:id` | Update specific fields of a student (supports file upload) |
| DELETE | `/api/v1/students/deleteStudent/:id` | Delete a student                                           |

#### Query Parameters for GET /getAllStudents

| Parameter      | Type   | Description                                                 | Default     |
| -------------- | ------ | ----------------------------------------------------------- | ----------- |
| search         | string | Search term for filtering records                           | ""          |
| page           | number | Page number (0-indexed)                                     | 0           |
| recordsPerPage | number | Number of records per page (1-50)                           | 5           |
| sortField      | string | Field to sort by (firstName, lastName, email, gender, city) | "firstName" |
| sortDirection  | string | Sort direction (asc, desc)                                  | "asc"       |

#### Example Requests

**Get all students with pagination and filtering:**

```
GET /api/v1/students/getAllStudents?page=0&recordsPerPage=10&search=john&sortField=lastName&sortDirection=asc
```

**Create a new student:**

```
POST /api/v1/students/addStudent
Content-Type: multipart/form-data

{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male",
  "email": "john.doe@example.com",
  "password": "password123",
  "hobby": ["reading", "swimming"],
  "city": "New York",
  "profilePhoto": [FILE]
}
```

## Data Models

### Student

| Field        | Type   | Validation                     | Description                        |
| ------------ | ------ | ------------------------------ | ---------------------------------- |
| firstName    | String | Required, 2-50 chars           | First name of student              |
| lastName     | String | Required, 2-50 chars           | Last name of student               |
| gender       | String | Required, Enum                 | Gender (male, female, other)       |
| email        | String | Required, Unique, Valid format | Student email address              |
| password     | String | Required, Min 6 chars          | Student password (stored securely) |
| hobby        | Array  | At least one required          | Student hobbies                    |
| city         | String | Required                       | Student city                       |
| profilePhoto | String | Optional                       | Cloudinary URL of profile photo    |
| createdAt    | Date   | Auto-generated                 | Record creation timestamp          |
| updatedAt    | Date   | Auto-generated                 | Record update timestamp            |

## File Upload

Profile photos are uploaded to Cloudinary with the following specifications:

-   **Allowed formats**: JPG, JPEG, PNG
-   **Maximum file size**: 2MB
-   **Optimizations**:
    -   Resized to max 500x500 pixels
    -   Automatic quality optimization
    -   Best format selection (WebP where supported)
-   **Storage location**: `student-profiles/` folder in Cloudinary

## Error Handling

The API provides consistent error responses with appropriate HTTP status codes:

-   **400 Bad Request**: Validation errors, invalid parameters
-   **404 Not Found**: Resource not found
-   **409 Conflict**: Duplicate resources (e.g., email already exists)
-   **500 Internal Server Error**: Server-side errors

Error response format:

```json
{
	"status": "error",
	"message": "Error description",
	"errors": ["Detailed error 1", "Detailed error 2"] // Optional, for validation errors
}
```

## Performance Optimizations

-   **Lean Queries**: Using `.lean()` for faster MongoDB queries
-   **Parallel Operations**: Using `Promise.all` to run operations in parallel
-   **Pagination**: Limiting results to prevent large data transfers
-   **Indexing**: Optimized indexes for frequently queried fields
-   **Connection Pooling**: MongoDB connection pool configuration

## Security Features

-   **HTTP Security Headers**: Using Helmet middleware
-   **CORS Protection**: Configured Cross-Origin Resource Sharing
-   **Rate Limiting**: Preventing brute force and DoS attacks
-   **Input Validation**: Comprehensive request validation
-   **Error Sanitization**: Hiding sensitive error details in production
-   **File Upload Security**: Validation of file types and sizes

## Development and Testing

### Running in Development Mode

```bash
npm run dev
```

This starts the server with hot-reloading using nodemon.

### Logging

In development mode, HTTP request logging is enabled using Morgan.

## Deployment

### Production Considerations

1. Set `NODE_ENV=production` in your environment variables
2. Configure a process manager like PM2
3. Set up appropriate MongoDB indexes
4. Consider implementing a caching layer

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**:

    - Check your MongoDB connection string
    - Verify network connectivity and firewall settings

2. **Cloudinary Upload Errors**:

    - Verify your Cloudinary credentials
    - Check file size and format restrictions

3. **API Rate Limiting**:
    - Default rate limit is 100 requests per 15 minutes

### Support

For issues and feature requests, please open an issue on the GitHub repository.

---

## Acknowledgments

-   Express.js
-   MongoDB and Mongoose
-   Cloudinary for image storage
-   All other open-source contributors
