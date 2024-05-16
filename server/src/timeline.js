global.config = require('../config.json')

global.config.version = JSON.stringify(require('../package.json').version);

global.fs = require('fs');

global.express = require('express');
global.app     = express();

global.cluster = require('cluster');

global._ = require('lodash')
_.mixin({
  isExist:   ((value)           => !_.isNil(value)),
  constrain: ((value, min, max) => value < min ? min : value > max ? max : value)
});

global.async = require('async')

global.sprintfjs = require('sprintf-js');
global.sprintf   = sprintfjs.sprintf;
global.vsprintf  = sprintfjs.vsprintf;

global.ErrorStackParser = require('error-stack-parser')

global._redis = require('redis');
global.REDIS  = _redis.createClient(config.rd);
(async () => { await REDIS.connect(); })();

const { Pool, Client } = require('pg')
global.POSTGRES = new Pool(config.db)

global.moment = require('moment');

require('./managers/Managers.js');
require('./modules/Modules.js');
require('./controllers/Controllers.js');

if (cluster.isMaster) {
  require('./master/Master.js');
} else {
  require('./worker/Worker.js');
}
