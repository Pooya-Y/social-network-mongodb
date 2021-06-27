const {auth} = require("../middlewares/jwt");
const express = require('express');
const router = express.Router();
const {
    getUserPostsById,
    getTimeline,
    newPost,
    likePost,
    unlikePost,
    newMention
} = require("../controllers/posts");
const {upload} = require("../controllers/multer");

router.get("/user/:id", getUserPostsById);

router.get("/timeline", auth, getTimeline);

router.post('/',auth,upload.array("images", 4), newPost);

router.post('/:postId/',auth,upload.array("images", 4), newMention);

router.post("/like/:id", auth, likePost);

router.post("/unlike/:id", auth, unlikePost);

module.exports = router;