'use strict';

const http = require('http');
const createHandler = require('github-webhook-handler');
const github = require('./github');
const humps = require('humps');
const promisify = require('promisify-node');
const winston = require('winston');

const config = require('./config');
const analyse = require('./analyse');
const generateComment = require('./comment');
const getFileFromBranch = require('./get-file');
const prContainsCss = require('./pr-contains-css');

let createComment = promisify(github.issues).createComment;

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

	winston.info('Activity on PR #%s. Analysing.', pr.number);

	let msg = {
		user: pr.head.repo.owner.login,
		repo: pr.head.repo.name,
		number: pr.number
	};

	let masterFile, branchFile;

	prContainsCss(msg)
		.then(function (containsCss) {
			if (!containsCss) {
				winston.info('PR #%s contains no CSS, aborting', pr.number);
				throw new Error('No CSS: abort early');
			}

			return getFileFromBranch(pr.base.ref, config.parker.filename);
		})
		.then(function (data) {
			masterFile = data;

			return getFileFromBranch(pr.head.ref, config.parker.filename);
		})
		.then(function (data) {
			branchFile = data;

			winston.info('Got files for PR #%s, analysing', pr.number);

			return analyse(masterFile.toString(), branchFile.toString());
		})
		.then(function (judgement) {
			if (!judgement.bad && !judgement.warn) {
				throw new Error('No errors: abort early');
			}

			winston.info('PR #%s is not okay :( commenting now!', pr.number);

			return generateComment(judgement);
		})
		.then(function (comment) {
			msg.body = comment;
			return createComment(msg);
		})
		.then(function () {
			winston.info('Okay, commented on PR #%s.', pr.number);
		})
		.catch(function (err) {
			if (err.message.indexOf('abort early') === -1) {
				winston.error(err);
			}
		});
});
