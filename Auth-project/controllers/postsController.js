const { createPostSchema } = require('../middlewares/validator');
const Post =  require('../models/postsModel');

exports.getPosts = async (req, res) => {
    const {page} = req.query;
    const postsPerPage = 10; // Number of posts per page 

    try {

        let pageNum = 0;
        if(page <= 1) {
            pageNum = 0;
        } else {
            pageNum = page -1
        }
        const result = await Post.find().sort({createdAt: -1}).skip(pageNum * postsPerPage).limit(postsPerPage).populate({
            path: 'userId',
            select: 'email',// Select only the fields you need from the user
        });// Populate user details
        res.status(200).json({
            message: 'posts', data: result});
          

    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

};

exports.singlePosts = async (req, res) => {
    const {_id} = req.query;

    try {

        const result = await Post.findOne({_id}).populate({
            path: 'userId',
            select: 'email',// Select only the fields you need from the user
        });// Populate user details
        res.status(200).json({
            message: 'single post', data: result});
          

    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

};

exports.createPosts = async(req,res) => {
    const {title, description} = req.body;
    const {userId} = req.user;
    try {
        const { error, value } = createPostSchema.validate({
            title,
            description,
            userId,
        });
        if (error) {
            return res
            .status(401)
            .json({success: false, message: error.details[0].message})
        }

        const result = await Post.create({
            title, description, userId
        })
        res
            .status(201)
            .json({success: true, message: 'created', data: result});

    }catch (error){
        console.log(error);
    }
};

exports.updatePost = async(req,res) => {
    const{_id} = req.query;
    const {title, description} = req.body;
    const {userId} = req.user;
    try {
        const { error, value } = createPostSchema.validate({
            title,
            description,
            userId,
        });
        if (error) {
            return res
            .status(401)
            .json({success: false, message: error.details[0].message})
        }
        const existingPost = await Post.findOne({_id})
        if(!existingPost) {
             return res
            .status(201)
            .json({success: false, message: 'Post unavailable'});
        }
        if(existingPost.userId.toString() !== userId ) {
             return res
            .status(201)
            .json({success: false, message: 'UnAuthorized'});
        }

        existingPost.title = title;
        existingPost.description = description;

        const result = await existingPost.save()
        res.status(201)
            .json({success: true, message: 'updated', data: result}); 

    }catch (error){
        console.log(error);
    }
};

exports.deletePost = async(req,res) => {
    const{_id} = req.query;
    const {userId} = req.user;
    try {
       
        const existingPost = await Post.findOne({_id})
        if(!existingPost) {
             return res
            .status(201)
            .json({success: false, message: 'Post already unavailable'});
        }
        if(existingPost.userId.toString() !== userId ) {
             return res
            .status(201)
            .json({success: false, message: 'UnAuthorized'});
        }

    
        await Post.deleteOne({_id});
        
        res.status(201)
            .json({success: true, message: 'deleted'}); 

    }catch (error){
        console.log(error);
    }
};