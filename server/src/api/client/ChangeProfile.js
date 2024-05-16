let _Common_ = require('../../common/Common.js');

class ChangeProfile extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    let name      = RTI.body.name;
    let email     = RTI.body.email;
    let password  = RTI.body.password;
    let languages = RTI.body.languages;

    if (_.isNil(name)) {
      // InformManager.notification(RTI, 1012); // Недостаточно данных
      return next(RTI);
    }

    if (_.isNil(email)) {
      // InformManager.notification(RTI, 1012); // Недостаточно данных
      return next(RTI);
    }

    if (_.isNil(password)) {
      // InformManager.notification(RTI, 1012); // Недостаточно данных
      return next(RTI);
    }

    if (_.isNil(languages)) {
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

      let cookieSecure = UserController.getSecure(RTI);
      if (_.isNil(cookieSecure) || RTI.User.secure != cookieSecure) {
        let notification = InformManager.notification(RTI, 3); // Необходимо залогиниться
        ResponseManager.notification(RTI, notification);
        UserController.deleteSecureInCookie(RTI);
        ResponseManager.add(RTI, {redirect: {path: '/authentication', query: {redirect: '/profile'}}});
        return next(RTI);
      }

      RTI.User.name      = name;
      RTI.User.email     = email;
      RTI.User.password  = password;
      RTI.User.languages = languages;

      return UserController.save(RTI, (error, RTI, rows) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.save`, undefined, error);
            ResponseManager.error(RTI, error);
          }
        }

        let stage = rows[0];

        if (_.isExist(stage) && _.isExist(stage.password)) { delete stage.password; }

        ResponseManager.add(RTI, {user: stage});

        return next(RTI);
      });

    });
  }
}

module.exports = ChangeProfile;
