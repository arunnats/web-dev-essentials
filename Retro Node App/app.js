const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./public/mongo/user");
const path = require("path");

const app = express();

// mongoose.connect("YOUR_MONGO_URI", {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// });

passport.use(
	new GoogleStrategy(
		{
			clientID: "YOUR_GOOGLE_CLIENT_ID",
			clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
			callbackURL: "http://localhost:3000/auth/google/callback",
		},
		(accessToken, refreshToken, profile, done) => {
			User.findOne({ "oauth.google.id": profile.id }, (err, user) => {
				if (err) return done(err);

				if (user) {
					return done(null, user);
				}

				const newUser = new User({
					oauth: {
						google: {
							id: profile.id,
							name: profile.displayName,
						},
					},
				});

				newUser.save((saveErr) => {
					if (saveErr) return done(saveErr);
					return done(null, newUser);
				});
			});
		}
	)
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
	User.findById(id, (err, user) => done(err, user))
);

app.use(
	session({ secret: "your-secret-key", resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	if (req.isAuthenticated()) {
		res.redirect("/content");
	} else {
		res.render("landing");
	}
});

app.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
	"/auth/google/callback",
	passport.authenticate("google", { failureRedirect: "/" }),
	(req, res) => res.redirect("/content")
);

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

app.get("/content", (req, res) => {
	if (req.isAuthenticated()) {
		res.render("content");
	} else {
		res.redirect("/");
	}
});

app.get("/login", (req, res) => {
	if (req.isAuthenticated()) {
		res.redirect("/content");
	} else {
		res.render("login");
	}
});

app.get("/signup", (req, res) => {
	if (req.isAuthenticated()) {
		res.redirect("/content");
	} else {
		res.render("signup");
	}
});

app.get("/change-password", (req, res) => {
	if (req.isAuthenticated()) {
		res.render("changepassword");
	} else {
		res.redirect("/content");
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
