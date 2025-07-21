# API CRUD - Node.js RESTful API

A secure, robust, and well-validated RESTful API for managing students and faculties, built with **Node.js**, **Express**, **MongoDB (Mongoose)**, **Passport JWT**, and **Multer** for file uploads.

---

## Table of Contents

-   [Features](#features)
-   [Project Structure](#project-structure)
-   [Setup & Installation](#setup--installation)
-   [Environment Variables](#environment-variables)
-   [API Endpoints](#api-endpoints)
    -   [Students](#students)
    -   [Faculties](#faculties)
-   [Validation & Security](#validation--security)
-   [Error Handling](#error-handling)
-   [File Uploads](#file-uploads)
-   [Session & Authentication](#session--authentication)
-   [Code Quality & Best Practices](#code-quality--best-practices)
-   [Contributing](#contributing)
-   [License](#license)

---

## Features

-   **CRUD operations** for Students and Faculties
-   **JWT Authentication** for secure endpoints
-   **Input validation** using `express-validator`
-   **Password hashing** with `bcrypt`
-   **Profile photo upload** for students (with file type/size validation)
-   **Security best practices**: Helmet, CORS, session management
-   **Centralized error handling**
-   **Pagination, filtering, and sorting** for student listing
-   **Environment-based configuration**

---

## Project Structure

```
API CRUD/
│
├── config/
│   └── db.js                # MongoDB connection logic
│
├── controllers/
│   └── api/v1/
│       ├── facultiesController.js
│       └── studentsController.js
│
├── middlewares/
│   ├── passport-jwt.js      # JWT authentication strategy
│   └── validators.js        # Input validation rules
│
├── models/
│   ├── facultiesModel.js
│   └── studentsModel.js
│
├── routes/
│   └── api/v1/
│       ├── faculties.routes.js
│       ├── students.routes.js
│       └── index.js         # API v1 router
│
├── utils/
│   └── errorHandler.js      # Central error and file handling
│
├── uploads/                 # Uploaded student profile photos
│
├── .env                     # Environment variables
├── index.js                 # Main server entry point
├── package.json
└── README.md
```

---

## Setup & Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/yourusername/api-crud.git
    cd api-crud
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Create a `.env` file** in the root directory with the following variables:

    ```
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRY=1h
    SESSION_SECRET=your_session_secret
    NODE_ENV=development
    CORS_ORIGIN=http://localhost:3000
    ```

4. **Start the server:**
    ```sh
    npm start
    ```
    The server will run at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable       | Description                         |
| -------------- | ----------------------------------- |
| PORT           | Server port                         |
| MONGO_URI      | MongoDB connection string           |
| JWT_SECRET     | Secret key for JWT signing          |
| JWT_EXPIRY     | JWT token expiry (e.g., `1h`, `2d`) |
| SESSION_SECRET | Secret for express-session          |
| NODE_ENV       | `development` or `production`       |
| CORS_ORIGIN    | Allowed CORS origin(s)              |

---

## API Endpoints

### Students

All student endpoints require **JWT authentication** (except registration/login for faculties).

| Method | Endpoint                             | Description                                         |
| ------ | ------------------------------------ | --------------------------------------------------- |
| GET    | `/api/v1/students/getAllStudents`    | List students (with pagination, filtering, sorting) |
| GET    | `/api/v1/students/getAStudent/:id`   | Get a student by ID                                 |
| POST   | `/api/v1/students/addStudent`        | Add a new student (with profile photo upload)       |
| PUT    | `/api/v1/students/updateStudent/:id` | Update a student (with optional new photo)          |
| PATCH  | `/api/v1/students/updateStudent/:id` | Partial update (same as PUT)                        |
| DELETE | `/api/v1/students/deleteStudent/:id` | Delete a student                                    |

#### Student Model Fields

-   `firstName` (string, required)
-   `lastName` (string, required)
-   `gender` (enum: male, female, other, required)
-   `email` (string, required, unique)
-   `password` (string, required, hashed)
-   `hobby` (array of strings, optional)
-   `city` (string, required)
-   `profilePhoto` (string, required, filename of uploaded image)

### Faculties

| Method | Endpoint                     | Description                 |
| ------ | ---------------------------- | --------------------------- |
| POST   | `/api/v1/faculties/register` | Register a new faculty      |
| POST   | `/api/v1/faculties/login`    | Login and receive JWT token |

#### Faculty Model Fields

-   `email` (string, required, unique)
-   `password` (string, required, hashed)
-   `status` (boolean, default: true)

---

## Validation & Security

-   **All input data is validated** using `express-validator` in `/middlewares/validators.js`.
-   **Passwords** must be at least 8 characters and include uppercase, lowercase, number, and special character.
-   **JWT tokens** are required for all student endpoints.
-   **Helmet** is used for HTTP security headers.
-   **CORS** is enabled and configurable via `.env`.
-   **Session cookies** are secure, HTTP-only, and use `sameSite: 'lax'`.

---

## Error Handling

-   All errors are handled centrally via `/utils/errorHandler.js`.
-   Validation errors, duplicate keys, and server errors return clear, consistent JSON responses.
-   In development, error details and stack traces are included in responses.

---

## File Uploads

-   **Student profile photos** are uploaded via `multer` and stored in `/uploads`.
-   Only image files are allowed (max size: 2MB).
-   Old profile photos are deleted when a student updates their photo or is deleted.

---

## Session & Authentication

-   **JWT** is used for stateless authentication.
-   **Passport** with a custom JWT strategy validates tokens and user status.
-   **Session management** is set up for Passport, but JWT is the main authentication method.

---

## Code Quality & Best Practices

-   **Modular structure**: Models, controllers, routes, and middlewares are separated.
-   **Async/await** used for all database operations.
-   **No sensitive data** (like passwords) is ever returned in API responses.
-   **Automatic timestamps** for all models.
-   **Comprehensive comments** throughout the codebase.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

---

## Author

Aarsh Patel

---

## Contact

For questions or support, please open an issue or contact the maintainer.
