var mongoose = require('mongoose'),
	URLSlugs = require('mongoose-url-slugs');

var Application = new mongoose.Schema({
	CharacterName: String,
	Class: String,
	Specialization: String,
	ArmoryUrl: String,
	Email: String,
	submittedDate: Date
});

var Suggestion = new mongoose.Schema({
	UserSuggestions: String,
	submittedDate: Date
});

var User = new mongoose.Schema({
	Username: String,
	Password: String,
	Officer: Boolean
});

Application.plugin(URLSlugs('CharacterName'));

mongoose.model('Application', Application);
mongoose.model('Suggestion', Suggestion);
mongoose.model('User', User);
var dbconf;
if (process.env.NODE_ENV == 'PRODUCTION') {
	console.log('here');
	var fs = require('fs');
	var path = require('path');
	var fn = path.join(__dirname, 'config.json');
	var data = fs.readFileSync(fn);

	var conf = JSON.parse(data);
	dbconf = conf.dbconf;
} else {
	dbconf = 'mongodb://localhost/finalproject';
}

mongoose.connect(dbconf);