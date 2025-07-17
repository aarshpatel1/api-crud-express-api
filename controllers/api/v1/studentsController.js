import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Students from "../../../models/studentsModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllStudents = async (req, res) => {
	let search = req.query.search || "";
	let currentPage = parseInt(req.query.page) || 0;
	let recordsPerPage = parseInt(req.query.recordsPerPage) || 5;
	let sortField = req.query.sortField || "firstName";
	let sortDirection = req.query.sortDirection === "desc" ? -1 : 1;

	try {
		const query = {
			$or: [
				{ firstName: { $regex: new RegExp(search, "i") } },
				{ lastName: { $regex: new RegExp(search, "i") } },
				{ gender: { $regex: new RegExp(search, "i") } },
				{ email: { $regex: new RegExp(search, "i") } },
				{ city: { $regex: new RegExp(search, "i") } },
			],
		};

		const sortOptions = {};
		sortOptions[sortField] = sortDirection;

		const allStudents = await Students.find(query)
			.sort(sortOptions)
			.skip(currentPage * recordsPerPage)
			.limit(recordsPerPage);

		const totalStudents = await Students.countDocuments(query);
		const totalPages = Math.ceil(totalStudents / recordsPerPage);

		if (totalStudents > 0 && currentPage >= totalPages) {
			return res.status(400).json({
				status: "error",
				message: "Page number out of range",
				totalPages: totalPages > 0 ? totalPages - 1 : 0,
			});
		}

		if (totalStudents === 0) {
			return res.status(404).json({
				status: "not found",
				message: "No students found matching your criteria",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Get all students data successfully",
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
		console.error("Error getting all students", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to get all students data",
			error: err.message,
		});
	}
};

export const getAStudent = async (req, res) => {
	// console.log(req.params.id);
	try {
		const findStudent = await Students.findOne({ _id: req.params.id });
		if (findStudent) {
			return res.status(200).json({
				status: "success",
				message: "Student found successfully",
				findStudent,
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
			message: "Failed to find a student",
		});
	}
};

export const addStudent = async (req, res) => {
	// console.log(req.body);
	// console.log(req.file);
	try {
		if (req.file) {
			req.body.profilePhoto = req.file.filename;
		}
		const addedStudent = await Students.create(req.body);
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
		});
	}
};

export const updateStudent = async (req, res) => {
	// console.log(req.params.id);
	// console.log(req.body);
	// console.log(req.file);
	try {
		const findStudent = await Students.findOne({ _id: req.params.id });
		if (!findStudent) {
			if (req.file && req.file.filename) {
				fs.unlink(
					path.join(
						__dirname,
						"../../../uploads/",
						req.file.filename
					),
					(err) =>
						err &&
						console.error("Failed to delete unused file:", err)
				);
			}

			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}
		if (
			findStudent.profilePhoto &&
			req.file && // Only delete old photo if a new one is being uploaded
			fs.existsSync(
				path.join(
					__dirname,
					"../../../uploads/",
					findStudent.profilePhoto
				)
			)
		) {
			fs.unlink(
				path.join(
					__dirname,
					"../../../uploads/",
					findStudent.profilePhoto
				),
				(err) => err && console.error("Failed to delete file:", err)
			);
		}

		if (req.file) {
			req.body.profilePhoto = req.file.filename;
		}
		// Add { new: true } to return the updated document instead of the original
		const updatedStudent = await Students.findByIdAndUpdate(
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
		if (req.file && req.file.filename) {
			fs.unlink(
				path.join(__dirname, "../../../uploads/", req.file.filename),
				(err) =>
					err &&
					console.error("Failed to delete file after error:", err)
			);
		}

		console.error("Error updating student: ", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to update student",
		});
	}
};

export const deleteStudent = async (req, res) => {
	// console.log(req.params.id);
	try {
		const findStudent = await Students.findOne({ _id: req.params.id });
		if (!findStudent) {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}
		if (
			findStudent.profilePhoto &&
			fs.existsSync(
				path.join(
					__dirname,
					"../../../uploads/",
					findStudent.profilePhoto
				)
			)
		) {
			fs.unlink(
				path.join(
					__dirname,
					"../../../uploads/",
					findStudent.profilePhoto
				),
				(err) => err && console.error("Failed to delete file:", err)
			);
		}
		const deletedStudent = await students.findByIdAndDelete(req.params.id);
		return res.status(200).json({
			status: "success",
			message: "Student deleted successfully",
			student: deletedStudent,
		});
	} catch (err) {
		console.error("Error deleting student: ", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to delete student",
		});
	}
};
