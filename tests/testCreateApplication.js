var page = require('webpage').create();
page.settings.userAgent = 'SpecialAgent';
var homeUrl = 'http://i6.cims.nyu.edu:15090/applications/create';
page.open(homeUrl);
var testsPassed = 0;
var testsFailed = 0;
page.onLoadFinished = function(status) {
	if (status !== 'success') {
		console.log('Unabled to connect to: ' + homeUrl);
		testsFailed++;
		phantom.exit();
	}
	checkHeader(page);

	var labels = page.evaluate(function() {
		return document.getElementsByTagName('label');
	});

	if (labels.length === 5) {
		console.log('Create App labels checked. Pass');
		testsPassed++;
	} else {
		console.log('Create App labels checked. Fail');
		testsFailed++;
	}

	var inputs = page.evaluate(function() {
		return document.getElementsByTagName('input');
	});

	if (inputs.length === 6) {
		console.log('Create App inputs checked. Pass');
		testsPassed++;
	} else {
		console.log('Create App inputs checked. Fail');
		testsFailed++;
	}

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