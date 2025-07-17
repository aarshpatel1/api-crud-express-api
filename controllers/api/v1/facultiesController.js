import Faculties from "../../../models/facultiesModel.js";

import bcrypt from "bcrypt";
import moment from "moment";

const saltRounds = 10;

export const register = async (req, res) => {
	const { email, password, confirmPassword } = req.body;
	try {
		const checkFaculty = await Faculties.findOne({ email: email });
		if (!checkFaculty) {
			if (password === confirmPassword) {
				let hashedPassword = await bcrypt.hash(password, saltRounds);
				req.body.password = hashedPassword;
				req.body.createdAt = moment().format("L LTS");
				req.body.updatedAt = moment().format("L LTS");
				let registeredFaculty = await Faculties.create(req.body);
				return res.status(201).json({
					status: "success",
					message: "Faculty registerd successfully",
					faculty: registeredFaculty,
				});
			} else {
				return res.status(400).json({
					status: "error",
					message: "Password and confirm password does not match",
				});
			}
		} else {
			return res.status(409).json({
				status: "already exists",
				message: "Faculty already exists with this email address",
			});
		}
	} catch (error) {
		console.error("Error registering faculty:", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to register faculty",
		});
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		let checkFaculty = await Faculties.findOne({ email: email });
		if (checkFaculty) {
			let matchPassword = await bcrypt.compare(
				password,
				checkFaculty.password
			);
			if (matchPassword) {
				return res.status(200).json({
					status: "success",
					message: "Faculty logged in successfully",
					faculty: checkFaculty,
				});
			} else {
				return res.status(400).json({
					status: "error",
					message: "Password does not match",
				});
			}
		} else {
			return res.status(404).json({
				status: "not found",
				message: "Faculty not found",
			});
		}
	} catch (error) {
		console.error("Error logging in faculty:", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to login faculty",
		});
	}
};
