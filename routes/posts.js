const {auth, isAdmin} = require("../middlewares/jwt");
const express = require('express');
const router = express.Router();
const multer = require("multer");

const {
    getUserPostsById,
    getTimeline,
    newPost,
    likePost,
    unlikePost,
    newMention
} = require("../controllers/posts");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(" ").join("-");
      cb(null, Date.now().toString()+"-"+fileName)
    },
});
const upload = multer({ 
    storage: storage ,
    limits:{fileSize: 1024*1024*10},
    fileFilter: function (req, file, cb) {
        if(file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
            cb(new Error("Wrong file type"), false);
        }
        cb(null, true);
    },
})

router.get("/user/:id", getUserPostsById);

router.get("/timeline", auth, getTimeline);

router.post('/',auth,upload.array("images", 4), newPost);

router.post('/:postId/',auth,upload.array("images", 4), newMention);

router.post("/like/:id", auth, likePost);

router.post("/unlike/:id", auth, unlikePost);

module.exports = router;