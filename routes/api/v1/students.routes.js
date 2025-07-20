import express from "express";
import students from "../../../models/studentsModel.js";
import * as studentsController from "../../../controllers/api/v1/studentsController.js";

const router = express.Router();

// Middleware to handle file upload errors
const handleFileUploadErrors = (req, res, next) => {
	students.uploadStudentProfilePhoto(req, res, (err) => {
		if (err) {
			// Handle multer errors
			if (err.code === "LIMIT_FILE_SIZE") {
				return res.status(400).json({
					status: "error",
					message: "File too large. Maximum size is 2MB.",
				});
			}

			if (err.message === "Not an image! Please upload only images.") {
				return res.status(400).json({
					status: "error",
					message: err.message,
				});
			}

			return res.status(400).json({
				status: "error",
				message: "Error uploading file",
				error: err.message,
			});
		}
		next();
	});
};

// GET routes
router.get("/getAllStudents", studentsController.getAllStudents);
router.get("/getAStudent/:id", studentsController.getAStudent);

// POST route with file upload
router.post(
	"/addStudent",
	handleFileUploadErrors,
	studentsController.addStudent
);

// PUT route with file upload
router.put(
	"/updateStudent/:id",
	handleFileUploadErrors,
	studentsController.updateStudent
);

// PATCH route with file upload (partial updates)
router.patch(
	"/updateStudent/:id",
	handleFileUploadErrors,
	studentsController.updateStudent
);

// DELETE route
router.delete("/deleteStudent/:id", studentsController.deleteStudent);

export default router;
