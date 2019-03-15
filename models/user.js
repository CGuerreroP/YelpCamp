const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");
      
// SCHEMA SETUP
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    // comments : [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Comment"
    //     }
    // ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);