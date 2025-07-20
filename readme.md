# Student Management API Documentation

![API Status](https://img.shields.io/badge/API-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-v14+-success)
![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-success)

A fully featured RESTful API for managing student records, with cloud storage integration, robust validation, and security features.

---

## Table of Contents

* [Features](#features)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Environment Variables](#environment-variables)
* [API Endpoints](#api-endpoints)

  * [Students](#students)
* [Data Models](#data-models)
* [File Upload](#file-upload)
* [Error Handling](#error-handling)
* [Performance Optimizations](#performance-optimizations)
* [Security Features](#security-features)
* [Development and Testing](#development-and-testing)
* [Deployment](#deployment)
* [Troubleshooting](#troubleshooting)
* [License](#license)
* [Acknowledgments](#acknowledgments)

---

## Features

* ✅ Complete CRUD operations for student management
* ✅ Cloudinary integration for secure and optimized image uploads
* ✅ Advanced search, filtering, sorting, and pagination
* ✅ Robust data validation with meaningful error handling
* ✅ Security features like CORS, Helmet, and rate limiting
* ✅ Optimized queries and index usage for better performance
* ✅ Fully documented API with clear request/response formats

---

## Getting Started

### Prerequisites

* Node.js (v14 or higher)
* MongoDB (v4.4 or higher)
* Cloudinary account (for image storage)

### Installation

```bash
git clone https://github.com/yourusername/student-management-api.git
cd student-management-api
npm install
```

### Running the Server

```bash
# Development Mode
npm run dev  

# Production Mode
npm start
```

### Environment Variables

Create a `.env` file in the root folder:

```ini
# Server
PORT=3000
NODE_ENV=development  

# MongoDB
MONGO_URI=mongodb://localhost:27017/studentdb  

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret  

# JWT (Optional)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
```

---

## API Endpoints

Base URL: `/api/v1`

### Students

| Method | Endpoint                      | Description                      |
| ------ | ----------------------------- | -------------------------------- |
| GET    | `/students/getAllStudents`    | Get all students (filter + sort) |
| GET    | `/students/getAStudent/:id`   | Get student by ID                |
| POST   | `/students/addStudent`        | Create a new student             |
| PUT    | `/students/updateStudent/:id` | Full update of a student         |
| PATCH  | `/students/updateStudent/:id` | Partial update of a student      |
| DELETE | `/students/deleteStudent/:id` | Delete a student by ID           |

#### Example: Fetch Students with Filters

```
GET /api/v1/students/getAllStudents?page=0&recordsPerPage=10&search=john&sortField=lastName&sortDirection=asc
```

#### Example: Create a New Student (Form-Data)

```json
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

---

## Data Models

### Student Schema

| Field        | Type   | Validation                           |
| ------------ | ------ | ------------------------------------ |
| firstName    | String | Required, 2-50 chars                 |
| lastName     | String | Required, 2-50 chars                 |
| gender       | String | Required, Enum (male, female, other) |
| email        | String | Required, Unique, Valid email        |
| password     | String | Required, Min 6 chars (hashed)       |
| hobby        | Array  | At least one required                |
| city         | String | Required                             |
| profilePhoto | String | Optional, Cloudinary URL             |
| createdAt    | Date   | Auto-generated                       |
| updatedAt    | Date   | Auto-generated                       |

---

## File Upload

* ✅ Allowed Formats: JPG, JPEG, PNG
* ✅ Max Size: 2MB
* ✅ Auto-Resizing: Max 500x500px
* ✅ Auto-Quality Optimization + Format Conversion (WebP)
* ✅ Stored in Cloudinary under `student-profiles/` folder

---

## Error Handling

### Error Response Format

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["Email is required", "Password must be at least 6 characters"]
}
```

### Common HTTP Status Codes

| Code | Description              |
| ---- | ------------------------ |
| 400  | Bad Request (Validation) |
| 404  | Not Found                |
| 409  | Conflict (Duplicate)     |
| 500  | Internal Server Error    |

---

## Performance Optimizations

* 🏃‍♂️ **Lean Queries**: `.lean()` for faster data fetch
* ⚡ **Parallel Execution**: `Promise.all` for async tasks
* 📄 **Pagination**: Limit large datasets
* 📊 **Indexed Fields**: On frequently queried data
* 🔗 **Connection Pooling**: With Mongoose

---

## Security Features

* 🛡️ HTTP Headers via **Helmet.js**
* 🌐 Cross-Origin Resource Sharing with **CORS**
* 🚫 Rate Limiting for abuse protection
* ✅ Comprehensive Input Validation
* 🔒 Error Handling with sanitized messages
* 📁 File Upload Restrictions

---

## Development and Testing

* 🔥 **Dev Mode**: With hot reloading using `nodemon`
* 📋 **Logging**: Using **morgan** for HTTP requests

```bash
npm run dev
```

---

## Deployment

### Production Considerations

* Set `NODE_ENV=production`
* Use **PM2** or similar process manager
* Ensure MongoDB indexes are in place
* Consider **Redis** or similar for caching
* Monitor with tools like **New Relic** or **PM2 Monitoring**

---

## Troubleshooting

| Issue                     | Solution                                 |
| ------------------------- | ---------------------------------------- |
| MongoDB Connection Failed | Check `MONGO_URI`, firewall, and network |
| Cloudinary Upload Fails   | Verify Cloudinary keys and file limits   |
| API Rate Limited          | Check rate limit settings                |

---

## Acknowledgments

* [Express.js](https://expressjs.com/)
* [Mongoose](https://mongoosejs.com/)
* [Cloudinary](https://cloudinary.com/)
* [Helmet.js](https://helmetjs.github.io/)
* [CORS](https://www.npmjs.com/package/cors)

---

## 🔗 Resources

* [Helmet.js Documentation](https://helmetjs.github.io/)
* [CORS npm package](https://www.npmjs.com/package/cors)
* [MongoDB Documentation](https://docs.mongodb.com/)
* [Cloudinary Documentation](https://cloudinary.com/documentation)

