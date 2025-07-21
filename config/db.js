import mongoose from "mongoose";
import { config } from "dotenv";

config({
	path: "./.env",
	quiet: true,
});

// Set up mongoose connection options
const connectOptions = {
	serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
	socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
	family: 4, // Use IPv4, skip trying IPv6
};

// Connect to MongoDB with better error handling
const connectToDatabase = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, connectOptions);
		console.log("MongoDB Atlas Connected Successfully!");

		// Set up event handlers for connection issues
		mongoose.connection.on("error", (err) => {
			console.error("MongoDB connection error:", err);
		});

		mongoose.connection.on("disconnected", () => {
			console.warn("MongoDB disconnected. Attempting to reconnect...");
		});

		// Handle application termination
		process.on("SIGINT", async () => {
			await mongoose.connection.close();
			console.log("MongoDB connection closed due to app termination");
			process.exit(0);
		});
	} catch (err) {
		console.error("Error connecting to MongoDB Atlas:", err.message);
		// Exit with failure in production, or retry in development
		if (process.env.NODE_ENV === "production") {
			process.exit(1);
		}
		// In development, let the server start anyway and retry connection
	}
};

// Execute connection
connectToDatabase();

const db = mongoose.connection;

export default db;
