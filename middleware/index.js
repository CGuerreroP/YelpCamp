const Campground = require("../models/campground"),
      Comment    = require("../models/comment");


const middlewareObj = {};

//middleware to check if log in
middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in");
    res.redirect("/login");
};

//middleware to check if you own the camp
middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundcampground) => {
            if(err || !foundcampground){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else if(foundcampground.author.id.equals(req.user._id)){
               next();
            } else {
                req.flash("error", "Permission denied");
                res.redirect("back");
            }
        });
    } else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
};

//middleware to check if you own the comment
middlewareObj.checkCommentOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundcomment) => {
            if(err || !foundcomment){
                req.flash("error", "Comment not found");
                res.redirect("back");
                //does user own the comment?
            } else if(foundcomment.author.id.equals(req.user._id)){
               next();
            } else {
                req.flash("error", "Permission denied");
                res.redirect("back");
            }
        });
    } else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
};

module.exports = middlewareObj;

