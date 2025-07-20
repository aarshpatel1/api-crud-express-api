import students from "../../../models/studentsModel.js";
import { v2 as cloudinary } from "cloudinary";

// Upload and compress image helper
const uploadAndCompressImage = async (filePath) => {
	try {
		const result = await cloudinary.uploader.upload(filePath, {
			folder: "studentProfilePhotos",
			transformation: [
				{ width: 500, height: 500, crop: "limit" },
				{ quality: "auto:eco" },
				{ fetch_format: "auto" },
			],
		});
		return result.secure_url;
	} catch (error) {
		console.error("Error uploading to Cloudinary:", error);
		throw error;
	}
};

// Get all students with filters & pagination
export const getAllStudents = async (req, res) => {
	const search = req.query.search || "";
	const currentPage = parseInt(req.query.page) || 0;
	const recordsPerPage = parseInt(req.query.recordsPerPage) || 5;
	const sortField = req.query.sortField || "firstName";
	const sortDirection = req.query.sortDirection === "desc" ? -1 : 1;

	try {
		const query = {
			$or: [
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
				{ gender: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
				{ city: { $regex: search, $options: "i" } },
			],
		};

		const totalStudents = await students.countDocuments(query);
		const totalPages = Math.ceil(totalStudents / recordsPerPage);

		if (totalStudents > 0 && currentPage >= totalPages) {
			return res.status(400).json({
				status: "error",
				message: "Page number out of range",
				totalPages: totalPages - 1,
			});
		}

		const allStudents = await students
			.find(query)
			.sort({ [sortField]: sortDirection })
			.skip(currentPage * recordsPerPage)
			.limit(recordsPerPage);

		if (!allStudents.length) {
			return res.status(404).json({
				status: "not found",
				message: "No students found matching your criteria",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Fetched students successfully",
			allStudents,
			pagination: {
				recordsPerPage,
				recordsOnThisPage: allStudents.length,
				currentPage,
				totalPages: totalPages - 1,
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
		console.error("Error fetching students:", err);
		return res.status(500).json({
			status: "error",
			message: "Server error fetching students",
			error: err.message,
		});
	}
};

// Get a single student by ID
export const getAStudent = async (req, res) => {
	try {
		const findStudent = await students.findById(req.params.id);
		if (!findStudent) {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}
		return res.status(200).json({
			status: "success",
			message: "Student found successfully",
			findStudent,
		});
	} catch (err) {
		console.error("Error fetching student:", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to fetch student",
			error: err.message,
		});
	}
};

// Add a student
export const addStudent = async (req, res) => {
	try {
		if (req.file?.path) {
			req.body.profilePhoto = await uploadAndCompressImage(req.file.path);
		}

		const addedStudent = await students.create(req.body);
		return res.status(201).json({
			status: "success",
			message: "Student added successfully",
			student: addedStudent,
		});
	} catch (err) {
		console.error("Error adding student:", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to add student",
			error: err.message,
		});
	}
};

// Update a student
export const updateStudent = async (req, res) => {
	try {
		const student = await students.findById(req.params.id);
		if (!student) {
			if (req.file?.path) {
				// Delete uploaded image if student not found
				const uploadedImagePublicId = req.file.path
					.split("/")
					.pop()
					.split(".")[0];
				await cloudinary.uploader.destroy(
					`studentProfilePhotos/${uploadedImagePublicId}`
				);
			}
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}

		// If new image uploaded, delete old image & update URL
		if (req.file?.path) {
			if (student.profilePhoto) {
				const oldPublicId = student.profilePhoto
					.split("/")
					.pop()
					.split(".")[0];
				await cloudinary.uploader.destroy(
					`studentProfilePhotos/${oldPublicId}`
				);
			}
			req.body.profilePhoto = await uploadAndCompressImage(req.file.path);
		}

		const updatedStudent = await students.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		return res.status(200).json({
			status: "success",
			message: "Student updated successfully",
			student: updatedStudent,
		});
	} catch (err) {
		console.error("Error updating student:", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to update student",
			error: err.message,
		});
	}
};

// Delete a student
export const deleteStudent = async (req, res) => {
	try {
		const student = await students.findById(req.params.id);
		if (!student) {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}

		if (student.profilePhoto) {
			const publicId = student.profilePhoto
				.split("/")
				.pop()
				.split(".")[0];
			await cloudinary.uploader.destroy(
				`studentProfilePhotos/${publicId}`
			);
		}

		const deletedStudent = await students.findByIdAndDelete(req.params.id);
		return res.status(200).json({
			status: "success",
			message: "Student deleted successfully",
			student: deletedStudent,
		});
	} catch (err) {
		console.error("Error deleting student:", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to delete student",
			error: err.message,
		});
	}
};
