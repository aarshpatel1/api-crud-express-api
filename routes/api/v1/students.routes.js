import students from "../../../models/studentsModel.js";
import * as studentsController from "../../../controllers/api/v1/studentsController.js";
import { validateStudent } from "../../../middlewares/validators.js";

import express from "express";
import passport from "passport";

const router = express.Router();

// Authentication middleware to avoid repetition
const authenticate = passport.authenticate("jwt", {
	failureRedirect: "/api/v1/students/failedLogin",
});

// Get all students with optional filtering and pagination
router.get("/getAllStudents", authenticate, studentsController.getAllStudents);

// Get a specific student by ID
router.get("/getAStudent/:id", authenticate, studentsController.getAStudent);

// Add a new student with validation and image compression
router.post(
	"/addStudent",
	authenticate,
	students.uploadStudentProfilePhoto,
	validateStudent("create"),
	studentsController.addStudent
);

// Update student with validation and image compression
router.put(
	"/updateStudent/:id",
	authenticate,
	students.uploadStudentProfilePhoto,
	validateStudent("update"),
	studentsController.updateStudent
);

router.patch(
	"/updateStudent/:id",
	authenticate,
	students.uploadStudentProfilePhoto,
	validateStudent("update"),
	studentsController.updateStudent
);

// Delete a student
router.delete(
	"/deleteStudent/:id",
	authenticate,
	studentsController.deleteStudent
);

// Failed login handler
router.get("/failedLogin", studentsController.failedLogin);

export default router;
