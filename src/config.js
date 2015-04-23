const fs = require('graceful-fs');
const humps = require('humps');
const yaml = require('js-yaml');

module.exports = humps.camelizeKeys(yaml.load(fs.readFileSync('./config.yml')));
