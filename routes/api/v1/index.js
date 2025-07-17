import express from "express";
import studentRoutes from "./students.routes.js";
import facultiesRoutes from "./faculties.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
	res.status(200).json({
		message: "API v1 endpoints",
		endpoints: {
			students: "/students - Student management endpoints",
			faculties: "/faculties - Faculty authnetication endpoints",
		},
	});
});

router.use("/students", studentRoutes);

router.use("/faculties", facultiesRoutes);

export default router;
