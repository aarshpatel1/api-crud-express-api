import db from "./config/db.js";
import routes from "./routes/api/v1/index.js";
import passportjwt from "./middlewares/passport-jwt.js";
import express from "express";
import passport from "passport";
import { config } from "dotenv";
import session from "express-session";
import helmet from "helmet"; // Add helmet for security headers
import cors from "cors"; // Add CORS support
import path from "path";

config({
	path: "./.env",
	quiet: true,
});

const app = express();
const port = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// CORS configuration
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "*",
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(
	session({
		name: "passportJWT",
		secret: process.env.SESSION_SECRET,
		resave: false, // Changed to false for better performance
		saveUninitialized: false, // Changed to false for better privacy
		cookie: {
			maxAge: 1000 * 60 * 60,
			httpOnly: true, // Added for security
			secure: process.env.NODE_ENV === "production", // Secure in production
			sameSite: "lax", // Added for CSRF protection
		},
		// Uncommented the store configuration to avoid memory leaks in production
		/*
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
        }),
        */
	})
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use("/api/v1", routes);

// Global error handler
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);
	res.status(500).json({
		status: "error",
		message: "Internal server error",
		...(process.env.NODE_ENV !== "production" && {
			errorDetails: err.message,
		}),
	});
});

// 404 handler (should be after all other routes)
app.use((req, res, next) => {
	res.status(404).json({
		status: "error",
		message: "Endpoint not found",
	});
});

// Start server
app.listen(port, (err) =>
	err
		? console.error("Error starting server:", err)
		: console.log(`Server running on http://127.0.0.1:${port}`)
);
