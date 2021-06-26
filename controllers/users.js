const sha256 = require('sha256');
const mongoose =require("mongoose");
const jwt = require("jsonwebtoken");
const User = require('../models/user');

// @desc  Get users
// @route GET /api/users/
// @access Public
exports.getUsers = async(req, res)=>{
    const users = await User.find().select("-password");
    if(!users) return res.status(400).json({success: false});
    res.send(users);
}
// @desc  Get user by id
// @route GET /api/users/:id
// @access Public
exports.getUserById = async(req,res) => {
    const user = await User.findById(req.params.id).select("-password");
    if(!user) return res.status(404).json({success: false});
    res.send(user);
}
// @desc  Register a user
// @route Post /api/users/register
// @access Public
exports.registerUser = async (req, res) => {
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
}
// @desc  Login a user
// @route Post /api/users/login
// @access Public
exports.loginUser = async(req, res) => {
    let user = await User.findOne({ email: req.body.email, password: sha256(req.body.password) });
    if (!user) return res.status(400).send('invalid email or password.');
    const secretkey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({userId: user.id, isAdmin: user.isAdmin}, secretkey, {expiresIn: "1d"})
    res.status(200).send({id:user.id,user: user.email, token});
}
// @desc  Delete a user
// @route DELETE /api/users/:id
// @access Private
exports.deleteUser = async (req, res)=>{
    const user = await User.findByIdAndRemove(req.params.id);
    if(!user) return res.status(404).json({success: false , message: "user not found!"});
    res.send();
}

// @desc  Follow a user
// @route Post /api/users/folow
// @access Private
exports.followUser = async (req, res) =>{
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

}

// @desc  Unfollow a user
// @route Post /api/users/unfolow
// @access Private
exports.unfollowUser = async (req, res) =>{
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
}