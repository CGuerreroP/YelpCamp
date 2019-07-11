const Campground = require("../models/campground"),
      User       = require("../models/user"),
      Comment    = require("../models/comment");

module.exports = {
	//Comments New
	commentNew(req, res) {
		Campground.findById(req.params.id, (err, campground) => {
	        if(err || !campground){
	            console.log(err);
	        } else {
	            res.render("comments/new", {campground: campground});
	        }
	    });
	},
	//Comments create
	commentCreate(req, res) {
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
	                    comment.author.avatar = req.user.avatar.secure_url;
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
	},
	//Comments edit
	commentEdit(req, res) {
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
	},
	//Comments update
	async commentUpdate(req, res) {
		try {
			let comment = await Comment.findById(req.params.comment_id);
	        if(req.user.isAdmin && comment.author.username !== req.user.username) {
	            comment.isAdminEdit = true;
	        }
	        comment.text = req.body.comment.text;
	        comment.save();
	        req.flash("success", "Comment updated");
	        res. redirect(`/campgrounds/${req.params.id}`);
		} catch(err) {
			req.flash("error", "Something went wrong");
	        res.redirect("back");
		}	   
	},
	//Comments delete
	async commentDelete(req, res) {
		try {
			let foundComment = await Comment.findByIdAndRemove(req.params.comment_id);
			req.flash("success", "Comment deleted");
            res.redirect(`/campgrounds/${req.params.id}`);
		} catch(err) {
			req.flash("error", "Something went wrong");
            res.redirect(`/campgrounds/${req.params.id}`);
		}
	}
}
