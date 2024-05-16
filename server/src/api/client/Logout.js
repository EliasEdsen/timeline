let _Common_ = require('../../common/Common.js');

class Logout extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    UserController.deleteSecureInCookie(RTI);
    return next(RTI);
  }
}

module.exports = Logout;
