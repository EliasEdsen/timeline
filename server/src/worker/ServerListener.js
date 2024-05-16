let _Common_ = require('../common/Common.js')

class ServerListener extends _Common_ {
  constructor(Worker) {
    super()

    this.Worker = Worker
  }

  initialization() {
    _.defer(() => {
      this.listen()
    });
  }

  listen() {
    app.listen(config.server.port, () => {
      InformManager.information(`Worker (ID:${cluster.worker.id}, PID:${process.pid}, PPID:${process.ppid}) listening the app on port ${config.server.port}`);

      app.route('*')
        .all((req, res) => {
          return RequestHandlerManager.regular(req, res);
        });
    });
  }
}

module.exports = ServerListener;
