'use strict';

const winston = require('winston');
const util = require('util');

const msgs = module.exports = [];

function CaptureLogger() {
	this.name = 'captureLogger';
	this.level = 'info';
}
util.inherits(CaptureLogger, winston.Transport);

CaptureLogger.prototype.log = function (level, msg, meta, callback) {
	msgs.push({ level: level, msg: msg }); // destructuring shorthand pls

	callback(null, true);
};

winston.remove(winston.transports.Console);
winston.add(CaptureLogger);
