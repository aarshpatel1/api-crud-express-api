import db from "./config/db.js";
import routes from "./routes/api/v1/index.js";
import passportjwt from "./middlewares/passport-jwt.js";

import express from "express";
import passport from "passport";
import { config } from "dotenv";
import session from "express-session";

config({
	path: "./.env",
	quiet: true,
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extened: true }));

app.use(
	session({
		name: "passportJWT",
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		cookie: {
			maxAge: 1000 * 60 * 60,
		},
		// store: MongoStore.create({
		// 	mongoUrl: process.env.MONGO_URI,
		// 	collectionName: "sessions",
		// }),
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", routes);

app.listen(port, (err) =>
	err
		? console.error("Error in starting server: ", err)
		: console.log("Server is running on http://127.0.0.1:" + port)
);
