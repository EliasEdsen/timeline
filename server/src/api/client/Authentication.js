let _Common_ = require('../../common/Common.js');

class Authentication extends _Common_ {
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
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.find`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      return POSTGRESManager.select_stage(RTI, ['*'], 'users', {email, password}, ['LIMIT 1'], (error, rows) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.select`, undefined, error);
            ResponseManager.error(RTI, error);
          }
          return next(RTI);
        }

        if (_.isEmpty(rows)) {
          let notification = InformManager.notification(RTI, 2); // Пользователя с такими данными на существует
          ResponseManager.notification(RTI, notification);
          return next(RTI);
        } else {
          let stage = rows[0];

          if (stage.id == RTI.User.id) {
            UserController.saveSecureInCookie(RTI, RTI.User.secure);
            return next(RTI);
          } else {
            return UserController.removeUser(RTI, () => {
              UserController.createUserByStage(RTI, stage);

              let hash = UserController.getHash(RTI);
              let id   = RTI.User.id;

              RTI.User.hashes.push(hash);

              UserController.saveHashInRedis(RTI, hash, id);
              UserController.saveHashInPostgres(RTI, hash, id);
              UserController.saveHashInCookie(RTI, hash, id);

              UserController.saveSecureInCookie(RTI, RTI.User.secure);

              return UserController.save(RTI, (error, RTI, rows) => {
                if (error) {
                  if (_.isError(error)) {
                    error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.save`, undefined, error);
                    ResponseManager.error(RTI, error);
                  }
                }

                ResponseManager.add(RTI, {user: RTI.User.getIdentificationStage()})

                return next(RTI);
              });
            });
          }
        }
      });
    });
  }
}

module.exports = Authentication;
