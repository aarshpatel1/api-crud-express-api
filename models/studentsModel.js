import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: "./.env" });

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const studentSchema = mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true, // Fixed: 'require' → 'required'
			trim: true, // Added: trim whitespace
			minLength: [2, "First name must be at least 2 characters"],
			maxLength: [50, "First name cannot exceed 50 characters"],
		},
		lastName: {
			type: String,
			required: true, // Fixed: 'require' → 'required'
			trim: true, // Added: trim whitespace
			minLength: [2, "Last name must be at least 2 characters"],
			maxLength: [50, "Last name cannot exceed 50 characters"],
		},
		gender: {
			type: String,
			required: true, // Fixed: 'require' → 'required'
			enum: {
				values: ["male", "female", "other"],
				message: "Gender must be male, female, or other",
			},
		},
		email: {
			type: String,
			required: true, // Fixed: 'require' → 'required'
			trim: true,
			lowercase: true,
			unique: true, // Added: ensure unique emails
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please provide a valid email address",
			],
		},
		password: {
			type: String,
			required: true, // Fixed: 'require' → 'required'
			minLength: [6, "Password must be at least 6 characters"],
		},
		hobby: {
			type: Array,
			validate: {
				validator: function (v) {
					return v && v.length > 0;
				},
				message: "At least one hobby is required",
			},
		},
		city: {
			type: String,
			required: true, // Fixed: 'require' → 'required'
			trim: true,
		},
		profilePhoto: {
			type: String,
			required: false, // Changed: Made optional to handle cases where photo upload fails
		},
	},
	{
		timestamps: true, // Added: automatic createdAt and updatedAt fields
	}
);

// Configure Cloudinary storage instead of local disk storage
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "student-profiles",
		allowed_formats: ["jpg", "jpeg", "png"],
		transformation: [
			{ width: 500, height: 500, crop: "limit" },
			{ quality: "auto:good" },
			{ fetch_format: "auto" },
		],
		public_id: (req, file) => {
			const uniqueSuffix =
				Date.now() + "-" + Math.round(Math.random() * 1e9);
			const filename = file.fieldname + "-" + uniqueSuffix;
			return filename;
		},
	},
});

// File filter function to validate image types
const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new Error("Not an image! Please upload only images."), false);
	}
};

// Set up multer with Cloudinary storage
studentSchema.statics.uploadStudentProfilePhoto = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 2, // Limit to 2MB
	},
	fileFilter: fileFilter,
}).single("profilePhoto");

// Pre-save hook to handle password hashing (if you implement auth later)
// studentSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

const students = mongoose.model("student", studentSchema);

export default students;
