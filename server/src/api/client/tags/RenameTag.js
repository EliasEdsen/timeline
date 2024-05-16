let _Common_ = require('../../../common/Common.js');

class RenameTag extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    let id    = RTI.body.id;
    let text  = RTI.body.text;

    // TODO добавить проверку пришли ли данные, на все участки всего сайта! а не только здесь
    if (_.isNil(id))   { /* InformManager.notification(RTI, 1012); */ return next(RTI); }
    if (_.isNil(text)) { /* InformManager.notification(RTI, 1012); */ return next(RTI); }

    return UserController.find(RTI, (error, RTI) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.find`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      let _async = []

      _async.push((callback) => {
        return POSTGRESManager.update_stage(RTI, {[RTI.User.languages[0]]: text}, 'tags', {id: id}, undefined, callback);
      });

      _async.push((callback) => {
        return POSTGRESManager.select_stage(RTI, [`id, ${RTI.User.languages[0]}`], 'tags', undefined, undefined, callback);
      });

      return async.series(_async, (error, results) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.start`, undefined, error);
            ResponseManager.error(RTI, error);
          }
          return next(RTI);
        }

        ResponseManager.add(RTI, {tags: results[1]})

        return next(RTI);
      });
    });
  }
}

module.exports = RenameTag;
