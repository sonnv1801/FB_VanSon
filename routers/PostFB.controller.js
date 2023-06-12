const postFBController = require("../controllers/PostFB.controller");

const router = require("express").Router();

router.get("/", postFBController.getLikeAndCmt);
router.post("/", postFBController.autoUpdatePost);

module.exports = router;
