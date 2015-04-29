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

		config.parker.build = '';
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

	// Only works if branch is already "test"
	it('should ensure build commands have ran', function () {
		config.parker.build = [
			'echo "abc" > test.css',
			'echo "def" >> test.css'
		];

		return getFileFromBranch('test', 'test.css')
			.then(function (data) {
				data.toString().should.equal('abc\ndef\n');
			});
	});

	it('should ensure failure when build fails', function (done) {
		config.parker.build = 'blablanotfound';

		return getFileFromBranch('test', 'test.css')
			.catch(function (err) {
				err.toString().should.containEql('command not found');
				done();
			});
	});
});
