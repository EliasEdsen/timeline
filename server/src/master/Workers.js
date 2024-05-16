let _Common_ = require('../common/Common.js')

class Workers extends _Common_ {
  constructor(Master) {
    super();

    this.Master = Master;

    this.cpuCount = 'auto';
  }

  initialization() {
    this.setCPUCount();
    this.startWorkers();
    this.listenClusterExit();
  }

  setCPUCount() {
    if (global.config.workers == 'auto') {
      var os = require('os');
      this.cpuCount = os.cpus().length;
    } else {
      this.cpuCount = global.config.workers;
    }
  }

  startWorkers() {
    for (let i = 0; i < this.cpuCount; i++) {
      cluster.fork();
    }
  }

  listenClusterExit() {
    cluster.on('exit', (Worker, code, signal) => {
      let information = {};
      if (code)   { information.code   = code;   }
      if (signal) { information.signal = signal; }
      InformManager.information(`Worker (ID:${Worker.id}) died`, undefined, information);
      cluster.fork();
    });
  }
}

module.exports = Workers;
