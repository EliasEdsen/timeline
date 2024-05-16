let _Common_ = require('../common/Common.js')

class EventManager extends _Common_ {
  constructor() {
    super();
  }

  initialization() {
    this.listen();
  }

  listen() {
    if (cluster.isMaster) { cluster.on('message',        this.parseMessageMaster.bind(this)); }
    if (cluster.isWorker) { cluster.worker.on('message', this.parseMessageWorker.bind(this)); }
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  parseMessageMaster(Worker, data) {
    if (this.getIsBreakData(data)) { return; }

    InformManager.information(`Worker (ID:${Worker.id}) send data to Master`, undefined, data);
  }

  parseMessageWorker(data) {
    InformManager.information(`Master send data to Worker (ID:${cluster.worker.id})`, undefined, data);
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  send(...args) {
    if (cluster.isMaster) {
      this.sendMaster(args[0], args[1]);
    } else {
      this.sendWorker(args[0]);
    }
  }

  sendMaster(workerID, data) {
    let Worker = null;

    if (_.isObject(workerID) && _.isExist(workerID.id)) {
      Worker = workerID;
    } else {
      Worker = cluster.workers[workerID];
    }

    if (!_.isExist(Worker)) {
      InformManager.error('EventManager.sendMaster', undefined, new Error(`Worker hasn't found.`));
    }  else {
      Worker.process.send(data);
    }
  }

  sendWorker(data) {
    process.send(data);
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  getIsBreakData(data) {
    // break pm2 monitor
    let bool1 = _.isExist(data) && data.hasOwnProperty('type') && _.isString(data.type) && (data.type.search('axm:') == 0 || _.includes(['application:dependencies'], data.type));

    return bool1; // || bool2 || bool3
  }
}

module.exports = new EventManager;
