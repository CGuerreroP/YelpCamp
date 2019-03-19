const express    = require("express"),
      router     = express.Router(),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware");

// INDEX
router.get("/", (req, res) => {
    // get all campgrounds from DB
    Campground.find({}, (err, allCampgrounds) => {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
    
});
// CREATE
router.post("/", middleware.isLoggedIn, (req, res) => {
    // get data from a form and add it to campgrounds array
    const newName = req.body.name;
    const newImage = req.body.image;
    const newDescription = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    };
    const newCamp = {name: newName, image: newImage, description: newDescription, author: author};
    // create a new Campground and save to DB
    Campground.create(newCamp, (error, campground) => {
        if(error){
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
        } else {
            //console.log(campground);
            req.flash("success", "New Campground added");
            // redirect to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});
// NEW
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// SHOW
router.get("/:id", (req, res) => {
    // find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec((err, foundcampground) => {
       if(err || !foundcampground){
           req.flash("error", "Campground not found");
           res.redirect("back");
       } else {
           //console.log(foundcampground);
           // render the show template of that campground
           res.render("campgrounds/show", {campground: foundcampground});
       }
    });
});

//EDIT CAMPGROUND
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundcampground) => {
        if(err){
            req.flash("error", "Campground not found");
            res.redirect("back");
        }
        res.render("campgrounds/edit", {campground: foundcampground});
    });
});

//UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground updated");
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
});

//DESTROY CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campground) => {
        if(err){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            Comment.deleteMany({_id: { $in: campground.comments }}, err => {
                if(err){
                    req.flash("error", "Something went wrong");
                    res.redirect("/campgrounds");
                } else {
                    req.flash("success", "Campground deleted");
                    res.redirect("/campgrounds");
                }
            });
        }
    });
});


module.exports = router;