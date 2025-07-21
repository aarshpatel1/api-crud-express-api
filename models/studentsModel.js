import mongoose from "mongoose";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp";

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

// Cloudinary storage with image compression using Sharp
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: async (req, file) => {
		return {
			folder: "students",
			format: "jpg", // force jpg for compression
			transformation: [
				{ width: 400, height: 400, crop: "limit" }, // resize if needed
				{ quality: "auto:good" }, // cloudinary compression
			],
		};
	},
});

// Multer middleware with sharp compression before upload
const uploadStudentProfilePhoto = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Only image files are allowed!"), false);
		}
	},
	limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("profilePhoto");

// Middleware to compress image before uploading to Cloudinary
export const compressAndUpload = (req, res, next) => {
	if (!req.file) return next();
	const buffer = req.file.buffer;
	sharp(buffer)
		.resize(400, 400, { fit: "inside" })
		.jpeg({ quality: 80 })
		.toBuffer()
		.then((data) => {
			req.file.buffer = data;
			next();
		})
		.catch((err) => next(err));
};

studentSchema.statics.uploadStudentProfilePhoto = uploadStudentProfilePhoto;

const Students = mongoose.model("student", studentSchema);

export default Students;
