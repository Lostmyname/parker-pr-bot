'use strict';

const _ = require('lodash');
const table = require('markdown-table');

function comment(judgement) {
	let body = ['#### There were some problems with the CSS in your PR :('];

	if (_.size(judgement.good)) {
		body.push('You did some things good:');
		body.push(turnIntoTable(judgement.good));
		body.push('----');
	}

	if (_.size(judgement.warn)) {
		body.push('You should be careful about these things:');
		body.push(turnIntoTable(judgement.warn));
		body.push('----');
	}

	if (_.size(judgement.bad)) {
		body.push('These things are pretty bad:');
		body.push(turnIntoTable(judgement.bad));
		body.push('----');
	}

	return body.slice(0, -1).join('\n\n');
}

function turnIntoTable(judgement) {
	let tableArray = [['Metric', 'Was', 'Now']];

	_.forOwn(judgement, function (diff, metric) {
		tableArray.push([metric, diff.was, diff.now + ' (*' + diff.difference + '*)']);
	});

	return table(tableArray);
}

module.exports = comment;
