import mongoose from "mongoose";

// Enhanced schema with proper validation and timestamps
const facultiesSchema = mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please fill a valid email address",
			],
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
		},
		status: {
			type: Boolean,
			required: true,
			default: true,
		},
		// Removed manual date strings in favor of automatic timestamps
		// createdAt and updatedAt will be handled automatically
	},
	{
		// Added timestamps to automatically manage creation and update dates
		timestamps: true,
	}
);

const Faculties = mongoose.model("faculty", facultiesSchema);

export default Faculties;
