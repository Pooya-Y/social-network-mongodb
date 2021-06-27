const {auth, isAdmin} = require("../middlewares/jwt");
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    registerUser,
    loginUser,
    deleteUser,
    followUser,
    unfollowUser
} = require("../controllers/users");
const {upload} = require("../controllers/multer");

router.get('', getUsers);

router.get('/:id', getUserById);

router.post('/register',upload.fields([{name: 'avatar', maxCount: 1}, {name: 'header', maxCount: 1}]), registerUser);

router.post('/login', loginUser);

router.delete('/:id', auth, isAdmin, deleteUser);

router.post("/follow/", auth, followUser);

router.post("/unfollow/", auth, unfollowUser);

module.exports = router;