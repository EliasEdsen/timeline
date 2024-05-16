let _Common_ = require('../../../common/Common.js');

class removePoints extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    return async.parallel([
      ((callback) => { return POSTGRESManager.delete_stage(RTI, 'points',       undefined, undefined, callback); }),
      ((callback) => { return POSTGRESManager.delete_stage(RTI, 'descriptions', undefined, undefined, callback); }),
      ((callback) => { return POSTGRESManager.delete_stage(RTI, 'tags',         undefined, undefined, callback); }),
      ((callback) => { return POSTGRESManager.delete_stage(RTI, 'urls',         undefined, undefined, callback); })
    ])

    let id = RTI.body.id;

    // return POSTGRESManager.update_stage(RTI, {is_removed: true}, 'points', {id: id}, undefined, (error, rows) => {
    return POSTGRESManager.delete_stage(RTI, 'points', {id: id}, undefined, (error, rows) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.point`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      return next(RTI);
    });
  }
}

module.exports = removePoints;
