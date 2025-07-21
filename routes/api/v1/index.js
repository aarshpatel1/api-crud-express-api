import express from "express";
import studentRoutes from "./students.routes.js";
import facultiesRoutes from "./faculties.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
	res.status(200).json({
		message: "Welcome to API v1 endpoints",
		endpoints: [
			{ path: "/students", description: "Student management endpoints" },
			{
				path: "/faculties",
				description: "Faculty authentication endpoints",
			},
		],
	});
});

router.use("/students", studentRoutes);

router.use("/faculties", facultiesRoutes);

export default router;
