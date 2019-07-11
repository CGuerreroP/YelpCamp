const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");
      
// SCHEMA SETUP
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: String,
    firstName: String,
    lastName: String,
    avatar: {
        secure_url: { type: String, default: '/images/default-profile.jpg' },
        public_id: String
    },
    email: { type: String, unique: true, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: { type: Boolean, default: false },
    reviewsCount : { type: Number, default: 0 }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);