import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Define the upload directory
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Create upload directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Enhanced schema with timestamps and better validation
const studentSchema = mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 50,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 50,
		},
		gender: {
			type: String,
			required: true,
			enum: ["male", "female", "other"],
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please fill a valid email address",
			],
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
		},
		hobby: {
			type: [String],
			default: [],
		},
		city: {
			type: String,
			required: true,
			trim: true,
		},
		profilePhoto: {
			type: String,
			required: true,
		},
	},
	{
		// Add timestamps for createdAt and updatedAt
		timestamps: true,
	}
);

// Define file storage configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, UPLOAD_DIR);
	},
	filename: (req, file, cb) => {
		// Generate random string to ensure uniqueness
		const randomString = crypto.randomBytes(8).toString("hex");
		// Use original file extension
		const ext = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${Date.now()}-${randomString}${ext}`);
	},
});

// File filter to validate uploaded images
const fileFilter = (req, file, cb) => {
	// Accept only image files
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new Error("Only image files are allowed!"), false);
	}
};

// Configure multer with improved settings
studentSchema.statics.uploadStudentProfilePhoto = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 2 * 1024 * 1024, // 2MB limit
	},
}).single("profilePhoto");

// Create the model
const Students = mongoose.model("student", studentSchema);

export default Students;
