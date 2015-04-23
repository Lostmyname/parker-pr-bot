'use strict';

const Parker = require('parker/lib/Parker');
const metrics = require('parker/metrics/All');
const parker = new Parker(metrics);

const _ = require('lodash');
const humps = require('humps');

const config = require('./config');

function analyse(masterFile, branchFile) {
	let masterMetrics = runParker(masterFile);
	let branchMetrics = runParker(branchFile);

	let testMetrics = humps.decamelizeKeys(config.parker.metrics, '-');
	let judgements = { good: {}, warn: {}, bad: {} };

	_.each(testMetrics, function (judgement, metric) {
		let difference = branchMetrics[metric] - masterMetrics[metric];

		let stats = {
			was: masterMetrics[metric],
			now: branchMetrics[metric],
			difference: (difference > 0 ? '+' : '') + difference
		};

		if (difference >= judgement.bad) {
			judgements.bad[metric] = stats;
		} else if (difference >= judgement.warn) {
			judgements.warn[metric] = stats;
		} else if (difference <= judgement.good) {
			judgements.good[metric] = stats;
		}
	});

	return judgements;
}

function runParker(file) {
	return parker.run(file);
}

module.exports = analyse;
