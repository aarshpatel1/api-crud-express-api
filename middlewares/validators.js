import cloudinary from "../config/cloudinary.js";

import { body, param, query, validationResult } from "express-validator";

// Helper function to check validation results
const handleValidationErrors = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// If an image was uploaded, delete it from Cloudinary
		if (req.file && req.file.filename) {
			// For multer-storage-cloudinary, the public_id is in req.file.filename (or req.file.public_id)
			try {
				await cloudinary.uploader.destroy(req.file.filename);
			} catch (e) {
				console.error(
					"Failed to delete Cloudinary image after validation error:",
					e.message
				);
			}
		}
		return res.status(400).json({
			status: "error",
			message: "Validation failed",
			errors: errors.array(),
		});
	}
	next();
};

// Student validation rules
export const validateStudent = (method) => {
	switch (method) {
		case "create": {
			return [
				body("firstName")
					.trim()
					.notEmpty()
					.withMessage("First name is required")
					.isLength({ min: 2, max: 50 })
					.withMessage(
						"First name must be between 2 and 50 characters"
					),

				body("lastName")
					.trim()
					.notEmpty()
					.withMessage("Last name is required")
					.isLength({ min: 2, max: 50 })
					.withMessage(
						"Last name must be between 2 and 50 characters"
					),

				body("gender")
					.notEmpty()
					.withMessage("Gender is required")
					.isIn(["male", "female", "other"])
					.withMessage("Gender must be male, female, or other"),

				body("email")
					.trim()
					.notEmpty()
					.withMessage("Email is required")
					.isEmail()
					.withMessage("Invalid email format")
					.normalizeEmail(),

				body("password")
					.notEmpty()
					.withMessage("Password is required")
					.isLength({ min: 8 })
					.withMessage("Password must be at least 8 characters")
					.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
					.withMessage(
						"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
					),

				body("hobby")
					.optional()
					.isArray()
					.withMessage("Hobbies must be an array"),

				body("city").trim().notEmpty().withMessage("City is required"),

				handleValidationErrors,
			];
		}
		case "update": {
			return [
				body("firstName")
					.optional()
					.trim()
					.isLength({ min: 2, max: 50 })
					.withMessage(
						"First name must be between 2 and 50 characters"
					),

				body("lastName")
					.optional()
					.trim()
					.isLength({ min: 2, max: 50 })
					.withMessage(
						"Last name must be between 2 and 50 characters"
					),

				body("gender")
					.optional()
					.isIn(["male", "female", "other"])
					.withMessage("Gender must be male, female, or other"),

				body("email")
					.optional()
					.trim()
					.isEmail()
					.withMessage("Invalid email format")
					.normalizeEmail(),

				body("password")
					.optional()
					.isLength({ min: 8 })
					.withMessage("Password must be at least 8 characters")
					.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
					.withMessage(
						"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
					),

				body("hobby")
					.optional()
					.isArray()
					.withMessage("Hobbies must be an array"),

				body("city").optional().trim(),

				param("id")
					.isMongoId()
					.withMessage("Invalid student ID format"),

				handleValidationErrors,
			];
		}
		default:
			return [];
	}
};

// Faculty validation rules
export const validateFaculty = (method) => {
	switch (method) {
		case "register": {
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage("Email is required")
					.isEmail()
					.withMessage("Invalid email format")
					.normalizeEmail(),

				body("password")
					.notEmpty()
					.withMessage("Password is required")
					.isLength({ min: 8 })
					.withMessage("Password must be at least 8 characters")
					.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
					.withMessage(
						"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
					),

				body("confirmPassword")
					.notEmpty()
					.withMessage("Confirm password is required")
					.custom((value, { req }) => {
						if (value !== req.body.password) {
							throw new Error(
								"Password confirmation does not match password"
							);
						}
						return true;
					}),

				handleValidationErrors,
			];
		}
		case "login": {
			return [
				body("email")
					.trim()
					.notEmpty()
					.withMessage("Email is required")
					.isEmail()
					.withMessage("Invalid email format")
					.normalizeEmail(),

				body("password").notEmpty().withMessage("Password is required"),

				handleValidationErrors,
			];
		}
		default:
			return [];
	}
};

// Query parameter validation for getAllStudents
export const validateGetAllStudentsQuery = [
	query("page")
		.optional()
		.isInt({ min: 0 })
		.withMessage("Page must be a non-negative integer"),
	query("recordsPerPage")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Records per page must be between 1 and 100"),
	query("sortDirection")
		.optional()
		.isIn(["asc", "desc"])
		.withMessage("Sort direction must be either asc or desc"),
	handleValidationErrors,
];
