const express    = require("express"),
      router     = express.Router(),      
      { checkIfSearch, authentication } = require("../middleware"),
      { upload, cloudinary } = require('../cloudinary'),
      {
        landing,
        userNew,
        userCreate,
        userLoginForm,
        userLogin,
        userLogout,
        forgetPasswordForm,
        resetPassword,
        resetTokenForm,
        resetToken,
        userProfile,
      } = require('../controllers/index');

//root Route
router.get("/", landing);

//show register form
router.get("/register", checkIfSearch, userNew);

//handle sign up logic
router.post("/register", upload.single('avatar'), userCreate);

//show login form
router.get("/login", checkIfSearch, userLoginForm);

//handle login logic
router.post("/login", authentication, userLogin);

//logout route
router.get("/logout", userLogout);

//forgot password
router.get("/forgot", forgetPasswordForm);

router.post("/forgot", resetPassword);

//reset token route
router.get("/reset/:token", resetTokenForm);

router.post("/reset/:token", resetToken);

// USER PROFILE
router.get("/users/:id", userProfile);

module.exports = router;