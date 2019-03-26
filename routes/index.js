const express    = require("express"),
      router     = express.Router(),
      passport   = require("passport"),
      User       = require("../models/user"),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware");

//root Route
router.get("/", (req, res) => {
    res.render("landing");
});

//show register form
router.get("/register", middleware.checkIfSearch, (req, res) => {
    res.render("register", {page: "register"});
});

//handle sign up logic
router.post("/register", (req, res) => {
    const newUser = new User({
        username: req.body.username, 
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    //if(req.body.username === 'admin') {newUser.isAdmin = true };
    if(req.body.adminCode === process.env.ADMIN) {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) =>{
        if(err){
            req.flash("error", err.message); //this error comes thans to passport
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", `Welcome to YelpCamp ${user.username}`);
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", middleware.checkIfSearch, (req, res) => {
    res.render("login", {page: "login"});
});

//handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), (req, res) =>{
});

//logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});

// USER PROFILE
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (error, foundUser) => {
       if(error){
           req.flash("error", "Something went wrong");
           res.redirect("/campgrounds");
       } else {
           Campground.find().where("author.id").equals(foundUser._id).exec((error, campgrounds) => {
               if(error){
                   req.flash("error", "Something went wrong");
                   res.redirect("/campgrounds");
               } else {
                   Comment.find().where("author.id").equals(foundUser._id).exec((error, comments) => {
                       if(error){
                           req.flash("error", "Something went wrong");
                           res.redirect("/campgrounds");
                       } else {
                           res.render("users/show", {user: foundUser, campgrounds: campgrounds, comments: comments});
                       }
                   });
               }
           });
       }
    });
});

module.exports = router;