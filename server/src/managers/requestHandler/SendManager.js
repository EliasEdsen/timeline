let _Common_ = require('../../common/Common.js');
class SendManager extends _Common_ {
  constructor() {
    super();
  }

  call(RTI) {
    return this.send(RTI);
  }

  send(RTI) {
    this.setStatusCode(RTI);
    this.setResponse(RTI);
    this.addTime(RTI);
    this._send(RTI);

    return;
  }

  _send(RTI) {
    if (_.isExist(RTI.res)) {
      if (_.isExist(RTI.result.file)) {
        RTI.res.status(RTI.statusCode).header('Access-Control-Allow-Origin', RTI.req.headers.Xorigin).header('Access-Control-Allow-Credentials', true).sendFile(RTI.result.file);
      } else {
        RTI.res.status(RTI.statusCode).header('Access-Control-Allow-Origin', RTI.req.headers.origin).header('Access-Control-Allow-Credentials', true).send(JSON.stringify(RTI.result));
      }
    }

    RTI = null;

    return;
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  setStatusCode(RTI) {
    let statusCode = 200;

    if (_.isExist(RTI.error)) {
      statusCode = 500;

      if (_.isExist(RTI.error.statusCode)) {
        statusCode = RTI.error.statusCode;
      }
    }

    if (!_.isExist(RTI.statusCode)) { RTI.statusCode = statusCode; }
  }

  setResponse(RTI) {
    if (_.isExist(RTI.error))   { RTI.result = RTI.error; }
    if (!_.isExist(RTI.result)) { RTI.result = {};        }
  }

  addTime(RTI) {
    // if (_.isExist(RTI.result) && _.isExist(RTI.result.user) && _.isExist(RTI.result.user.state)) {
    //   RTI.result.user.state.time = DateModule.time();
    // }
  }
}

module.exports = new SendManager;
