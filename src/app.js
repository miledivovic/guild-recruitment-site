'use strict';

var express = require('express');
var app = express();
var db = require('./db');
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var fs = require('fs');
var path = require('path');
var fn = path.join(__dirname, 'config.json');
var data = fs.readFileSync(fn);

var conf = JSON.parse(data);
var mailUser = conf.mailAuthUser;
var mailPass = conf.mailAuthPass;
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(require('cookie-parser')());
app.use(require('express-session')({secret: 'keyboard cat', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
var Application = mongoose.model('Application');
var Suggestion = mongoose.model('Suggestion');
var User = mongoose.model('User');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport({
	service: 'gmail',
	auth: {
		user: mailUser,
		pass: mailPass
	}
}));
passport.use(new LocalStrategy(
	function(username, password, done) {
		User.findOne({Username: username}, function(err, user) {
			if (err) {
				return done(err);
			}

			if (!user) {
				return done(null, false, {message: 'Incorrect username.'});
			}

			if (user.Password != password) {
				return done(null, false, {message: 'Incorrect password.'});
			}

			return done(null, user);

		});
	}));

passport.serializeUser(function(user, cb) {
	cb(null, user.Username);
});

passport.deserializeUser(function(username, cb) {
	User.findOne({Username: username}, function(err, user) {
		if (err) {
			return cb(err);
		}
		cb(null, user);
	});
});

function Officer(user) {
	this.user = user;
}

Officer.prototype.isOfficer = function() {
	var isOfficer = false;
	if (this.user) {
		isOfficer = this.user.Officer;
	}
	return isOfficer;
}

function ApplicationEntry(req, res) {
	this.req = req;
	this.res = res;
}

ApplicationEntry.prototype.addNewApp = function() {
	var d = new Date();
	return new Application({
		CharacterName: this.req.body.charName,
		Class: this.req.body.class,
		Specialization: this.req.body.spec,
		ArmoryUrl: this.req.body.url,
		submittedDate: d,
		Email: this.req.body.email
	});
}

function UserEntry(req, res) {
	this.req = req;
	this.res = res;
}

UserEntry.prototype.addNewUser = function() {
	return new User({
		Username: this.req.body.username,
		Password: this.req.body.password,
		Officer: false
	});
}

function SuggestionEntry(req, res) {
	this.req = req;
	this.res = res;
}

SuggestionEntry.prototype.addNewSuggestion = function() {
	var d = new Date();
	return new Suggestion({
		UserSuggestion: this.req.body.suggestion,
		submittedDate: d
	});
}

console.log('hi');

app.post('/sendDecline', function(req, res) {
	var mailOptions = {
		from: '"Shattered Expectations" <shatteredexpectationsrecruiter@gmail.com>',
		to: req.body.email,
		subject: 'Application Status Changed',
		text: 'Unfortunately we have decided not to move forward with your application at this time. Best of luck in your future endeavors.'
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			return console.log('mailerror: ' + error);
		}
		console.log('Message sent: ' + info.response);
	});

	Application.findOne({Email: req.body.email}, function(err, app, count) {
		app.remove();
		app.save(function(saveErr, saveApp, saveCount) {
			res.redirect('/applications');
		});
	});
});

app.post('/sendAccept', function(req, res) {
	var mailOptions = {
		from: '"Shattered Expectations" <shatteredexpectationsrecruiter@gmail.com>',
		to: req.body.email,
		subject: 'Application Status Changed',
		text: 'Congratulations you have been accepted to join Shattered Expectations!'
	}

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			return console.log('mailerror: ' + error);
		}
		console.log('Message sent: ' + info.response);
	});

	Application.findOne({Email: req.body.email}, function(err, app, count) {
		app.remove();
		app.save(function(saveErr, saveApp, saveCount) {
			res.redirect('/applications');
		});
	});
});

app.get('/home', function(req, res) {
	var user = new Officer(req.user);
	var isOfficer = user.isOfficer();
	res.render('index', {user: req.user, officer: isOfficer});
});

app.get('/login', function(req, res) {
	var user = new Officer(req.user);
	var isOfficer = user.isOfficer();
	res.render('login', {user: req.user, officer: isOfficer});
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/home');
});

app.get('/applications/submitSuccess', function(req, res) {
	var user = new Officer(req.user);
	var isOfficer = user.isOfficer();
	res.render('submitSuccess', {user: req.user, officer: isOfficer});
});

app.post('/loginPost', passport.authenticate('local', {failureRedirect: '/login' }),
	function(req, res) {
		res.redirect('/home');
	});

app.get('/applications', function(req, res) {
	var user = new Officer(req.user);
	var isOfficer = user.isOfficer();
	if (isOfficer) {
		Application.find(function(err, apps, count) {
			console.log('found apps: ' + apps);
			res.render('applicationsView', {user: req.user, officer: isOfficer, apps: apps});
		});
	} else {
		res.render('applications', {user: req.user, officer: isOfficer});
	}
});

app.get('/applications/create', function(req, res) {
	var user = new Officer(req.user);
	var isOfficer = user.isOfficer();
	res.render('createApplication', {user: req.user, officer: isOfficer});
});

app.get(/details-(.+)/, function(req, res) {
	var user = new Officer(req.user);
	var isOfficer = user.isOfficer();
	Application.findOne({slug: req.params[0]}, function(err, app, count) {
		res.render('appDetails', {app: app, user: req.user, officer: isOfficer});
	});
});

app.get('/register', function(req, res) {
	var user = new Officer(req.user);
	var isOfficer = user.isOfficer();
	res.render('register', {user: req.user, officer: isOfficer});
});

app.post('/submitApp', function(req, res) {
	var app = new ApplicationEntry(req, res);
	var newApp = app.addNewApp();
	newApp.save(function(err, app, count) {
		res.redirect('/applications/submitSuccess');
	});
});

app.post('/submitSuggestion', function(req, res) {
	var d = new Date();
	var suggestion = new SuggestionEntry(req, res);
	var newsuggestion = suggestion.addNewSuggestion();
	newsuggestion.save(function(err, sugg, count) {
		res.redirect('/home');
	});
});

app.post('/registerPost', function(req, res) {
	var user = new UserEntry(req, res);
	var newUser = user.addNewUser();
	newUser.save(function(err, user, count) {
		res.redirect('/login');
	});
});

app.get('/information', function(req, res) {
	var user = new Officer(req.user);
	var isOfficer = user.isOfficer();
	res.render('information', {user: req.user, officer: isOfficer});
});

app.listen(15090);