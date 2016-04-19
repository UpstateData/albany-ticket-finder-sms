var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var async = require('async');
var twilio = require('twilio')(process.env.sid, process.env.auth_token);

var url_base = 'https://data.albanyny.gov/resource/474r-rd62.json?license_plate_number=[number]&$select=*';

var response_template = 'Citation #: [number]. Amount: $[amount]. Date issued: [date].'

var port = process.argv[2] || 3000;
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port, function() {
	console.log('listening on port: ' + port);
});

app.post('/ticket-finder', function(req, res) {

	// Create a settings object with details of the inbound SMS message.
	var settings = {
		plate_number: req.body.Body.replace( /\s/g, ""),
		from_number: req.body.From,
		to_number: req.body.To,
	}

	// Lookup citations, send details and finish with link to online payment.
	async.waterfall([
		async.apply(getCitations, settings),
		parseCitations
		], 
		function(error, settings) {
			if(error) {
				twilio.sendMessage({ to: settings.from_number, from: settings.to_number, body: 'Sorry. An error occured. Please try again later.' });
			}
			else {
				twilio.sendMessage({ to: settings.from_number, from: settings.to_number, body: settings.response });
			}
	});

});

// Get all citations for a given plate number.
function getCitations(settings, callback) {
	request(url_base.replace('[number]', settings.plate_number), function(error, response, body) {
		callback(error, body, settings);
	});
}

// Construct reponse based on the number of tickets found.
function parseCitations(body, settings, callback) {
	var results = JSON.parse(body);
	if(results.length == 0) {
		settings.response = 'No tickets found';
	}
	else if (results.length == 1){
		settings.response = response_template
			.replace('[number]', formatCitationNumber(results[0].citation))
			.replace('[amount]', results[0].remaining_balance)
			.replace('[date]', formatDate(results[0].issue_date));
		settings.response += ' Pay online at http://www.albanyny.org/Home/Payments.aspx.'
	}
	else {
		settings.response = results.length + ' tickets found. Go to http://capitaltickets.org for more information.' 
	}
	callback(null, settings);
}

// Utility method to format date.
function formatDate(date) {
	var d = new Date(date)
	return d.getMonth()+1 + '/' + d.getDate() + '/' + d.getFullYear();
}

// Format citation properly if no citation number found.
function formatCitationNumber(number) {
	if(typeof(number) != 'undefined') {
		return number;
	}
	return 'Not found';
}