import express from "express";
import { config } from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import db from "./config/db.js";
import routes from "./routes/api/v1/index.js";

// Load environment variables
config({
	path: "./.env",
	quiet: true,
});

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS for all routes

// Rate limiting to prevent abuse
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: {
		status: "error",
		message: "Too many requests, please try again later.",
	},
});
app.use("/api/", limiter);

// Logging in development mode
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// Body parsers
app.use(express.json({ limit: "10kb" })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// API routes
app.use("/api/v1", routes);

// Handle 404 - Route not found
app.use("*", (req, res) => {
	res.status(404).json({
		status: "error",
		message: `Can't find ${req.originalUrl} on this server!`,
	});
});

// Global error handler
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);

	res.status(err.status || 500).json({
		status: "error",
		message: err.message || "An unexpected error occurred",
		error: process.env.NODE_ENV === "development" ? err.stack : undefined,
	});
});

// Start server
app.listen(port, (err) => {
	if (err) {
		console.error("Error starting server:", err);
		process.exit(1);
	}
	console.log(
		`Server running in ${process.env.NODE_ENV || "development"} mode`
	);
	console.log(`Server listening at http://127.0.0.1:${port}`);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
	console.error("UNHANDLED REJECTION! Shutting down...");
	console.error(err.name, err.message);
	process.exit(1);
});
