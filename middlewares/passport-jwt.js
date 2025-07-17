import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { config } from "dotenv";
import passport from "passport";
import Faculties from "../models/facultiesModel.js";

config({
	path: "./.env",
	quiet: true,
});

let options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET,
};

passport.use(
	"jwt",
	new JwtStrategy(options, async (payload, done) => {
		// console.log(payload);
		try {
			const checkFaculty = await Faculties.findById(payload.facultyData._id);
			if (checkFaculty) {
				return done(null, checkFaculty);
			} else {
				return done(null, false);
			}
		} catch (error) {
			return done(error, false);
		}
	})
);

passport.serializeUser((user, done) => {
	return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const facultyData = await Faculties.findById(id);
		if (facultyData) {
			return done(null, facultyData);
		} else {
			return done(null, false);
		}
	} catch (error) {
		return done(error, false);
	}
});

export default passport;
