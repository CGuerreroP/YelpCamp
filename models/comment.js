const mongoose = require("mongoose");
// SCHEMA SETUP
const commentSchema = new mongoose.Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    isAdminEdit: { type: Boolean, default: false },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        avatar: String
    },
    campground: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campground"
        },
        name: String
    }
});

module.exports = mongoose.model("Comment", commentSchema);