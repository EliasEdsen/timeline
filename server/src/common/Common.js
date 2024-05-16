let _Constructor_ = require('./Constructor.js')

class Common extends _Constructor_ {
  constructor() {
    super()

    _.defer(() => this.initialization())
  }

  initialization() { }
}

module.exports = Common;
