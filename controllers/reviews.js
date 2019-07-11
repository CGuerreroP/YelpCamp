const Campground = require("../models/campground"),
      User       = require("../models/user"),
      Review    = require("../models/review");

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

module.exports = {
	//Reviews index
	reviewsIndex(req, res) {
		Campground.findById(req.params.id).populate({ path: "reviews", options: {sort: {createdAt: -1}} })  // sorting the populated reviews array to show the latest first
	    .exec((err, campground) => {
	        if(err || !campground) {
	            req.flash("error", err.message);
	            return res.redirect("back");
	        }
	        res.render("reviews/index", {campground: campground});
	    });
	},
	//Reviews new
	async reviewNew(req, res) {
		try {
			let campground = await Campground.findById(req.params.id);
			res.render("reviews/new", {campground: campground});
		} catch(err) {
			req.flash("error", err.message);
            res.redirect("back");
		}
	},
	//Review create
	reviewCreate(req, res) {
		Campground.findById(req.params.id).populate("reviews").exec(async (err, campground) => {
	        if(err){
	            req.flash("error", err.message);
	            return res.redirect("back");
	        }
	        try {
	            let review = await Review.create(req.body.review);
	            let user = await User.findById(req.user._id);
	            user.reviewsCount += 1;
	            user.save();
	            review.author.id = req.user._id;
	            review.author.username = req.user.username;
	            review.author.reviewsCount = user.reviewsCount;
	            review.campground = campground;
	            review.save();
	            campground.reviews.push(review);
	            campground.rating = calculateAverage(campground.reviews);
	            campground.save();
	            req.flash("success", "Your review has been successfully added.");
	            res.redirect(`/campgrounds/${campground._id}`);
	        } catch(err){
	            req.flash("error", err.message);
	            return res.redirect("back");
	        }
	    });
	},
	//Reviews edit
	async reviewEdit(req, res) {
		try {
			let review = await Review.findById(req.params.review_id);
			res.render("reviews/edit", {campground_id: req.params.id, review: review});
		} catch(err) {
			req.flash("error", err.message);
            res.redirect("back");
		}
	},
	//Reviews update
	reviewUpdate(req, res) {
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
	},
	//Reviews delete
	reviewDelete(req, res) {
		Review.findByIdAndRemove(req.params.review_id, (err, review) => {
	        if(err) {
	            req.flash("error", err.message);
	            return res.redirect("back");
	        }
	        Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, 
	            {new: true}).populate("reviews").exec(async (err, campground) => {
	            if(err) {
	                req.flash("error", err.message);
	                return res.redirect("back");
	            }
	            try {
	                let user = await User.findById(req.user._id);
	                user.reviewsCount -= 1;
	                user.save();
	                campground.rating = calculateAverage(campground.reviews);
	                campground.save();
	                req.flash("success", "Your review was deleted successfully.");
	                res.redirect(`/campgrounds/${campground._id}`);
	            } catch(err){
	                req.flash("error", err.message);
	                return res.redirect("back");
	            }
	        });
	    });
	}
}