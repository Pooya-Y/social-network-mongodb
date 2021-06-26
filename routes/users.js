const sha256 = require('sha256');
const mongoose =require("mongoose");
const {auth, isAdmin} = require("../middlewares/jwt");
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/user');
const multer = require("multer");
const {
    getUsers,
    getUserById,
    registerUser,
    loginUser,
    deleteUser,
    followUser,
    unfollowUser
} = require("../controllers/users");

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

router.get('', getUsers);

router.get('/:id', getUserById);

router.post('/register',upload.fields([{name: 'avatar', maxCount: 1}, {name: 'header', maxCount: 1}]), registerUser);

router.post('/login', loginUser);

router.delete('/:id', auth, isAdmin, deleteUser);

router.post("/follow/", auth, followUser);

router.post("/unfollow/", auth, unfollowUser);

module.exports = router;