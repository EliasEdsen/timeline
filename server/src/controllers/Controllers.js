let _Common_ = require('../common/Common.js')

class Controllers extends _Common_ {
  constructor() {
    super()

    global.UserController = require('../user/UserController.js')
  }
}

module.exports = new Controllers;
