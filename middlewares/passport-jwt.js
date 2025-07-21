import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { config } from "dotenv";
import passport from "passport";
import Faculties from "../models/facultiesModel.js";

config({
	path: "./.env",
	quiet: true,
});

// JWT strategy options with better security
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET,
	// Added ignoreExpiration to ensure expired tokens are rejected
	ignoreExpiration: false,
	// Added issuer and audience for additional security (uncomment if you configure these in your tokens)
	// issuer: process.env.JWT_ISSUER,
	// audience: process.env.JWT_AUDIENCE,
};

// Configure JWT strategy
passport.use(
	"jwt",
	new JwtStrategy(jwtOptions, async (payload, done) => {
		try {
			// Check if token payload has expected data
			if (!payload.facultyData || !payload.facultyData._id) {
				return done(null, false, { message: "Invalid token payload" });
			}

			// Check token expiration
			const currentTimestamp = Math.floor(Date.now() / 1000);
			if (payload.exp && payload.exp < currentTimestamp) {
				return done(null, false, { message: "Token expired" });
			}

			// Find faculty by ID
			const faculty = await Faculties.findById(payload.facultyData._id);

			// Check if faculty exists and is active
			if (!faculty) {
				return done(null, false, { message: "Faculty not found" });
			}

			if (!faculty.status) {
				return done(null, false, {
					message: "Faculty account inactive",
				});
			}

			// Authentication successful
			return done(null, faculty);
		} catch (error) {
			return done(error, false);
		}
	})
);

// Session serialization
passport.serializeUser((user, done) => {
	return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const faculty = await Faculties.findById(id);
		if (faculty && faculty.status) {
			return done(null, faculty);
		} else {
			return done(null, false, {
				message: faculty ? "Account inactive" : "Faculty not found",
			});
		}
	} catch (error) {
		return done(error, false);
	}
});

export default passport;
