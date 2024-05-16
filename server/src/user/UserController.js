let _Common_ = require('../common/Common.js');
const CookieManager = require('../managers/CookieManager.js');
let _User_   = require('./User.js');

class UserController extends _Common_ {
  constructor() {
    super();
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  findAndCreate(RTI, callback) {
    return this.start(RTI, 'FindAndCreate', callback);
  }

  find(RTI, callback) {
    return this.start(RTI, 'Find', callback);
  }

  start(RTI, type, callback) {
    if (_.isNil(type) || _.isEmpty(type)) {
      let error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.type`, undefined, new Error('Need type for UserController.'));
      ResponseManager.error(RTI, error);
      return callback(error, RTI);
    }

    let hash = this.getHash(RTI);

    if (_.isExist(hash)) {
      // ищем id юзера
      return this.lookingForID(RTI, type, hash, callback)
    } else {
      // создаем юзера
      if (type == 'FindAndCreate') {
        return this.createUser(RTI, callback);
      }

      // ошибка
      if (type == 'Find') {
        let error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.hash`, undefined, new Error('Not have the hash.'));
        ResponseManager.error(RTI, error);
        return callback(error, RTI);
      }
    }
  }

  /*****/

  lookingForID(RTI, type, hash, callback) {
    return this.getID(RTI, hash, (error, id) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.lookingForID.id`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return callback(error, RTI);
      }

      if (_.isExist(id) && _.isNumber(id) && _.isFinite(id) && id > 0) {
        return this.lookingForUser(RTI, type, hash, id, callback);
      } else {
        // создаем юзера
        if (type == 'FindAndCreate') {
          return this.createUser(RTI, callback)
        }

        // ошибка
        if (type == 'Find') {
          let error = InformManager.errorRTI(RTI, `${this.constructor.name}.lookingForID.hash`, undefined, new Error(`Haven't found the UserID.`));
          ResponseManager.error(RTI, error);
          return callback(error, RTI);
        }
      }
    })
  }

  lookingForUser(RTI, type, hash, id, callback) {
    return POSTGRESManager.select_stage(RTI, ['*'], 'users', {id: id}, ['LIMIT 1'], (error, rows) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.lookingForUser.select_stage`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return callback(error, RTI);
      }

      let stage = rows[0];

      if (_.isNil(stage)) {
        // создаем юзера
        if (type == 'FindAndCreate') {
          return this.createUser(RTI, callback);
        }

        // ошибка
        if (type == 'Find') {
          let error = InformManager.errorRTI(RTI, `${this.constructor.name}.lookingForUser.hash`, undefined, new Error(`User stage is empty.`));
          ResponseManager.error(RTI, error);
          return callback(error, RTI);
        }
      }

      RTI.contents = ContentsManager.getState('all');

      this.createUserByStage(RTI, stage);

      // TODO re-save user stage

      if (RTI.url == '/api/client/identification') {
        this.saveHashInRedis(RTI, hash, id);
        this.trySaveHashInPostgres(RTI, hash, id);
        this.saveHashInCookie(RTI, hash, id);
      }

      return callback(undefined, RTI);
    });
  }

  /*****/

  createUser(RTI, callback) {
    RTI.contents = ContentsManager.getState('all');

    RTI.User = new _User_(RTI);

    let stage = RTI.User.get_stage();

    let stage_copy = _.cloneDeep(stage);
    delete stage_copy.id

    return POSTGRESManager.insert_stage(RTI, stage_copy, 'users', ['RETURNING *'], (error, rows) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.createUser`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return callback(error, RTI);
      }

      stage = rows[0];

      RTI.User.set_state(stage);

      let hash = RTI.User.hashes[0];
      let id   = RTI.User.id;

      this.saveHashInRedis(RTI, hash, id);
      this.saveHashInPostgres(RTI, hash, id);
      this.saveHashInCookie(RTI, hash, id);

      return callback(undefined, RTI);
    });
  }

  createUserByStage(RTI, stage) {
    RTI.User = new _User_(RTI, stage);
  }

  /*****/     /*****/     /*****/

  save(RTI, callback = () => {}) {
    let result = {};

    let stage = RTI.User.get_stage();

    let keys = Object.keys(stage);

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let val = stage[key];

      if (!_.isEqual(RTI.User.first_stage[key], val)) { result[key] = val }
    }

    delete result.id;

    if (_.isEmpty(result)) { return callback(undefined, RTI, []); }

    let returning = _.chain(result).keys().join(', ').value();

    return POSTGRESManager.update_stage(RTI, result, 'users', {id: RTI.User.id}, [`RETURNING ${returning}`], (error, rows) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.save`, undefined, error);
          ResponseManager.error(RTI, error);
        }

        return callback(error, RTI, rows);
      }

      return callback(undefined, RTI, rows);
    });
  }

  /*****/     /*****/     /*****/

  delete(RTI, callback = () => {}) {
    return POSTGRESManager.delete_stage(RTI, 'users', {id: RTI.User.id}, undefined, (error, rows) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.delete`, undefined, error);
          ResponseManager.error(RTI, error);
        }

        return callback(error, RTI, rows);
      }

      return callback(undefined, RTI, rows);
    });
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  saveHashInRedis(RTI, hash, id) {
    return REDISManager.HSET('hashes', hash, id, (error, result) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.saveHashInRedis`, undefined, error);
          ResponseManager.error(RTI, error);
        }
      }

      return null;
    });
  }

  trySaveHashInPostgres(RTI, hash, id) {
    return POSTGRESManager.select_stage(RTI, ['id'], 'hashes', {hash: hash}, ['LIMIT 1'], (error, rows) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.trySaveHashInPostgres`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return callback(error);
      }

      if (!_.isEmpty(rows) && _.isExist(rows[0].id)) {
        return null;
      } else {
        return this.saveHashInPostgres(RTI, hash, id);
      }
    });
  }

  saveHashInPostgres(RTI, hash, id) {
    return POSTGRESManager.insert_stage(RTI, {hash: hash, id: id}, 'hashes', [], (error, rows) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.saveHashInPostgres`, undefined, error);
          ResponseManager.error(RTI, error);
        }
      }

      return null;
    });
  }

  saveHashInCookie(RTI, hash, id) {
    return CookieManager.save(RTI, 'hash', hash);
  }

  saveSecureInCookie(RTI, secure) {
    return CookieManager.save(RTI, 'secure', secure);
  }

  deleteSecureInCookie(RTI) {
    return CookieManager.delete(RTI, 'secure');
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  getHash(RTI)   { return RTI.cookies.hash;   }
  getSecure(RTI) { return RTI.cookies.secure; }

  getID(RTI, hash, callback) {
    return REDISManager.HGET('hashes', hash, (error, result) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.getID.redis`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return callback(error);
      }

      if (_.isExist(result)) { return callback(undefined, Number(result)); }

      return POSTGRESManager.select_stage(RTI, ['id'], 'hashes', {hash: hash}, ['LIMIT 1'], (error, rows) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.getID.postgres`, undefined, error);
            ResponseManager.error(RTI, error);
          }
          return callback(error);
        }

        if (!_.isEmpty(rows) && _.isExist(rows[0].id)) {
          return callback(undefined, Number(rows[0].id));
        } else {
          return callback(undefined, null);
        }
      });
    });
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  removeUser(RTI, callback) {
    let _async = [];
    _async.push((callback1) => { return POSTGRESManager.delete_stage(RTI, 'users', {id: RTI.User.id}, undefined, callback1); })

    for (let indexOfHashes = 0; indexOfHashes < RTI.User.hashes.length; indexOfHashes++) {
      let hash = RTI.User.hashes[indexOfHashes];
      _async.push((callback1) => { return POSTGRESManager.delete_stage(RTI, 'hashes', {hash}, undefined, callback1); })
    }

    return async.parallel(_async, callback);
  }
}

module.exports = new UserController;
