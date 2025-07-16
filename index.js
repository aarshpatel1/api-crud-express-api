import express from "express";
import { config } from "dotenv";

import db from "./config/db.js";
import routes from "./routes/api/v1/index.js";

config({
	path: "./.env",
	quiet: true,
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extened: true }));

app.use("/api/v1", routes);

app.listen(port, (err) =>
	err
		? console.error("Error in starting server: ", err)
		: console.log("Server is running on http://127.0.0.1:" + port)
);
