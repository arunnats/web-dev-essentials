const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	oauth: {
		google: {
			id: String,
			name: String,
		},
	},
});

module.exports = mongoose.model("User", userSchema);
