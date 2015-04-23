'use strict';

const promisify = require('promisify-node');
const github = require('./github');

let getFiles = promisify(github.pullRequests).getFiles;

function prContainsCss(pr) {
	let msg = (typeof pr === 'string') ? parseString(pr) : pr;

	return getFiles(msg)
		.then(function (files) {
			return files.some(function (file) {
				return /\.css$/.test(file.filename);
			});
		});
}

function parseString(pr) {
	pr = pr.split('/');
	pr[1] = pr[1].split('#');

	return {
		user: pr[0],
		repo: pr[1][0],
		number: Number(pr[1][1])
	};
}

module.exports = prContainsCss;
module.exports.parseString = parseString;
