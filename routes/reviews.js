const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      User       = require("../models/user"),
      Review    = require("../models/review"),
      middleware = require("../middleware");
      
let calculateAverage = (reviews) => {
    if(reviews.length === 0) {
        return 0;
    }
    let sum = 0;
    reviews.forEach(review =>{
        sum += review.rating;
    });
    return sum / reviews.length;
};
      
// Reviews Index
router.get("/", (req, res) => {
    Campground.findById(req.params.id).populate({ path: "reviews", options: {sort: {createdAt: -1}} })  // sorting the populated reviews array to show the latest first
    .exec((err, campground) => {
        if(err || !campground) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {campground: campground});
    });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, middleware.checkIfSearch, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {campground: campground});
    });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, (req, res) => {
    Campground.findById(req.params.id).populate("reviews").exec((err, campground) => {
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, (err, review) => {
            if(err){
                req.flash("error", err.message);
                return res.redirect("back");
            }
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.campground = campground;
            review.save();
            campground.reviews.push(review);
            campground.rating = calculateAverage(campground.reviews);
            campground.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect(`/campgrounds/${campground._id}`);
        });
    }) ;
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, middleware.checkIfSearch, (req, res) => {
    Review.findById(req.params.review_id, (err, review) => {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {campground_id: req.params.id, review: review});
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, (err, review) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findById(req.params.id).populate("reviews").exec((err, campground) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            campground.rating = calculateAverage(campground.reviews);
            campground.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect(`/campgrounds/${campground._id}`);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndRemove(req.params.review_id, (err, review) => {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec((err, campground) => {
            if(err){
                req.flash("error", err.message);
                return res.redirect("back");
            }
            campground.rating = calculateAverage(campground.reviews);
            campground.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect(`/campgrounds/${campground._id}`);
        });
    });
});

module.exports = router;