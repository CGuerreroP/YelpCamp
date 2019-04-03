require('dotenv').config();

const express    = require("express"),
      router     = express.Router(),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware"),
      multer     = require("multer"),
      cloudinary = require("cloudinary");

// MULTER CONFIG
let storage = multer.diskStorage({
  filename: (req, file, callback) => {
    callback(null, Date.now() + file.originalname);
  }
});
let imageFilter = (req, file, cb) => {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter});

// CLOUDINARY CONFIG
cloudinary.config({ 
  cloud_name: 'crisgpdev', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MAPBOX CONFIG
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

// INDEX
router.get("/", middleware.checkIfSearch, (req, res) => {
    // get all campgrounds from DB
    Campground.find({}, (err, allCampgrounds) => {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
        }
    });
});

// CREATE
router.post("/", middleware.isLoggedIn, upload.single('image'), async (req, res) => {
    try {
        let response = await geocodingClient.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();
        req.body.campground.coordinates = response.body.features[0].geometry.coordinates;
        if(req.file) {
            let result = await cloudinary.v2.uploader.upload(req.file.path);
            // add cloudinary url for the image to the campground object under image property
            req.body.campground.image = result.secure_url;
            // add image's public_id to campground object
            req.body.campground.imageId = result.public_id;
        }
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        };
        // create a new Campground and save to DB
        let campground = await Campground.create(req.body.campground);
        //console.log(campground.coordinates);
        req.flash("success", "New Campground added");
        // redirect to campgrounds page
        res.redirect(`/campgrounds/${campground._id}`);
    } catch(err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

// NEW
router.get("/new", [middleware.isLoggedIn, middleware.checkIfSearch], (req, res) => {
    res.render("campgrounds/new");
});

// SHOW
router.get("/:id", middleware.checkIfSearch, (req, res) => {
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
router.get("/:id/edit", [middleware.checkCampgroundOwnership, middleware.checkIfSearch], (req, res) => {
    Campground.findById(req.params.id, (err, foundcampground) => {
        if(err){
            req.flash("error", "Campground not found");
            res.redirect("back");
        }
        res.render("campgrounds/edit", {campground: foundcampground});
    });
});

//UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), (req, res) => {
    Campground.findById(req.params.id, async (err, campground) => {
        if(err){
            req.flash("error", err.message);
            return res.redirect("/campgrounds/" + campground._id);
        }
        //if a new file has been upload
        if(req.file){
            try {
                await cloudinary.v2.uploader.destroy(campground.imageId);
                let result = await cloudinary.v2.uploader.upload(req.file.path);
                campground.imageId = result.public_id;
                campground.image = result.secure_url;
            } catch(err) {
                req.flash("error", err.message);
                return res.redirect("/campgrounds/" + campground._id);
            }
        }
        if(req.body.campground.image){
            campground.image = req.body.campground.image;
            await cloudinary.v2.uploader.destroy(campground.imageId);
            campground.imageId = "";
        }
        campground.name = req.body.campground.name;
        campground.price = req.body.campground.price;
        campground.description = req.body.campground.description;
        campground.location = req.body.campground.location;
        let response = await geocodingClient.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();
        campground.coordinates = response.body.features[0].geometry.coordinates;
        campground.save();
        req.flash("success", "Campground updated");
        res.redirect(`/campgrounds/${req.params.id}`);
           
    });
});

//DESTROY CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, async (err, campground) => {
        if(err){
            req.flash("error", "Campground not found");
            return res.redirect("/campgrounds");
        }
        try {
            if(campground.imageId){
                await cloudinary.v2.uploader.destroy(campground.imageId);
            }
            await Comment.deleteMany({_id: { $in: campground.comments }});
            req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        } catch(err) {
            req.flash("error", err.message);
            return res.redirect("/campgrounds/" + campground._id);
        }
    });
});

module.exports = router;