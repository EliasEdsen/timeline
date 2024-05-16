let _Common_ = require('../../common/Common.js');

class Registration extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    let email    = RTI.body.email;
    let password = RTI.body.password;

    if (_.isNil(email)) {
      // InformManager.notification(RTI, 1012); // Недостаточно данных
      return next(RTI);
    }

    if (_.isNil(password)) {
      // InformManager.notification(RTI, 1012); // Недостаточно данных
      return next(RTI);
    }

    return UserController.find(RTI, (error, RTI) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.start`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      return POSTGRESManager.select_stage(RTI, ['id'], 'users', {email}, ['LIMIT 1'], (error, rows) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.find`, undefined, error);
            ResponseManager.error(RTI, error);
          }
          return next(RTI);
        }

        if (!_.isEmpty(rows) && _.isExist(rows[0].id)) {
          let notification = InformManager.notification(RTI, 1); // Данный email уже занят
          ResponseManager.notification(RTI, notification);
          return next(RTI);
        } else {
          RTI.User.name     = email;
          RTI.User.email    = email;
          RTI.User.password = password;

          UserController.saveSecureInCookie(RTI, RTI.User.secure);

          return UserController.save(RTI, (error, RTI, rows) => {
            if (error) {
              if (_.isError(error)) {
                error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.save`, undefined, error);
                ResponseManager.error(RTI, error);
              }
            }

            let stage = rows[0];

            delete stage.password;

            ResponseManager.add(RTI, {user: stage});

            return next(RTI);
          });
        }
      });
    });
  }
}

module.exports = Registration;
