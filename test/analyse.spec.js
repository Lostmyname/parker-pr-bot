'use strict';

const _ = require('lodash');
const promisify = require('promisify-node');
const fs = promisify(require('graceful-fs'));

const analyse = require('../src/analyse');

const files = {
	testOut: fs.readFileSync('./test/fixtures/test-out.css').toString(),
	bad: fs.readFileSync('./test/fixtures/bad.css').toString()
};

const baseObject = { good: {}, warn: {}, bad: {} };

describe('analyse()', function () {
	it('should stay quiet on identical files', function () {
		analyse(files.testOut, files.testOut).should.eql(baseObject);
	});

	it('should stay quiet when nothing bad has changed', function () {
		let newFile = files.testOut + ' .bla { foo: foo }';
		analyse(files.testOut, newFile).should.eql(baseObject);
	});

	it('should return when bad stuff happens', function () {
		let output = _.cloneDeep(baseObject);
		output.bad = {
			'top-selector-specificity': {
				difference: '+10',
				now: 110,
				was: 100
			},
			'total-id-selectors': {
				difference: '+1',
				now: 1,
				was: 0
			}
		};

		analyse(files.testOut, files.bad).should.eql(output);
	});

	it('should return when good stuff happens', function () {
		let output = _.cloneDeep(baseObject);
		output.good = {
			'top-selector-specificity': {
				difference: '-10',
				now: 100,
				was: 110
			},
			'total-id-selectors': {
				difference: '-1',
				now: 0,
				was: 1
			}
		};

		analyse(files.bad, files.testOut).should.eql(output);
	});
});
