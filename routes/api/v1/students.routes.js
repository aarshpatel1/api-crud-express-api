import express from "express";
import students from "../../../models/studentsModel.js";
import * as studentsController from "../../../controllers/api/v1/studentsController.js";

const router = express.Router();

router.get("/getAllStudents", studentsController.getAllStudents);

router.get("/getAStudent/:id", studentsController.getAStudent);

router.post(
	"/addStudent",
	students.uploadStudentProfilePhoto,
	studentsController.addStudent
);

router.put(
	"/updateStudent/:id",
	students.uploadStudentProfilePhoto,
	studentsController.updateStudent
);

router.patch(
	"/updateStudent/:id",
	students.uploadStudentProfilePhoto,
	studentsController.updateStudent
);

router.delete("/deleteStudent/:id", studentsController.deleteStudent);

export default router;
