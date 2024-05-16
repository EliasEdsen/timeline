let _Common_ = require('../../../common/Common.js');

class GetTags extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    return UserController.find(RTI, (error, RTI) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.find`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      return POSTGRESManager.select_stage(RTI, [`id, ${RTI.User.languages[0]}`], 'tags', undefined, undefined, (error, rows) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.start`, undefined, error);
            ResponseManager.error(RTI, error);
          }
          return next(RTI);
        }

        ResponseManager.add(RTI, {tags: rows})

        return next(RTI);
      });
    });

  }
}

module.exports = GetTags;
