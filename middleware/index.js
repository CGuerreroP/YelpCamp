const Campground = require("../models/campground"),
      Comment    = require("../models/comment");


const middlewareObj = {};

//middleware to check if log in
middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

//middleware to check if you own the camp
middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundcampground) => {
            if(err){
                res.redirect("back");
            } else if(foundcampground.author.id.equals(req.user._id)){
               next();
            } else {
                res.redirect("back");
            }
        });
    } else {
        res.redirect("back");
    }
};

//middleware to check if you own the comment
middlewareObj.checkCommentOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundcomment) => {
            if(err){
                res.redirect("back");
                //does user own the comment?
            } else if(foundcomment.author.id.equals(req.user._id)){
               next();
            } else {
                res.redirect("back");
            }
        });
    } else {
        res.redirect("back");
    }
};

module.exports = middlewareObj;

