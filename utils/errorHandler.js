/**
 * Central error handling middleware for API responses
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} message - User-friendly error message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Response object
 */
export const handleApiError = (
	res,
	error,
	message = "An error occurred",
	statusCode = 500
) => {
	console.error(`${message}:`, error);

	// Determine if error is a validation error
	if (error.name === "ValidationError") {
		statusCode = 400;
		message = "Validation failed";
	}

	// Determine if error is a duplicate key error
	if (error.code === 11000) {
		statusCode = 409;
		message = "Duplicate key error";
	}

	return res.status(statusCode).json({
		status: "error",
		message,
		// Only include detailed error info in non-production environments
		...(process.env.NODE_ENV !== "production" && {
			errorDetails: error.message,
			stack:
				process.env.NODE_ENV === "development"
					? error.stack
					: undefined,
		}),
	});
};
