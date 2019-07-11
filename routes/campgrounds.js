const express    = require("express"),
      router     = express.Router(),
      { checkIfSearch, isLoggedIn, checkCampgroundOwnership  } = require("../middleware"),
      { upload, cloudinary } = require('../cloudinary'),
      { 
        campgroundsIndex,
        campgroundNew,
        campgroundCreate,
        campgroundShow,
        campgroundEdit,
        campgroundUpdate,
        campgroundDestroy
       } = require('../controllers/campgrounds');

// INDEX
router.get("/", checkIfSearch, campgroundsIndex);

// CREATE
router.post("/", isLoggedIn, upload.single('image'), campgroundCreate);

// NEW
router.get("/new", [isLoggedIn, checkIfSearch], campgroundNew);

// SHOW
router.get("/:id", checkIfSearch, campgroundShow);

//EDIT CAMPGROUND
router.get("/:id/edit", checkCampgroundOwnership, checkIfSearch, campgroundEdit);

//UPDATE CAMPGROUND
router.put("/:id", checkCampgroundOwnership, upload.single('image'), campgroundUpdate);

//DESTROY CAMPGROUND
router.delete("/:id", checkCampgroundOwnership, campgroundDestroy);

module.exports = router;