import express from "express";
import * as facultiesController from "../../../controllers/api/v1/facultiesController.js";
import { validateFaculty } from "../../../middlewares/validators.js";

const router = express.Router();

// Added validation middleware to register route
router.post(
	"/register",
	validateFaculty("register"),
	facultiesController.register
);

// Added validation middleware to login route
router.post("/login", validateFaculty("login"), facultiesController.login);

export default router;
