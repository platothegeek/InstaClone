// using express
const express = require("express");
// setting up router
const router = express.Router();
// database setup
const db = require('../models');
// Rest Routes
/* 
  * Index - GET - /users  - Presentational - all posts (feed)
  * New - GET - /users/new  - Presentational Form - post creation page
  * Show - GET - /users/:id  - Presentational - show post "card"
  * Create - Post - /users  - Functional - data receiving for route to create new post
  * Edit - GET - /users/:id/edit  - Presentational Form - edit or delete post
  * Update - PUT - /users/:id  - Functional - update postwith new changes
  * Delete - DELETE - /users/:id  - Functional - Deletes post by id from request
*/

/* ======== INDEX PAGE ======== */
router.get("/posts", function(request, response){
    db.Post.find({}, function(error, allPosts){
        if(error) return response.send(error);
        const context = {users: allPosts};
        return response.render("posts/index", context);
    });
});
// New Post route
router.get("/new", function(request,response){
    response.render("posts/new");
});
//Create/Upload post route
router.post("/upload", function(request,response){
    db.Post.create(request.body, function(err, createdPost){
        if (err) return response.send(err);
        db.User.findById(createdPost.user).exec(function(err, foundUser){
            if (err) return response.send(err);
            foundUser.posts.push(createdPost);
            createdPost.user.push(foundUser);
            foundUser.save();
        })
    });
    db.Image.create(request.body, function(err, createdImage){
        if (err) return response.send(err);
        db.Post.findById(createdImage.post).exec(function(err, foundPost){
            if (err) return response.send(err);
            foundPost.image.push(createdImage);
            createdImage.post.push(foundPost);
            foundPost.save();
                
            return response.redirect("/");
        })
    });
});
//Edit route
router.get("/:id/edit", function(request,response){
    db.Post.findById(request.params.id, function(error, foundUser){
        if(error) {
            return response.render(error);
        } else {
            const context = {users: foundUser};
            return response.render("posts/edit", context);
        }
    });
});
//Update route
router.put("/:id", function(request,response){
    db.Post.findByIdAndUpdate(
        request.params.id,
        {
            $set: {
                ...request.body
            }
        },
        { new: true},
        function(error,updatedUser){
            if(error) {
                return response.send(error);
            } else {
                return response.redirect(`/users/${updatedUser._id}`);
            }
        }
    );
});
//Delete route
router.delete("/:id", function(request,response){
    db.Post.findByIdAndDelete(request.params.id, function(error, deletedPost){
        if(error) {
            return response.send(error);
        } else {
            return response.redirect("/posts");
        }
    });
});
module.exports = router;
