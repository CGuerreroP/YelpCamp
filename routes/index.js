const express    = require("express"),
      router     = express.Router(),
      passport   = require("passport"),
      nodemailer = require("nodemailer"),
      async      = require("async"),
      crypto     = require("crypto"),
      User       = require("../models/user"),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware"),
      multer     = require("multer"),
      { upload, cloudinary } = require('../cloudinary');

//root Route
router.get("/", (req, res) => {
    res.render("landing");
});

//show register form
router.get("/register", middleware.checkIfSearch, (req, res) => {
    res.render("register", {page: "register"});
});

//handle sign up logic
router.post("/register", upload.single('avatar'), async (req, res) => {
    try {
        if(req.file) {
            let { secure_url, public_id } = await cloudinary.v2.uploader.upload(req.file.path);
            req.body.avatar = {
                secure_url,
                public_id
            };
        }
        const newUser = new User(req.body);

        //if(req.body.username === 'admin') {newUser.isAdmin = true };
        if(req.body.adminCode === process.env.ADMIN) {
            newUser.isAdmin = true;
        }
        let user = await User.register(newUser, req.body.password);    
        passport.authenticate("local")(req, res, () => {
            req.flash("success", `Welcome to YelpCamp ${user.username}`);
            res.redirect("/campgrounds");
        });
    } catch {
        req.flash("error", err.message); //this error comes thanks to passport
        return res.redirect("/register");
    }
});

//show login form
router.get("/login", middleware.checkIfSearch, (req, res) => {
    res.render("login", {page: "login"});
});

//handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: "Welcome to YelpCamp!"
    }), (req, res) =>{
});

//logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "See you soon!");
    res.redirect("/campgrounds");
});

//forgot password
router.get("/forgot", (req, res) => {
    res.render("forgot");
});

router.post("/forgot", (req, res, next) => {
    async.waterfall([
        done => {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        },
        (token, done) => {
            User.findOne({ email: req.body.email }, (err, user) => {
                if(!user){
                    req.flash("error", "No account with that email adress exists." );
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;
                user.save(err => {
                    done(err, token, user);
                });
            });
        },
        (token, user, done) => {
            let smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "crisgpdev@gmail.com",
                    pass: process.env.GMAIL_PW
                }
            });
            let mailOptions = {
                to: user.email,
                from: "crisgpdev@gmail.com",
                subject: "YelpCamp Password Reset",
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n
                http://${req.headers.host}/reset/${token}\n\n
                If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };
            smtpTransport.sendMail(mailOptions, err => {
                req.flash("success", `An email has been sent to ${user.email} with further instructions.`);
                done(err, "done");
            });
        }
    ], err => {
        if(err) return next(err);
        res.redirect("/forgot");
    });
});

//reset token route
router.get("/reset/:token", (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if(!user){
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});

router.post("/reset/:token", (req, res) => {
    async.waterfall([
        done => {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
                if(!user){
                    req.flash("error", "Password reset token is invalid or has expired.");
                    return res.redirect("back");
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password, err => {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        user.save(err => {
                            req.logIn(user, err => {
                                done(err, user);
                            });
                        });
                    });
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect("back");
                }
            });
        },
        (user, done) => {
            let smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "crisgpdev@gmail.com",
                    pass: process.env.GMAIL_PW
                }
            });
            let mailOptions = {
                to: user.email,
                from: "crisgpdev@gmail.com",
                subject: "Your password has been changed",
                text: `Hello,\n\n
                This is a confirmation that the password for your account ${user.email} has just been changed.\n`
            };
            smtpTransport.sendMail(mailOptions, err => {
                req.flash("success", "Success! Your password has been changed.");
                done(err);
            });
        },
    ], err => {
        res.redirect("/campgrounds");
    });
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