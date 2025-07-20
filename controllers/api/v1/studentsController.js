// filepath: d:\Node RNW\API CRUD\controllers\api\v1\studentsController.js
import { fileURLToPath } from "url";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import students from "../../../models/studentsModel.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
const isValidObjectId = (id) => {
	return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Get all students with pagination, search, and sorting
 */
export const getAllStudents = async (req, res) => {
	try {
		// Extract and validate query parameters
		const search = req.query.search || "";
		const currentPage = Math.max(0, parseInt(req.query.page) || 0); // Ensure non-negative
		const recordsPerPage = Math.min(
			50,
			Math.max(1, parseInt(req.query.recordsPerPage) || 5)
		); // Between 1-50
		const sortField = [
			"firstName",
			"lastName",
			"email",
			"gender",
			"city",
		].includes(req.query.sortField)
			? req.query.sortField
			: "firstName"; // Whitelist sortable fields
		const sortDirection = req.query.sortDirection === "desc" ? -1 : 1;

		// Build search query
		const query = search
			? {
					$or: [
						{ firstName: { $regex: new RegExp(search, "i") } },
						{ lastName: { $regex: new RegExp(search, "i") } },
						{ gender: { $regex: new RegExp(search, "i") } },
						{ email: { $regex: new RegExp(search, "i") } },
						{ city: { $regex: new RegExp(search, "i") } },
					],
			  }
			: {};

		// Prepare sort options
		const sortOptions = {};
		sortOptions[sortField] = sortDirection;

		// Execute queries in parallel for better performance
		const [allStudents, totalStudents] = await Promise.all([
			students
				.find(query)
				.select("-password") // Exclude sensitive data
				.sort(sortOptions)
				.skip(currentPage * recordsPerPage)
				.limit(recordsPerPage)
				.lean(), // Use lean for better performance
			students.countDocuments(query),
		]);

		const totalPages = Math.ceil(totalStudents / recordsPerPage);

		// Handle pagination edge cases
		if (totalStudents > 0 && currentPage >= totalPages) {
			return res.status(400).json({
				status: "error",
				message: "Page number out of range",
				totalPages: Math.max(0, totalPages - 1),
			});
		}

		// No students found
		if (totalStudents === 0) {
			return res.status(404).json({
				status: "not found",
				message: "No students found matching your criteria",
			});
		}

		// Success response
		return res.status(200).json({
			status: "success",
			message: "Students retrieved successfully",
			allStudents,
			pagination: {
				recordsPerPage,
				recordsOnThisPage: allStudents.length,
				currentPage,
				totalPages: Math.max(0, totalPages - 1),
				totalRecords: totalStudents,
				hasNextPage: currentPage < totalPages - 1,
				hasPrevPage: currentPage > 0,
			},
			filters: {
				search,
				sortField,
				sortDirection: sortDirection === 1 ? "asc" : "desc",
			},
		});
	} catch (err) {
		console.error("Error getting all students", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to get students data",
			error:
				process.env.NODE_ENV === "development"
					? err.message
					: "Internal server error",
		});
	}
};

/**
 * Get a single student by ID
 */
export const getAStudent = async (req, res) => {
	try {
		// Validate ID format first
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				status: "error",
				message: "Invalid student ID format",
			});
		}

		const findStudent = await students
			.findById(req.params.id)
			.select("-password") // Exclude sensitive data
			.lean();

		if (findStudent) {
			return res.status(200).json({
				status: "success",
				message: "Student found successfully",
				student: findStudent, // Changed from 'findStudent' to 'student' for consistency
			});
		} else {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}
	} catch (err) {
		console.error("Error finding a student: ", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to find student",
			error:
				process.env.NODE_ENV === "development"
					? err.message
					: "Internal server error",
		});
	}
};

/**
 * Add a new student
 */
export const addStudent = async (req, res) => {
	try {
		// Basic validation
		const requiredFields = [
			"firstName",
			"lastName",
			"gender",
			"email",
			"password",
			"city",
		];
		const missingFields = requiredFields.filter(
			(field) => !req.body[field]
		);

		if (missingFields.length > 0) {
			// If file was uploaded but data is invalid, delete it
			if (req.file && req.file.path) {
				try {
					// Extract public_id from the cloudinary URL
					const publicId =
						req.file.filename ||
						(req.file.path &&
							req.file.path.split("/").pop().split(".")[0]);

					if (publicId) {
						await cloudinary.uploader.destroy(
							`student-profiles/${publicId}`
						);
					}
				} catch (cloudinaryError) {
					console.error(
						"Failed to delete uploaded file:",
						cloudinaryError
					);
				}
			}

			return res.status(400).json({
				status: "error",
				message: `Missing required fields: ${missingFields.join(", ")}`,
			});
		}

		// If file was uploaded, use the Cloudinary URL
		if (req.file) {
			req.body.profilePhoto = req.file.path;
		}

		// Create the student
		const addedStudent = await students.create(req.body);

		// Remove password from response
		const studentResponse = addedStudent.toObject();
		delete studentResponse.password;

		return res.status(201).json({
			status: "success",
			message: "Student added successfully",
			student: studentResponse,
		});
	} catch (err) {
		// Check for validation errors from Mongoose
		if (err.name === "ValidationError") {
			const errors = Object.values(err.errors).map((e) => e.message);
			return res.status(400).json({
				status: "error",
				message: "Validation failed",
				errors: errors,
			});
		}

		// Check for duplicate key error (e.g., email already exists)
		if (err.code === 11000) {
			return res.status(409).json({
				status: "error",
				message: "A student with this email already exists",
			});
		}

		console.error("Error adding student:", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to add student",
			error:
				process.env.NODE_ENV === "development"
					? err.message
					: "Internal server error",
		});
	}
};

/**
 * Update an existing student
 */
export const updateStudent = async (req, res) => {
	try {
		// Validate ID format
		if (!isValidObjectId(req.params.id)) {
			// Clean up any uploaded file
			if (req.file && req.file.path) {
				try {
					const publicId =
						req.file.filename ||
						(req.file.path &&
							req.file.path.split("/").pop().split(".")[0]);
					if (publicId) {
						await cloudinary.uploader.destroy(
							`student-profiles/${publicId}`
						);
					}
				} catch (cloudinaryError) {
					console.error(
						"Failed to delete uploaded file:",
						cloudinaryError
					);
				}
			}

			return res.status(400).json({
				status: "error",
				message: "Invalid student ID format",
			});
		}

		// Check if student exists
		const findStudent = await students.findById(req.params.id);
		if (!findStudent) {
			// Clean up any uploaded file
			if (req.file && req.file.path) {
				try {
					const publicId =
						req.file.filename ||
						(req.file.path &&
							req.file.path.split("/").pop().split(".")[0]);
					if (publicId) {
						await cloudinary.uploader.destroy(
							`student-profiles/${publicId}`
						);
					}
				} catch (cloudinaryError) {
					console.error(
						"Failed to delete uploaded file:",
						cloudinaryError
					);
				}
			}

			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}

		// If uploading a new photo and the student has an existing photo
		if (findStudent.profilePhoto && req.file && req.file.path) {
			try {
				// Extract public_id from the old Cloudinary URL
				const publicId = findStudent.profilePhoto
					.split("/")
					.pop()
					.split(".")[0];
				if (publicId) {
					// Delete old image from Cloudinary
					await cloudinary.uploader.destroy(
						`student-profiles/${publicId}`
					);
				}
			} catch (cloudinaryError) {
				console.error("Failed to delete old image:", cloudinaryError);
				// Continue with update even if deletion fails
			}
		}

		// If file was uploaded, update the profile photo URL
		if (req.file && req.file.path) {
			req.body.profilePhoto = req.file.path;
		}

		// Update the student with validation
		const updatedStudent = await students
			.findByIdAndUpdate(
				req.params.id,
				{ $set: req.body },
				{
					new: true, // Return the updated document
					runValidators: true, // Run Mongoose validators
					context: "query", // Required for validators to run on update
				}
			)
			.select("-password"); // Exclude password from response

		return res.status(200).json({
			status: "success",
			message: "Student updated successfully",
			student: updatedStudent,
		});
	} catch (err) {
		// If an error occurred and a file was uploaded, clean it up
		if (req.file && req.file.path) {
			try {
				const publicId =
					req.file.filename ||
					(req.file.path &&
						req.file.path.split("/").pop().split(".")[0]);
				if (publicId) {
					await cloudinary.uploader.destroy(
						`student-profiles/${publicId}`
					);
				}
			} catch (cloudinaryError) {
				console.error(
					"Failed to delete file after error:",
					cloudinaryError
				);
			}
		}

		// Handle validation errors
		if (err.name === "ValidationError") {
			const errors = Object.values(err.errors).map((e) => e.message);
			return res.status(400).json({
				status: "error",
				message: "Validation failed",
				errors: errors,
			});
		}

		// Handle duplicate key errors
		if (err.code === 11000) {
			return res.status(409).json({
				status: "error",
				message: "A student with this email already exists",
			});
		}

		console.error("Error updating student: ", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to update student",
			error:
				process.env.NODE_ENV === "development"
					? err.message
					: "Internal server error",
		});
	}
};

/**
 * Delete a student
 */
export const deleteStudent = async (req, res) => {
	try {
		// Validate ID format
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({
				status: "error",
				message: "Invalid student ID format",
			});
		}

		// Check if student exists
		const findStudent = await students.findById(req.params.id);
		if (!findStudent) {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}

		// If student has a profile photo, delete it from Cloudinary
		if (findStudent.profilePhoto) {
			try {
				// Extract public_id from the Cloudinary URL
				const publicId = findStudent.profilePhoto
					.split("/")
					.pop()
					.split(".")[0];
				if (publicId) {
					await cloudinary.uploader.destroy(
						`student-profiles/${publicId}`
					);
				}
			} catch (cloudinaryError) {
				console.error(
					"Failed to delete image from Cloudinary:",
					cloudinaryError
				);
				// Continue with deletion even if image removal fails
			}
		}

		// Delete the student
		const deletedStudent = await students.findByIdAndDelete(req.params.id);

		// Remove password from response
		const studentResponse = deletedStudent.toObject();
		delete studentResponse.password;

		return res.status(200).json({
			status: "success",
			message: "Student deleted successfully",
			student: studentResponse,
		});
	} catch (err) {
		console.error("Error deleting student: ", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to delete student",
			error:
				process.env.NODE_ENV === "development"
					? err.message
					: "Internal server error",
		});
	}
};
