import Faculties from "../../../models/facultiesModel.js";

import { config } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

config({
	path: "./.env",
	quiet: true,
});

const saltRounds = 10;

// Helper function for consistent error responses
const handleError = (res, error, message, statusCode = 500) => {
	console.error(`${message}:`, error);
	return res.status(statusCode).json({
		status: "error",
		message,
		// Only show error details in development
		...(process.env.NODE_ENV !== "production" && {
			details: error.message,
		}),
	});
};

export const register = async (req, res) => {
	const { email, password, confirmPassword } = req.body;

	try {
		// Check if email is already registered
		const existingFaculty = await Faculties.findOne({ email: email });
		if (existingFaculty) {
			return res.status(409).json({
				status: "conflict",
				message: "Faculty already exists with this email address",
			});
		}

		// Validate password match
		if (password !== confirmPassword) {
			return res.status(400).json({
				status: "error",
				message: "Password and confirm password do not match",
			});
		}

		// Password strength validation
		const passwordRegex =
			/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
		if (!passwordRegex.test(password)) {
			return res.status(400).json({
				status: "error",
				message:
					"Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
			});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create new faculty record
		// We don't need to set createdAt/updatedAt manually - handled by mongoose timestamps
		const registeredFaculty = await Faculties.create({
			email,
			password: hashedPassword,
		});

		// Return success response without exposing password
		const facultyResponse = registeredFaculty.toObject();
		delete facultyResponse.password;

		return res.status(201).json({
			status: "success",
			message: "Faculty registered successfully",
			faculty: facultyResponse,
		});
	} catch (error) {
		// Fixed variable name from 'err' to 'error'
		return handleError(res, error, "Failed to register faculty");
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if faculty exists
		const faculty = await Faculties.findOne({ email: email });
		if (!faculty) {
			return res.status(404).json({
				status: "not found",
				message: "Faculty not found",
			});
		}

		// Check if account is active
		if (!faculty.status) {
			return res.status(403).json({
				status: "forbidden",
				message:
					"Account is deactivated. Please contact administrator.",
			});
		}

		// Verify password
		const passwordMatches = await bcrypt.compare(
			password,
			faculty.password
		);
		if (!passwordMatches) {
			return res.status(401).json({
				status: "unauthorized",
				message: "Invalid credentials",
			});
		}

		// Create sanitized user object for token
		const facultyForToken = {
			_id: faculty._id,
			email: faculty.email,
		};

		// Generate JWT token
		const token = jwt.sign(
			{ facultyData: facultyForToken },
			process.env.JWT_SECRET,
			{
				expiresIn: process.env.JWT_EXPIRY || "1h",
			}
		);

		// Return success response without exposing password
		const facultyResponse = faculty.toObject();
		delete facultyResponse.password;

		return res.status(200).json({
			status: "success",
			message: "Faculty logged in successfully",
			faculty: facultyResponse,
			token,
		});
	} catch (error) {
		// Fixed variable name from 'err' to 'error'
		return handleError(res, error, "Failed to login faculty");
	}
};
