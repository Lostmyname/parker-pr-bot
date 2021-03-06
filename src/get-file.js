'use strict';

const path = require('path');
const git = require('nodegit');
const promisify = require('promisify-node');
const exec = promisify(require('child_process').exec);
const fs = promisify(require('graceful-fs'));
const winston = require('winston');

const config = require('./config');

let remoteCallbacks = {
	certificateCheck: function () {
		return 1;
	},
	credentials: function (url, username) {
		return git.Cred.sshKeyFromAgent(username);
	}
};

function getFileFromBranch(branch, filePath) {
	let repo;

	return git.Repository.open(config.git.cloneTo)
		.catch(function (err) {
			if (err.message.startsWith('Failed to resolve')) {
				winston.info('Repo not found, cloning');
				return git.Clone(config.git.repo, config.git.cloneTo, {
					remoteCallbacks: remoteCallbacks
				});
			} else {
				winston.error(err);
				throw err;
			}
		})
		.then(function (repository) {
			repo = repository;

			return repo.fetch('origin', remoteCallbacks, true);
		})
		.then(function () {
			winston.log('verbose', 'Changing branch');
			return repo.checkoutBranch(branch);
		})
		.catch(function (err) {
			if (/Reference '([^']+)' not found/.test(err.message)) {
				winston.info('Branch not found, fetching');

				return repo.getBranchCommit('origin/' + branch)
					.then(function (commit) {
						return repo.createBranch(branch, commit, 0);
					})
					.then(function () {
						return repo.checkoutBranch(branch);
					});
			} else {
				winston.error(err);
				throw err;
			}
		})
		.then(function () {
			return repo.mergeBranches(branch, 'origin/' + branch);
		})
		.then(function () {
			if (!config.parker.build) {
				return;
			}

			let build = [].concat(config.parker.build);
			let options = { cwd: config.git.cloneTo };
			let initialPromise = exec(build.splice(0, 1), options);

			return build.reduce(function (promise, command) {
				return promise.then(function () {
					return exec(command, options);
				});
			}, initialPromise);
		})
		.then(function () {
			return fs.readFile(path.join(config.git.cloneTo, filePath));
		});
}

module.exports = getFileFromBranch;
