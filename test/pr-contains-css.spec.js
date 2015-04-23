'use strict';

const prContainsCss = require('../src/pr-contains-css');

describe('diff-contains-css()', function () {
	it('should parse strings', function () {
		prContainsCss.parseString('abcdefg/hi-jklm#103').should.eql({
			user: 'abcdefg',
			repo: 'hi-jklm',
			number: 103
		});
	});

	it('should detect when pr contains css', function () {
		return prContainsCss('callumacrae/test-hook#4')
			.then(function (containsCss) {
				containsCss.should.equal(true);
			});
	});

	it('should detect when pr does not contain css', function () {
		return prContainsCss('callumacrae/test-hook#1')
			.then(function (containsCss) {
				containsCss.should.equal(false);
			});
	});
});
