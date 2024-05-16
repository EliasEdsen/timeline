let _Common_ = require('../../../common/Common.js');

class RemovePoint extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
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

module.exports = RemovePoint;
