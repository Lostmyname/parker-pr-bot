'use strict';

const GitHubApi = require('github');
const config = require('./config');

let github = module.exports = new GitHubApi({
	version: '3.0.0'
});

github.authenticate({
	type: 'oauth',
	token: config.github.token
});
