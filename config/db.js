import mongoose  from "mongoose"
import {config} from "dotenv"

config({
	path: "./.env",
	quiet: true
})

mongoose.connect(process.env.MONGO_URI).then(()=>{console.log("MongoDB Atlas Connected..!")}).catch((err)=>console.error("Error connecting to the MongoDB Atlas..!"))

const db = mongoose.connection;

export default db;