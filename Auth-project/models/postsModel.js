const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    title: {    
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minLength: [3, 'Title must be at least 3 characters long'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
}, {
    timestamps: true,   
});
module.exports = mongoose.model('Post', postSchema);