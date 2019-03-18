const express = require("express"),
      router  = express.Router(),
      Campground = require("../models/campground");

//middleware to check if log in
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

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
router.post("/", isLoggedIn, (req, res) => {
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
            console.log(error);
        } else {
            //console.log(campground);
            // redirect to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});
// NEW
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// SHOW
router.get("/:id", (req, res) => {
    // find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec((err, foundcampground) => {
       if(err){
           console.log(err);
       } else {
           //console.log(foundcampground);
           // render the show template of that campground
           res.render("campgrounds/show", {campground: foundcampground});
       }
    });
});

module.exports = router;