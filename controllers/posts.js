const express = require('express');
const Post = require("../models/post");
const User = require("../models/user");
const mongoose = require('mongoose');
const multer = require("multer");

// @desc  Get posts of a user by id
// @route GET /api/posts/user/:id
// @access Public
exports.getUserPostsById = async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) res.status(400).json({success: false , message: "id is not valid!"});
    // const user = await User.findById(req.params.id).select("posts").populate("posts");
    const user = await User.aggregate([
        {$match: {
            _id: mongoose.Types.ObjectId(req.params.id)
        }},
        {$lookup:{
              from: 'posts',
              localField: 'posts',
              foreignField: '_id',
              as: 'posts'
            }
        },
        {$project: {
                posts: 1,
            }
        }
    ]);
    if(!user) return res.status(500).json({success: false});
    res.send(user);
}
// @desc  Get timeline of a user
// @route GET /api/posts/timeline/
// @access Private
exports.getTimeline = async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(process.env.AUTH_ID)) res.send(400).json({success: false , message: "id is not valid!"});
    // const user = await User.findById(process.env.AUTH_ID).select("following").populate({path: "following", populate: "posts", select:"posts"});
    const user = await User.aggregate([
        {$match: {
            _id: mongoose.Types.ObjectId(process.env.AUTH_ID)
        }},{
            $lookup:{
                from: 'users',
                localField: 'following',
                foreignField: '_id',
                as: 'following'
            }
        },{
            $unwind: {
                path: "$following",
                preserveNullAndEmptyArrays: true
            }
        },
        {$lookup:{
            from: 'posts',
            localField: 'posts',
            foreignField: '_id',
            as: 'posts'
          }
      },
        {$project: {
                posts: 1
            }
        },
    ]);
    if(!user) return res.status(500).json({success: false});
    res.send(user);
}
// @desc  Add new post
// @route Post /api/posts/
// @access Private
exports.newPost =  async (req,res)=>{
    if(!mongoose.Types.ObjectId.isValid(process.env.AUTH_ID)) res.send(400).json({success: false , message: "id is not valid!"});
    const author = await User.findById(process.env.AUTH_ID);
    if(!author) res.status(404).json({success: false , message: "user not found!"});

    basePath = req.protocol + "://" + req.get("host") + "/uploads/";
    let images = [];
    if(req.files){
        req.files.map((file) =>{
            images.push(basePath + file.filename);
        });
    }

    let post = new Post({
        author: author,
        text: req.body.text,
        images: images,
    })

    post = await post.save();
    if(!post) return res.status(400).send("the post cannot be created!");
    author.posts.push(post);
    await author.save();
    res.send();
}
// @desc  Add new mention
// @route Post /api/posts/:postId
// @access Private
exports.newMention = async (req,res)=>{
    if(!mongoose.Types.ObjectId.isValid(process.env.AUTH_ID)) res.send(400).json({success: false , message: "id is not valid!"});
    const author = await User.findById(process.env.AUTH_ID);
    if(!author) res.status(404).json({success: false , message: "user not found!"});
    if(!mongoose.Types.ObjectId.isValid(req.params.postId)) res.send(400).json({success: false , message: "id is not valid!"});
    const post = await Post.findById(req.params.postId);
    if(!post) res.status(404).json({success: false , message: "post not found!"});

    basePath = req.protocol + "://" + req.get("host") + "/uploads/";
    let images = [];
    if(req.files){
        req.files.map((file) =>{
            images.push(basePath + file.filename);
        });
    }

    let mention = new Post({
            author: author,
            text: req.body.text,
            images: images,
    })
    mention = await mention.save();
    if(!mention) return res.status(400).send("the post cannot be created!");
    author.posts.push(post);
    const authorValid = await author.save();
    if(!authorValid) return res.status(400).send("the post cannot be created!");
    post.mentions.push(mention);
    const postValid = await post.save();
    if(!postValid) return res.status(400).send("the post cannot be created!");
    res.send();
}
// @desc  Like a post
// @route Post /api/posts/like/:id
// @access Private
exports.likePost =  async(req,res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) res.send(400).json({success: false , message: "id is not valid!"});
    if(!mongoose.Types.ObjectId.isValid(process.env.AUTH_ID)) res.send(400).json({success: false , message: "id is not valid!"});
    let post = await Post.findById(req.params.id);
    if(!post) res.status(404).json({success: false , message: "post not found!"});
    const user = await User.findById(process.env.AUTH_ID);
    if(!user) res.status(404).json({success: false , message: "user not found!"});

    post.likes.addToSet(process.env.AUTH_ID);
    post.numberOfLikes = post.likes.length;
    post = await post.save(); 
    if(!post) return res.status(400).send("the post cannot be created!");
    res.send(post);
}
// @desc  unlike a post
// @route Post /api/posts/unlike/:id
// @access Private
exports.unlikePost = async(req,res)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) res.send(400).json({success: false , message: "id is not valid!"});
    if(!mongoose.Types.ObjectId.isValid(process.env.AUTH_ID)) res.send(400).json({success: false , message: "id is not valid!"});
    let post = await Post.findById(req.params.id);
    if(!post) res.status(404).json({success: false , message: "post not found!"});
    const user = await User.findById(process.env.AUTH_ID);
    if(!user) res.status(404).json({success: false , message: "user not found!"});
    const index = post.likes.indexOf(process.env.AUTH_ID);
    if(index>-1){
        post.likes.splice(index,1);
    }
    post.numberOfLikes = post.likes.length;
    post = await post.save(); 
    if(!post) return res.status(400).send("the post cannot be created!");
    res.send(post);
}