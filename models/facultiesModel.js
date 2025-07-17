import mongoose from "mongoose";

const facultiesSchema = mongoose.Schema({
	email: {
		type: String,
		require: true,
	},
	password: {
		type: String,
		require: true,
	},
	status: {
		type: Boolean,
		require: true,
		default: true,
	},
	createdAt: {
		type: String,
		require: true,
	},
	updatedAt: {
		type: String,
		require: true,
	},
});

const Faculties = mongoose.model("faculty", facultiesSchema);

export default Faculties;
