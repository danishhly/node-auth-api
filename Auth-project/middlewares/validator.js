const Joi = require('joi');

exports.signupSchema = Joi.object({ 
    email: Joi.string()
    .min(5)
    .max(50)
    .required()
    .email({
        tlds: { allow: ['com', 'net'] },
}),
password: Joi.string()
.required()
.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

exports.signinSchema = Joi.object({ 
    email: Joi.string()
    .min(5)
    .max(50)
    .required()
    .email({
        tlds: { allow: ['com', 'net'] },
}),
password: Joi.string()
.required()
.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

exports.acceptCodeSchema = Joi.object({
    email: Joi.string()
    .min(5)
    .max(50)
    .required()
    .email({
        tlds: { allow: ['com', 'net'] },
}),
    providedCode: Joi.number()
    .required(),
});

exports.changePasswordSchema = Joi.object({
    newPassword: Joi.string()
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    oldPassword: Joi.string()
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

exports.acceptFPCodeSchema = Joi.object({
       email: Joi.string()
    .min(5)
    .max(50)
    .required()
    .email({
        tlds: { allow: ['com', 'net'] },
}),
    providedCode: Joi.number()
    .required(),
    newPassword: Joi.string()
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

exports.createPostSchema = Joi.object({
    title: Joi.string()
    .min(5)
    .max(50)
    .required(),

    description: Joi.string()
    .min(5)
    .max(50)
    .required(),

    userId: Joi.string()
    .min(5)
    .max(50)
    .required(),
   
});