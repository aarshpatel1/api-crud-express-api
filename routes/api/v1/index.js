import express from "express"
import studentRoutes from "./students.routes.js"

const router = express.Router();

router.get("/", (req, res) => {
	res.status(200).json({
		message: "API v1 endpoints",
		endpoints: {
			students: "/students - Student management endpoints",
		},
	});
});

router.use("/students", studentRoutes)

export default router