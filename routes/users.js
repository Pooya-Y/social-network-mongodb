const sha256 = require('sha256');
const mongoose =require("mongoose");
const {auth, isAdmin} = require("../middlewares/jwt");
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/user');

const multer = require("multer");

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

router.get('',async(req, res)=>{
    const users = await User.find().select("-password");
    if(!users) return res.status(400).json({success: false});
    res.send(users);
});

router.get('/:id',auth,async(req,res) => {
    const user = await User.findById(req.params.id).select("-password");
    if(!user) return res.status(404).json({success: false});
    res.send(user);
});
  


router.post('/register',upload.fields([{
    name: 'avatar', maxCount: 1
  }, {
    name: 'header', maxCount: 1
  }]), async (req, res) => {
    let email = await User.findOne({ email: req.body.email });
    if (email) return res.status(400).send('User already registered.');
    let avatarFileName ="0";
    let headerFileName="1";
    if(req.files){
        avatarFileName = req.protocol + "://" + req.get("host") + "/uploads/" + req.files.avatar[0].filename;
        headerFileName = req.protocol + "://" + req.get("host") + "/uploads/" + req.files.header[0].filename;
    }
    console.log(avatarFileName)
    console.log(headerFileName)
    let user = new User({
        name: req.body.name,
        userName: req.body.userName,
        email: req.body.email ,
        password: req.body.password,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        location: req.body.location,
        website: req.body.website,
        bio: req.body.bio,
        dateOfBirth: req.body.dateOfBirth,
        avatar: avatarFileName,
        header: headerFileName
    });

    user.password = sha256(user.password);
    user = await user.save();
    if(!user) return res.send("This user cannot be registered");
    res.send(user);
  });
router.post('/login', async(req, res) => {
    let user = await User.findOne({ email: req.body.email, password: sha256(req.body.password) });
    if (!user) return res.status(400).send('invalid email or password.');
    const secretkey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({userId: user.id, isAdmin: user.isAdmin}, secretkey, {expiresIn: "1d"})
    res.status(200).send({id:user.id,user: user.email, token});
});
router.delete('/:id', auth,isAdmin, async (req, res)=>{
    const user = await User.findByIdAndRemove(req.params.id);
    if(!user) return res.status(404).json({success: false , message: "user not found!"});
    res.send();
});
router.get(`/get/count`, async (req, res) =>{
  const userCount = await User.countDocuments((count) => count)

  if(!userCount) {
      res.status(500).json({success: false})
  } 
  res.send({
      count: userCount
  });
});
router.post("/follow/", auth, async (req, res) =>{
    if(!mongoose.Types.ObjectId.isValid(process.env.AUTH_ID)) res.send(400).json({success: false , message: "id is not valid!"})
    const user = await User.findById(process.env.AUTH_ID);
    if(!mongoose.Types.ObjectId.isValid(req.body.followId)) res.send(400).json({success: false , message: "id is not valid!"})
    const followUser= await User.findById(req.body.followId);
    if(!followUser) res.status(404).json({success: false , message: "user not found!"})

    user.following.addToSet(req.body.followId);
    const updatedUser = await user.save();
    if(!updatedUser) res.status(400).json({success: false , message: "this user cannot be updated!"});
    followUser.followers.addToSet(req.params.id);
    const following = await followUser.save();
    if(!following) res.status(400).json({success: false , message: "this user cannot be updated!"})
    res.send(updatedUser.following);

});
router.post("/unfollow/", auth, async (req, res) =>{
    if(!mongoose.Types.ObjectId.isValid(process.env.AUTH_ID)) res.send(400).json({success: false , message: "id is not valid!"})
    const user = await User.findById(process.env.AUTH_ID);
    if(!user) res.status(404).json({success: false , message: "user not found!"});
    if(!mongoose.Types.ObjectId.isValid(req.body.unfollowId)) res.send(400).json({success: false , message: "id is not valid!"})
    const unfollowUser= await User.findById(req.body.unfollowId);
    if(!unfollowUser) res.status(404).json({success: false , message: "user not found!"})

    const index = user.following.indexOf(req.body.unfollowId);
    if (index > -1) {
        user.following.splice(index, 1);
        const index2 = unfollowUser.followers.indexOf(req.params.id);
        if (index2 > -1) {
            unfollowUser.followers.splice(index2, 1);
        }
    }
    const updatedUser = await user.save();
    const unfollowing = await unfollowUser.save();
    if(!updatedUser || !unfollowing) res.status(400).json({success: false , message: "this user cannot be updated!"});
    res.send(updatedUser.following);

});
module.exports = router;