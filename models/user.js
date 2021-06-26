const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: ''
    },
    header: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        unique: true,
        minlength: 5,
        maxlength: 255,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    phone: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    location: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    dateOfBirth: {
        type: Date, 
        required: true, 
        trim: true, 
    }
});



const User = mongoose.model('User', userSchema);
module.exports = User;