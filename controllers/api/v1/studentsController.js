import students from "../../../models/studentsModel.js"

export const getAllStudents = async (req, res) =>{
	try{
		const allStudents = await students.find()
		return res.status(200).json({
			status: "success",
			message: "Get all students data successfully",
			allStudents
		})
		
	}  catch (err) {
		console.error("Error getting all students",err)
		return res.status(500).json({
			status: "error",
			message: "Failed to get all students data"
		})
	}
}

export const getAStudent = async (req, res) => {
	console.log(req.params.id)
	try{
		const findStudent = await students.findOne({_id:req.params.id})
		if (findStudent) {
			return res.status(200).json({
				status: "success",
				message: "Student found successfully",
				findStudent
			})
		} else {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist"
			})
		}
	} catch (err) {
		console.error("Error finding a student: ",err)
		return res.status(500).json({
			status: "error",
			message: "Failed to find a student"			
		})
	}
}

export const addStudent = async (req, res)=>{
	console.log(req.body)
	try{
		const addedStudent = await students.create(req.body) 
		return res.status(201).json({
			status: "success",
			message: "Student added successfully",
		})
	} catch (err) {
		console.error("Error adding student:", err);
		return res.status(500).json({
			status: "error",
			message: "Failed to add student",
		});
	}
}

export const updateStudent = async (req, res) => {
	console.log(req.params.id)
	console.log(req.body)
	try{
		const findStudent = await students.findOne({_id:req.params.id})
		if (findStudent) {
			const updateAStudent = await students.findByIdAndUpdate(req.params.id, req.body)
			return res.status(200).json({
				status: "success",
				message: "Student updated successfully"
			})
		} else {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist"
			})
		}
	} catch (err) {
		console.error("Error updating student: ",err)
		return res.status(500).json({
			status: "error",                              
			message: "Failed to updating student"			
		})
	}
}

export const deleteStudent = async (req, res)=> {
	console.log(req.params.id)
	try{
		const findStudent = await students.findOne({_id:req.params.id})
		if (findStudent) {
			const deleteStudent = await students.findByIdAndDelete(req.params.id)
			return res.status(200).json({
				status: "success",
				message: "Student deleted successfully"
			})
		} else {
			return res.status(404).json({
				status: "not found",
				message: "Student does not exist"
			})
		}
	} catch (err) {
		console.error("Error deleting student: ",err)
		return res.status(500).json({
			status: "error",
			message: "Failed to delete student"			
		})
	}
}