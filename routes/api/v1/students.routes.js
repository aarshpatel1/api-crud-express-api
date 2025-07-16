import express from "express"
import * as studentsController from "../../../controllers/api/v1/studentsController.js"


const router = express.Router()

router.get("/getAllStudents", studentsController.getAllStudents)

router.get('/getAStudent/:id', studentsController.getAStudent)

router.post("/addStudent", studentsController.addStudent)

router.put("/updateStudent/:id", studentsController.updateStudent)

router.patch("/updateStudent/:id", studentsController.updateStudent)

router.delete("/deleteStudent/:id", studentsController.deleteStudent)

export default router;