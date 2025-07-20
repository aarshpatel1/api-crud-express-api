import express from "express";
import studentRoutes from "./students.routes.js";

/**
 * Main API router that consolidates all v1 routes
 * Provides basic documentation for available endpoints
 */
const router = express.Router();

/**
 * Root endpoint that shows available API resources
 * Acts as simple API documentation
 */
router.get("/", (req, res) => {
	res.status(200).json({
		status: "success",
		message: "API v1 endpoints",
		endpoints: {
			// List all top-level API resources with descriptions
			students: {
				base: "/students",
				description: "Student management endpoints",
				documentation: {
					get: [
						"/getAllStudents - Get paginated list of students with search and sorting",
						"/getAStudent/:id - Get a single student by ID",
					],
					post: ["/addStudent - Create a new student"],
					put: [
						"/updateStudent/:id - Update all fields of a student",
					],
					patch: [
						"/updateStudent/:id - Update specific fields of a student",
					],
					delete: ["/deleteStudent/:id - Delete a student"],
				},
			},
			// Add other API resources here as your application grows
		},
		version: "1.0",
		status: "active",
	});
});

// Mount the student routes
router.use("/students", studentRoutes);

// Handle 404 for unknown routes under /api/v1/
router.use("*", (req, res) => {
	res.status(404).json({
		status: "error",
		message: `Resource not found: ${req.originalUrl}`,
		availableEndpoints: "/api/v1 - View all available endpoints",
	});
});

export default router;
