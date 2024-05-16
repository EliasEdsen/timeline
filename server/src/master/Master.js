let _Common_ = require('../common/Common.js')

let _Workers_ = require('./Workers.js')

class Master extends _Common_ {
  constructor() {
    super();

    this.Master = this;

    this.initializationWorkers();
  }

  initialization() {
    this.hello();
  }

  hello() {
    InformManager.information(`Server has been started! Version: ${config.version.slice(1, -1)}`)

    InformManager.information(`Master (PID:${process.pid}, PPID:${process.ppid}) is running`)
  }

  initializationWorkers() {
    this.Workers = new _Workers_(this)
  }
}

module.exports = new Master;
