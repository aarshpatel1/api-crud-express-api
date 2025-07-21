import path from "path";
import { fileURLToPath } from "url";
import Students from "../../../models/studentsModel.js";
import { handleApiError, safeDeleteFile } from "../../../utils/errorHandler.js";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../../../uploads/");
const salt = 10;

export const getAllStudents = async (req, res) => {
	// Improved input validation with defaults and type conversion
	const search = req.query.search?.toString() || "";
	const currentPage = Math.max(0, parseInt(req.query.page) || 0);
	const recordsPerPage = Math.min(
		100,
		Math.max(1, parseInt(req.query.recordsPerPage) || 5)
	);
	const sortField = ["firstName", "lastName", "email", "createdAt"].includes(
		req.query.sortField
	)
		? req.query.sortField
		: "firstName";
	const sortDirection = req.query.sortDirection === "desc" ? -1 : 1;

	try {
		// Build search query with validation
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

		// Get total count first to avoid unnecessary queries
		const totalStudents = await Students.countDocuments(query);

		if (totalStudents === 0) {
			return res.status(200).json({
				status: "success",
				message: "No students found matching your criteria",
				allStudents: [],
				pagination: {
					recordsPerPage,
					recordsOnThisPage: 0,
					currentPage,
					totalPages: 0,
					totalRecords: 0,
					hasNextPage: false,
					hasPrevPage: false,
				},
			});
		}

		const totalPages = Math.ceil(totalStudents / recordsPerPage);

		// Validate page number is in range
		if (totalStudents > 0 && currentPage >= totalPages) {
			return res.status(400).json({
				status: "error",
				message: "Page number out of range",
				totalPages: totalPages > 0 ? totalPages - 1 : 0,
			});
		}

		// Execute query with pagination and sorting
		const allStudents = await Students.find(query)
			.select("-password") // Exclude sensitive data
			.sort(sortOptions)
			.skip(currentPage * recordsPerPage)
			.limit(recordsPerPage);

		return res.status(200).json({
			status: "success",
			message: "Retrieved student data successfully",
			allStudents,
			pagination: {
				recordsPerPage,
				recordsOnThisPage: allStudents.length,
				currentPage,
				totalPages: totalPages > 0 ? totalPages - 1 : 0,
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
		return handleApiError(res, err, "Failed to get students data");
	}
};

export const getAStudent = async (req, res) => {
	try {
		// Validate ID format
		if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({
				status: "error",
				message: "Invalid student ID format",
			});
		}

		const student = await Students.findById(req.params.id).select(
			"-password"
		);

		if (!student) {
			return res.status(404).json({
				status: "not found",
				message: "Student not found",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Student found successfully",
			student,
		});
	} catch (err) {
		return handleApiError(res, err, "Failed to find student");
	}
};

export const addStudent = async (req, res) => {
	try {
		if (!req.file || !req.file.path) {
			return res.status(400).json({
				status: "error",
				message: "Profile photo is required",
			});
		}
		req.body.profilePhoto = req.file.path; // Cloudinary URL

		// Hash password before saving
		if (req.body.password) {
			req.body.password = await bcrypt.hash(req.body.password, salt);
		}

		const student = await Students.create(req.body);
		const studentResponse = student.toObject();
		delete studentResponse.password;

		return res.status(201).json({
			status: "success",
			message: "Student added successfully",
			student: studentResponse,
		});
	} catch (err) {
		return handleApiError(res, err, "Failed to add student");
	}
};

export const updateStudent = async (req, res) => {
	try {
		if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({
				status: "error",
				message: "Invalid student ID format",
			});
		}

		const student = await Students.findById(req.params.id);
		if (!student) {
			return res.status(404).json({
				status: "not found",
				message: "Student not found",
			});
		}

		if (req.file && req.file.path) {
			req.body.profilePhoto = req.file.path; // Cloudinary URL
		}

		const updatedStudent = await Students.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true, runValidators: true }
		).select("-password");

		return res.status(200).json({
			status: "success",
			message: "Student updated successfully",
			student: updatedStudent,
		});
	} catch (err) {
		return handleApiError(res, err, "Failed to update student");
	}
};

export const deleteStudent = async (req, res) => {
	try {
		// Validate ID format
		if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({
				status: "error",
				message: "Invalid student ID format",
			});
		}

		// Find student
		const student = await Students.findById(req.params.id);

		if (!student) {
			return res.status(404).json({
				status: "not found",
				message: "Student not found",
			});
		}

		// Delete profile photo if exists
		if (student.profilePhoto) {
			await safeDeleteFile(path.join(UPLOAD_DIR, student.profilePhoto));
		}

		// Delete student
		const deletedStudent = await Students.findByIdAndDelete(req.params.id);

		// Return deleted student without password
		const studentResponse = deletedStudent.toObject();
		delete studentResponse.password;

		return res.status(200).json({
			status: "success",
			message: "Student deleted successfully",
			student: studentResponse,
		});
	} catch (err) {
		return handleApiError(res, err, "Failed to delete student");
	}
};

export const failedLogin = (req, res) => {
	return res.status(401).json({
		status: "unauthorized",
		message: "Authentication failed. Please login with valid credentials.",
	});
};
