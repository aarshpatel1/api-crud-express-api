import students from "../../../models/studentsModel.js";

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

		const allStudents = await students
			.find(query)
			.sort(sortOptions)
			.skip(currentPage * recordsPerPage)
			.limit(recordsPerPage);

		const totalStudents = await students.countDocuments(query);
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
	try {
		const findStudent = await students.findOne({ _id: req.params.id });
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
	try {
		// If file was uploaded, we already have the Cloudinary URL in req.file.path
		if (req.file) {
			// Cloudinary already uploaded the file, just save the path
			req.body.profilePhoto = req.file.path;
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

export const updateStudent = async (req, res) => {
	try {
		const findStudent = await students.findOne({ _id: req.params.id });
		if (!findStudent) {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}

		// If student exists and we're uploading a new image
		if (findStudent.profilePhoto && req.file) {
			try {
				// Extract public_id from the Cloudinary URL
				const publicId = findStudent.profilePhoto
					.split("/")
					.pop()
					.split(".")[0];
				// Delete the old image from Cloudinary
				await cloudinary.uploader.destroy(
					`studentProfilePhotos/${publicId}`
				);
			} catch (cloudinaryError) {
				console.error(
					"Failed to delete old image from Cloudinary:",
					cloudinaryError
				);
				// Continue with the update even if image deletion fails
			}
		}

		// If a new file was uploaded, update the profile photo
		if (req.file) {
			req.body.profilePhoto = req.file.path;
		}

		// Update the student record
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
		console.error("Error updating student: ", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to update student",
			error: err.message,
		});
	}
};

export const deleteStudent = async (req, res) => {
	try {
		const findStudent = await students.findOne({ _id: req.params.id });
		if (!findStudent) {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist",
			});
		}

		// If the student has a profile photo, delete it from Cloudinary
		if (findStudent.profilePhoto) {
			try {
				// Extract public_id from the Cloudinary URL
				const publicId = findStudent.profilePhoto
					.split("/")
					.pop()
					.split(".")[0];
				// Delete the image from Cloudinary
				await cloudinary.uploader.destroy(
					`studentProfilePhotos/${publicId}`
				);
			} catch (cloudinaryError) {
				console.error(
					"Failed to delete image from Cloudinary:",
					cloudinaryError
				);
				// Continue with the deletion even if image deletion fails
			}
		}

		// Delete the student record
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
			error: err.message,
		});
	}
};
