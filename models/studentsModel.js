import mongoose from "mongoose"

const studentSchema = mongoose.Schema({
	firstName: {
		type: String,
		require: true
	},
	lastName: {
		type: String,
		require:true
	},
	gender: {
		type: String,
		require: true
	},
	email:{
		type:String,
		require:true
	},
	password: {
		type: String,
		require: true
	},
	hobby: {
		type: Array
	},
	city: {
		type: String,
		require: true
	},
	// profilePhoto: {
		// type: String,
		// require: true
	// }
	
})

const students = mongoose.model("Students", studentSchema)

export default students