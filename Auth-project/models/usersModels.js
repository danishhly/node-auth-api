const moongoose = require('mongoose');

const userSchema = new moongoose.Schema({
    email: {
        type: String,
        required: [true,'Email is required'],
        trim: true,
        unique: [true,"Email msut be unique"],
        lowercase: true,
        miniLength: [5,'Email must be at least 3 characters long'],
    },
    password: {
        type: String,
        required: [true,'Password is required'],
        trim: true,
        select : false, // Do not return password in queries
        miniLength: [6,'Password must be at least 6 characters long'],
    },  
    verified: {
        type: Boolean,  
        default: false,
    },  
   verificationCode: {
        type: String,
        select: false, 
    },
    verificationCodeValidation: {
        type: String,
        select: false, 
    },
    forgotPasswordCode: {
        type: String,
        select: false, 
    },
    forgotPasswordCodeValidation: {
        type: Number,
        select: false, 
    },

}, {
    timestamps: true,
});

module.exports = moongoose.model('User', userSchema);