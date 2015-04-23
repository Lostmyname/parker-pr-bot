'use strict';

const http = require('http');
const createHandler = require('github-webhook-handler');
const humps = require('humps');

const config = require('./config');
const getFileFromBranch = require('./get-file');
const prContainsCss = require('./pr-contains-css');

let handler = createHandler({ path: '/', secret: config.github.hookSecret });

let server = http.createServer(function (req, res) {
	handler(req, res, function () {});
});

server.listen(config.server.port, config.server.hostname);

handler.on('error', function (err) {
	console.error('Error:', err.message);
});

handler.on('pull_request', function (event) {
	let payload = humps.camelizeKeys(event.payload);
	let pr = payload.pullRequest;

	if (config.github.runOn.indexOf(payload.action) === -1) {
		return;
	}

	let msg = {
		user: pr.head.repo.owner.login,
		repo: pr.head.repo.name,
		number: pr.number
	};

	let baseRef = pr.base.ref;
	let headRef = pr.head.ref;

	prContainsCss(msg)
		.then(function (containsCss) {
			console.log('Contains css:', containsCss);

			return getFileFromBranch(baseRef, config.parker.filename);
		})
		.then(function (data) {
			console.log('Master file:', data.toString());

			return getFileFromBranch(headRef, config.parker.filename);
		})
		.then(function (data) {
			console.log('otherBranch file:', data.toString());
		});
});
