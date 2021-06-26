const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
    }],
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    numberOfLikes: {
        type: Number,
        default: 0
    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    
})

const Post = mongoose.model('Post', postSchema);
module.exports = Post;