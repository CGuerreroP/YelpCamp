const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      { isLoggedIn, checkIfSearch, checkCommentOwnership } = require("../middleware"),
      {
        commentNew,
        commentCreate,
        commentEdit,
        commentUpdate,
        commentDelete
      } = require('../controllers/comments');


//Comments New
router.get("/new", [isLoggedIn, checkIfSearch], commentNew);

//Comments Create
router.post("/", isLoggedIn, commentCreate);

//Comments Edit
router.get("/:comment_id/edit", [checkCommentOwnership, checkIfSearch], commentEdit);

//Comments Update
router.put("/:comment_id", checkCommentOwnership, commentUpdate);

//Delete Comments
router.delete("/:comment_id", checkCommentOwnership, commentDelete);

module.exports = router;