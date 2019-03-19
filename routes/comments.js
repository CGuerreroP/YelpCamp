const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment");

//middleware to check if log in
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

//middleware to check if you own the comment
const checkCommentOwnership = (req, res, next) => {
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

//Comments New
router.get("/new", isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});
//Comments Create
router.post("/", isLoggedIn, (req, res) => {
    //  look up campground using Id
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            console.log(err);
        } else {
            //  create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    console.log(err);
                } else {
                    //connect user to the comment adding username and id to the comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //connect new comment to the campground
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect(`/campgrounds/${campground._id}`);
                }
            });
        }
    });
});

//Comments Edit
router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
    
});

//Comments Update
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, comment) => {
        if(err){
            res.redirect("back");
        } else {
            res. redirect(`/campgrounds/${req.params.id}`);
        }
    });
});

//Delete Comments
router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err, foundComment) => {
        if(err){
            res.redirect(`/campgrounds/${req.params.id}`);
        } else {
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
});

module.exports = router;