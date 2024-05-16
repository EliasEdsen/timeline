let _Common_ = require('../common/Common.js')

let _ServerListener_ = require('./ServerListener.js')

class Worker extends _Common_ {
  constructor() {
    InformManager.information(`Worker (ID:${cluster.worker.id}, PID:${process.pid}, PPID:${process.ppid}) started`);

    super()

    this.Worker = this;

    this.initializationServerListener();
  }

  initializationServerListener() { this.ServerListener = new _ServerListener_(this); }
}

module.exports = new Worker;
