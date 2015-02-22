// app/routes.js

// load up the user model
var User = require('../models/user');

//load up the filesystem module
var fs = require('fs');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
    	User.findById(req.user._id, function(err, user){
    		if(err)
    			throw err;
    		
    		var data = new Buffer(user.personal.profileImage, 'base64');
    		
    		fs.writeFile('public/uploads/' + user.personal.profileImageName, data);
    	});
    	
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });
    
    // =====================================
    // UPDATE USER INFORMATION =============
    // =====================================
    app.post('/update_user', isLoggedIn, function(req, res){
    	updatePersonalInformation(req.user._id, req.body.new_nickname);
    	res.redirect('/profile');
    });
    
    app.post('/upload_profile_image', isLoggedIn, function(req, res){
    	saveProfileImage(req.user._id, req.files.profileImage);
    	res.redirect('/profile');
    });
    
    //URL used for tests only.
    app.get('/test', isLoggedIn, function(req, res){
    	res.write("200");
    	res.end();
    });
    
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function updatePersonalInformation(id, nickname){
	User.update({_id : id}, {'personal.nickname' : nickname}, function(err){
		if(err)
			throw err;
		else console.info("Entry " + id + " successfully updated!");
	});
}

function saveProfileImage(id, profileImage){
	fs.readFile(profileImage.path, function(err, data) {
		var base64ProfileImage = data.toString('base64')
		var profileImageName = 'PFIMG' + id + '.' + profileImage.extension;
		
		User.update({_id : id}, {'personal.profileImage' : base64ProfileImage, 'personal.profileImageName' : profileImageName}, function(err){
			if(err)
				throw err;
			else console.info("Profile image " + profileImageName + " for " + id + " successfully updated!");
		});
		
		//delete image from temporary upload folder
		fs.unlink(profileImage.path);
	});
}