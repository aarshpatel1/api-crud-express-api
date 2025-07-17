import students from "../../../models/studentsModel.js";
import * as studentsController from "../../../controllers/api/v1/studentsController.js";

import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
	"/getAllStudents",
	passport.authenticate("jwt", {
		failureRedirect: "/api/v1/students/failedLogin",
	}),
	studentsController.getAllStudents
);

router.get(
	"/getAStudent/:id",
	passport.authenticate("jwt", {
		failureRedirect: "/api/v1/students/failedLogin",
	}),
	studentsController.getAStudent
);

router.post(
	"/addStudent",
	passport.authenticate("jwt", {
		failureRedirect: "/api/v1/students/failedLogin",
	}),
	students.uploadStudentProfilePhoto,
	studentsController.addStudent
);

router.put(
	"/updateStudent/:id",
	passport.authenticate("jwt", {
		failureRedirect: "/api/v1/students/failedLogin",
	}),
	students.uploadStudentProfilePhoto,
	studentsController.updateStudent
);

router.patch(
	"/updateStudent/:id",
	passport.authenticate("jwt", {
		failureRedirect: "/api/v1/students/failedLogin",
	}),
	students.uploadStudentProfilePhoto,
	studentsController.updateStudent
);

router.delete(
	"/deleteStudent/:id",
	passport.authenticate("jwt", {
		failureRedirect: "/api/v1/students/failedLogin",
	}),
	studentsController.deleteStudent
);

router.get("/failedLogin", studentsController.failedLogin);

export default router;
