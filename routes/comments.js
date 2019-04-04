const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      User       = require("../models/user"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware");

//Comments New
router.get("/new", [middleware.isLoggedIn, middleware.checkIfSearch], (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err || !campground){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});
//Comments Create
router.post("/", middleware.isLoggedIn, (req, res) => {
    //  look up campground using Id
    Campground.findById(req.params.id, (err, campground) => {
        if(err || !campground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            //  create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    req.flash("error", "Something went wrong");
                } else {
                    //connect campground to the comment
                    comment.campground.id = campground._id;
                    comment.campground.name = campground.name;
                    //connect user to the comment adding username and id to the comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //connect new comment to the campground
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect(`/campgrounds/${campground._id}`);
                }
            });
        }
    });
});

//Comments Edit
router.get("/:comment_id/edit", [middleware.checkCommentOwnership, middleware.checkIfSearch], (req, res) => {
    Campground.findById(req.params.id, (err, foundcampground) => {
        if(err || !foundcampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            Comment.findById(req.params.comment_id, (err, foundComment) => {
                if(err){
                    res.redirect("back");
                } else {
                    res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
                }
            });
        }
    });
});

//Comments Update
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
        if(err){
            req.flash("error", "Something went wrong");
            return res.redirect("back");
        }
        if(req.user.isAdmin && comment.author.username !== req.user.username) {
            comment.isAdminEdit = true;
        }
        comment.text = req.body.comment.text;
        comment.save();
        req.flash("success", "Comment updated");
        res. redirect(`/campgrounds/${req.params.id}`);
    });
});

//Delete Comments
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err, foundComment) => {
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect(`/campgrounds/${req.params.id}`);
        } else {
             req.flash("success", "Comment deleted");
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
});

module.exports = router;