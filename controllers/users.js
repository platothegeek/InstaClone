// using express
const express = require("express");
// setting up router
const router = express.Router();

// database setup
const db = require('../models');

// Rest Routes
/* 
  * Index - GET - /users  - Presentational - all users
  * New - GET - /users/new  - Presentational Form - user signup page
  * Show - GET - /users/:id  - Presentational - show your user page or other user profiles
  * Create - Post - /users  - Functional - data receiving for route to create new user
  * Edit - GET - /users/:id/edit  - Presentational Form - edit user profile with previous filled data
  * Update - PUT - /users/:id  - Functional - update user profile with new changes
  * Delete - DELETE - /users/:id  - Functional - Deletes user profile by id from request (FIXME: Make sure to make delete only available to your own profile)
*/


/* ======== INDEX PAGE ======== */

router.get("/", function(request, response){
    const query = {
        userName: {
            $regex: request.query.userName,
            $options: "i",
        }
    };
    db.User.find(query, async function(error, allUsers){
        if(error) return response.send(error);
        const context = {users: allUsers};

        return response.render("users/index", context);
    }).populate({path: "posts"});
});

/* ======== HOME PAGE ======== */
/* FIXME: Use mongodb. Aggregate method to 'populate' homepage with posts linked per user.id + timestamp */
router.get("/", function(request,response){
    db.User.findById(request.params.id, function(error, foundUser){
        if(error) return response.send(error);
            const context = {user: foundUser}; 
    response.render("home", context);
});
});



/* ======== SHOW PAGE ======== */
router.get("/:id", async function(request,response) {
    try {
        const foundUser = await db.User.findById(request.params.id).populate({path: "posts photos", populate: {path:"image"}, options: {sort:"-createdAt"}} );

        const context = { profile: foundUser};
        return response.render("users/show", context);
    } catch (error) {
        return response.send(error);
    }
});

/* ======== CREATE PAGE ======== */
router.post("/", async function(request, response) {
    try {
        await db.User.create(request.body);
        return response.redirect("/"); 
    } catch(error){
        return response.send(error);
    }
})


/* ======== EDIT PAGE ======== */

router.get("/:id/edit", function(request,response){
    db.User.findById(request.params.id, function(error, foundUser){
        if(error) return response.send(error);
         /* FIXME: add AuthReq here comparing sessionID = urlID/userID  */
            const context = {user: foundUser};
            return response.render("users/edit", context);
        
    });
});

/* ======== USER SETTINGS PAGE */

router.get("/:id/settings", function(request, response) {
    db.User.findById(request.params.id, function(error, foundUser){
        if(error) return response.send(error);
            const context = {user: foundUser}; 
            return response.render("settings", context);
});
});

/* ======== UPDATE PAGE ======== */
router.put("/:id", function(request,response){
    db.User.findByIdAndUpdate(
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


/* ======== DELETE PAGE ======== */
router.delete("/:id", function(request,response){
    db.User.findByIdAndDelete(request.params.id, function(error, deletedUser){
        if(error) {
            return response.send(error);
        } else {
            request.session.destroy();
            return response.redirect("/");
        }
    });
});

module.exports = router;