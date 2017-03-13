var page = require('webpage').create();
page.settings.userAgent = 'SpecialAgent';
var homeUrl = 'http://i6.cims.nyu.edu:15090/applications';
page.open(homeUrl);
var testsPassed = 0;
var testsFailed = 0;
page.onNavigationRequested = function(url, type, willNavigate, main) {
	if (url === 'http://i6.cims.nyu.edu:15090/applications/create' && type === 'LinkClicked') {
		console.log('Create App link destination checked. Pass');
		testsPassed++;
	} else if (url !== 'about:blank') {
		console.log('Create App link destination checked. Fail');
		testsFailed++;
	}
}
page.onLoadFinished = function(status) {
	if (status !== 'success') {
		console.log('Unabled to connect to: ' + homeUrl);
		testsFailed++;
		phantom.exit();
	}
	checkHeader(page);

	var createAppLink = page.evaluate(function() {
		return document.getElementById('createAppLink');
	});

	if (createAppLink && createAppLink.innerHTML === 'Submit an Application') {
		console.log('Create App link checked. Pass');
		testsPassed++;
	} else {
		console.log('Create App link checked. Fail');
		testsFailed++;
	}
	
	page.evaluate(function() {
		createAppLink.click();
	});

	console.log('All tests finished for: ' + homeUrl);
	console.log('Tests failed: ' + testsFailed);
	console.log('Tests passed: ' + testsPassed);

	phantom.exit();
}

var checkHeader = function(page) {
	var title = page.evaluate(function() {
		return document.getElementById('Title');
	});

	if (title.innerHTML === 'Shattered Expectations') {
		console.log('Title checked. Pass');
		testsPassed++;
	} else {
		console.log('Title checked. Fail, expected: Shattered Expectations got: ' + title.innerHTML);
		testsFailed++;
	}

	var homeLink = page.evaluate(function() {
		return document.getElementById('homeLink');
	});

	if (homeLink) {
		console.log('Home Link checked. Pass');
		testsPassed++;
	} else {
		console.log('Home Link checked. Fail');
		testsFailed++;
	}

	var applicationsLink = page.evaluate(function() {
		return document.getElementById('applicationsLink');
	});

	if (applicationsLink) {
		console.log('Applications Link checked. Pass');
		testsPassed++;
	} else {
		console.log('Applications Link checked. Fail');
		testsFailed++;
	}

	var informationLink = page.evaluate(function() {
		return document.getElementById('informationLink');
	});

	if (informationLink) {
		console.log('Information Link checked. Pass');
		testsPassed++;
	} else {
		console.log('Information Link checked. Fail');
		testsFailed++;
	}


}