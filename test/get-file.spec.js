'use strict';

const del = require('del');
const promisify = require('promisify-node');
const fs = promisify(require('graceful-fs'));

const logMsgs = require('./_log-msgs');

const config = require('../src/config');
const getFileFromBranch = require('../src/get-file');

describe('get-file()', function () {
	before(function (done) {
		del('./test/fixtures/repository', done);

		config.git.cloneTo = './test/fixtures/repository';
		config.git.repo = 'git@github.com:callumacrae/test-hook.git';
	});

	this.timeout(5000);

	it('should clone and get file', function () {
		let testCss;

		return getFileFromBranch('master', 'test.css')
			.then(function (data) {
				testCss = data;

				logMsgs.pop().should.eql({
					level: 'info',
					msg: 'Repo not found, cloning'
				});

				return fs.readFile('./test/fixtures/test-out.css');
			})
			.then(function (testOutCss) {
				testCss.should.eql(testOutCss);
			});
	});

	it('should get file from other branch', function () {
		return getFileFromBranch('test', 'test.css')
			.then(function (data) {
				logMsgs.pop().should.eql({
					level: 'info',
					msg: 'Branch not found, fetching'
				});

				data.toString().should.equal('/* fake css for test */\n');
			});
	});
});
