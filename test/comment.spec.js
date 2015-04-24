'use strict';

const generateComment = require('../src/comment');

describe('generate-comment()', function () {
	it('should work', function () {
		generateComment({
			good: {},
			warn: {},
			bad:
			{
				'top-selector-specificity': { was: 100, now: 110, difference: '+10' },
				'total-id-selectors': { was: 0, now: 1, difference: '+1' }
			}
		}).should.equal(['#### There were some problems with the CSS in your PR :(',
			'', 'These things are pretty bad:', '',
			'| Metric                   | Was | Now         |',
			'| ------------------------ | --- | ----------- |',
			'| top-selector-specificity | 100 | 110 (*+10*) |',
			'| total-id-selectors       | 0   | 1 (*+1*)    |'].join('\n'));
	});
});
