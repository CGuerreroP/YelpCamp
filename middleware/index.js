const Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      Review     = require("../models/review");


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
            } else if(foundcampground.author.id.equals(req.user._id) || req.user.isAdmin){
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
            } else if(foundcomment.author.id.equals(req.user._id) || req.user.isAdmin){
               next();
            } else {
                req.flash("error", "Permission denied");
                res.redirect("back");
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewOwnership = (req, res, next) => {
    if(req.isAuthenticated()) {
        Review.findById(req.params.review_id, (err, review) => {
            if(err || !review) {
                req.flash("error", "Review not found");
                res.redirect("back");
            } else if(review.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "Permission denied");
                res.redirect("back");
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = (req, res, next) => {
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec((err, campground) => {
            if(err || !campground) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                let foundUser = campground.reviews.some(review => {
                    return review.author.id.equals(req.user._id);
                });
                if(foundUser) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect(`/campgrounds/${campground._id}`);
                }
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

middlewareObj.checkIfSearch = (req, res, next) => {
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({location: regex}, (err, allCampgrounds) => {
            if(err){
                console.log(err);
            } else {
                const matches = allCampgrounds.length;
                const target = req.query.search;
                const ifSearch = true;
                res.render("campgrounds/index", {campgrounds: allCampgrounds, matches: matches, 
                    page: "campgrounds", target: target, ifSearch: ifSearch});
            }
        });
    } else {
        next();
    }
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = middlewareObj;

