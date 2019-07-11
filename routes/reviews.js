const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      { isLoggedIn, checkReviewExistence, checkIfSearch, checkReviewOwnership } = require("../middleware"),
      {
        reviewsIndex,
        reviewNew,
        reviewCreate,
        reviewEdit,
        reviewUpdate,
        reviewDelete
      } = require('../controllers/reviews');
      
// Reviews Index
router.get("/", reviewsIndex);

// Reviews New
router.get("/new", isLoggedIn, checkReviewExistence, checkIfSearch, reviewNew);

// Reviews Create
router.post("/", isLoggedIn, checkReviewExistence, reviewCreate);

// Reviews Edit
router.get("/:review_id/edit", checkReviewOwnership, checkIfSearch, reviewEdit);

// Reviews Update
router.put("/:review_id", checkReviewOwnership, reviewUpdate);

// Reviews Delete
router.delete("/:review_id", checkReviewOwnership, reviewDelete);

module.exports = router;