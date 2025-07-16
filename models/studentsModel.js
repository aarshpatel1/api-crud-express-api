import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";


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

if (!fs.existsSync(path.join("uploads"))) {
	fs.mkdirSync(path.join("uploads"), { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join("uploads/"));
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + "-" + Date.now() + ext);
	},
});

studentSchema.statics.uploadStudentProfilePhoto = multer({
	storage: storage,
}).single("profilePhoto");

const students = mongoose.model("student", studentSchema);

export default students;
