let _Common_ = require('../common/Common.js')

class Modules extends _Common_ {
  constructor() {
    super()

    global.DateModule          = require('./DateModule.js')
    global.ValuesHandlerModule = require('./ValuesHandlerModule.js')
  }
}

module.exports = new Modules;
