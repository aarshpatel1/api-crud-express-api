import mongoose from "mongoose";
import { config } from "dotenv";

// Load environment variables
config({
	path: "./.env",
	quiet: true,
});

// MongoDB connection options
const options = {
	serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
	socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
	autoIndex: process.env.NODE_ENV !== "production", // Don't build indexes in production
	maxPoolSize: 10, // Maintain up to 10 socket connections
	family: 4, // Use IPv4, skip trying IPv6
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

/**
 * Connect to MongoDB and set up event listeners for connection states
 */
const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, options);

		console.log(`MongoDB Connected: ${conn.connection.host}`);

		return conn.connection;
	} catch (error) {
		console.error(`Error connecting to MongoDB: ${error.message}`);
		// Exit process with failure if in production, otherwise just log the error
		if (process.env.NODE_ENV === "production") {
			process.exit(1);
		}
	}
};

// Set up connection event listeners
mongoose.connection.on("error", (err) => {
	console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
	console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
	console.log("MongoDB reconnected successfully");
});

// Handle application termination - close MongoDB connection properly
process.on("SIGINT", async () => {
	try {
		await mongoose.connection.close();
		console.log("MongoDB connection closed through app termination");
		process.exit(0);
	} catch (err) {
		console.error("Error closing MongoDB connection:", err);
		process.exit(1);
	}
});

// Initialize the database connection
const db = connectDB();

export default db;
