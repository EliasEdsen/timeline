let _Common_ = require('../common/Common.js')

class REDISManager extends _Common_ {
  constructor() {
    super();
  }

  initialization() {
    super.initialization();
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  HSET(key, field, value, callback = (error, result) => {}) {
    return REDIS.HSET(key, field, value.toString())
      .then((result) => {                                                                       return callback(undefined, result); })
      .catch((error) => { error.query = JSON.stringify({key: key, field: field, value: value}); return callback(error);             });
  }

  HGET(key, field, callback = (error, result) => {}) {
    return REDIS.HGET(key, field)
      .then((result) => {                                                         return callback(undefined, result); })
      .catch((error) => { error.query = JSON.stringify({key: key, field: field}); return callback(error);             });
  }
}

module.exports = new REDISManager;
