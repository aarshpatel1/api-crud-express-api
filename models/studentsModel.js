import path from "path";
import fs from "fs";

import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { config } from "dotenv";

config({
	path: "./.env",
	quiet: true,
});

const studentSchema = mongoose.Schema({
	firstName: {
		type: String,
		require: true,
	},
	lastName: {
		type: String,
		require: true,
	},
	gender: {
		type: String,
		require: true,
	},
	email: {
		type: String,
		require: true,
	},
	password: {
		type: String,
		require: true,
	},
	hobby: {
		type: Array,
	},
	city: {
		type: String,
		require: true,
	},
	profilePhoto: {
		type: String,
		require: true,
	},
});

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "studentProfilePhotos",
		allowed_formats: ["jpg", "png", "jpeg"],
	},
});

// if (!fs.existsSync(path.join("uploads"))) {
// 	fs.mkdirSync(path.join("uploads"), { recursive: true });
// }

// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, path.join("uploads/"));
// 	},
// 	filename: (req, file, cb) => {
// 		const ext = path.extname(file.originalname);
// 		cb(null, file.fieldname + "-" + Date.now() + ext);
// 	},
// });

studentSchema.statics.uploadStudentProfilePhoto = multer({
	storage: storage,
}).single("profilePhoto");

const students = mongoose.model("student", studentSchema);

export default students;
