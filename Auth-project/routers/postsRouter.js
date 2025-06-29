const express = require('express');

const postsController = require('../controllers/postsController'); // Assuming you have a postsController

const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.get('/all-posts', postsController.getPosts); // Assuming you have a getPosts function in postsController
router.post('/single-posts',postsController.singlePosts);     
router.post('/create-posts',  identifier, postsController.createPosts); 

router.put('/update-posts', identifier, postsController.updatePost);
 router.delete('/delete-posts', identifier, postsController.deletePost);


module.exports = router;
